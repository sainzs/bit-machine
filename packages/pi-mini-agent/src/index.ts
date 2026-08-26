/**
 * pi-mini-agent — a bounded task runtime any agent can summon.
 *
 * Registers one tool, `mini`. Give it a brief and a budget; it runs a
 * mini-swe-agent-style loop (one shell action per step, explicit submission) in a
 * nested in-process session and returns a capped, fixed-schema result.
 *
 * The safety properties that make "summonable from anywhere" acceptable:
 *
 *  - **Depth cap.** Summoned runs receive a closed resource set with no
 *    extensions (`MiniResourceLoader`), so they cannot re-register this tool. The
 *    depth counter here is the second line of defence, not the first.
 *  - **Concurrency cap.** Parallel siblings each pay a full cache write on the
 *    shared prefix instead of one write plus reads, and pi's synchronous auth
 *    lock path busy-waits the event loop under contention. Low is correct.
 *  - **Hard budgets.** Steps, dollars and wall-clock, all checked pre-spend.
 *    Every other failure mode — a runaway loop, a hung child, a poisoned
 *    context — is bounded by these even if its specific mitigation is wrong.
 *  - **Capped envelope.** A child's output can never grow the caller's context
 *    without limit, and is framed as data rather than instructions.
 */

import { randomUUID } from "node:crypto";
import { homedir } from "node:os";
import { join } from "node:path";
import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";
import { DEFAULT_LIMITS, TreeBudget } from "./budget.ts";
import { formatEnvelope, isFailure } from "./envelope.ts";
import { hasLease, taskRequiresLease } from "./lease.ts";
import { auditSummon } from "./ledger.ts";
import { runMiniAgent } from "./runner.ts";

const DEPTH_ENV = "PI_MINI_DEPTH";
function readFiniteEnvNumber(
	name: string,
	fallback: number,
	options: { minimum: number; maximum?: number; integer?: boolean },
	invalidFallback = fallback,
): number {
	const raw = process.env[name]?.trim();
	if (!raw) return invalidFallback;
	const value = Number(raw);
	if (
		!Number.isFinite(value) ||
		value < options.minimum ||
		(options.maximum !== undefined && value > options.maximum) ||
		(options.integer && !Number.isInteger(value))
	) {
		return invalidFallback;
	}
	return value;
}

const MAX_DEPTH = readFiniteEnvNumber("PI_MINI_MAX_DEPTH", 1, { minimum: 0, maximum: 100, integer: true });
const MAX_CONCURRENCY = readFiniteEnvNumber("PI_MINI_CONCURRENCY", 2, { minimum: 1, maximum: 1024, integer: true });
/** Ceiling shared by every run summoned from this process. */
const TREE_CEILING_USD = readFiniteEnvNumber("PI_MINI_TREE_USD", 25, { minimum: 0.01, maximum: 1_000_000 });

const BASE_DIR = join(homedir(), ".pi", "agent", "mini-agent");

const currentDepth = readFiniteEnvNumber(DEPTH_ENV, 0, { minimum: 0, maximum: 100, integer: true }, MAX_DEPTH);
const treeBudget = new TreeBudget(TREE_CEILING_USD);

/** Simple FIFO semaphore. */
class Semaphore {
	private active = 0;
	private readonly waiting: Array<{
		resolve: (release: () => void) => void;
		reject: (error: unknown) => void;
		signal?: AbortSignal;
		onAbort?: () => void;
	}> = [];

	private readonly limit: number;

	constructor(limit: number) {
		this.limit = limit;
	}

	async acquire(signal?: AbortSignal): Promise<() => void> {
		if (signal?.aborted) throw signal.reason ?? new Error("Operation aborted");
		return new Promise<() => void>((resolve, reject) => {
			const waiter: {
				resolve: (release: () => void) => void;
				reject: (error: unknown) => void;
				signal?: AbortSignal;
				onAbort?: () => void;
			} = { resolve, reject, signal };
			const onAbort = () => {
				const index = this.waiting.indexOf(waiter);
				if (index !== -1) this.waiting.splice(index, 1);
				reject(signal?.reason ?? new Error("Operation aborted"));
			};
			waiter.onAbort = onAbort;
			if (signal) signal.addEventListener("abort", onAbort, { once: true });
			this.waiting.push(waiter);
			this.pump();
		});
	}

	private pump(): void {
		while (this.active < this.limit) {
			const waiter = this.waiting.shift();
			if (!waiter) return;
			if (waiter.signal?.aborted) {
				waiter.onAbort?.();
				continue;
			}
			if (waiter.signal && waiter.onAbort) waiter.signal.removeEventListener("abort", waiter.onAbort);
			this.active++;
			let released = false;
			waiter.resolve(() => {
				if (released) return;
				released = true;
				this.active--;
				this.pump();
			});
		}
	}
}

const semaphore = new Semaphore(Math.max(1, MAX_CONCURRENCY));

/** Live runs, so a parent shutdown cannot leave orphans behind. */
const live = new Set<AbortController>();

export default function (pi: ExtensionAPI) {
	// A summoned run has no extensions at all, so reaching this line inside one
	// means something loaded us explicitly. Refuse rather than recurse.
	if (currentDepth >= MAX_DEPTH) {
		return;
	}

	pi.on("session_shutdown", () => {
		for (const controller of live) controller.abort();
		live.clear();
	});

	pi.registerTool({
		name: "mini",
		label: "mini agent",
		description:
			"Summon a bounded sub-run to carry out one self-contained task, then report back. " +
			"The run works in a real shell with a hard step, dollar and time budget, and returns a " +
			"short structured result rather than its transcript. " +
			"Best for well-scoped work you can describe precisely: apply and verify a change, " +
			"reproduce a failure, audit a specific claim across files. " +
			"Give it a brief that already contains the paths and line numbers you know — that is far " +
			"cheaper than letting it rediscover them. It cannot ask you questions, so state the goal, " +
			"the boundary, and what 'done' means.",
		promptSnippet: "Summon a budgeted sub-run for a self-contained task",
		parameters: Type.Object({
			task: Type.String({
				description:
					"The brief. State the goal, the files or boundary it should stay within, and the " +
					"definition of done. Include known file:line locations.",
			}),
			contextPack: Type.Optional(
				Type.String({
					description:
						"Locations and facts you have already established, one per line (e.g. " +
						"`src/auth.ts:42-88 token refresh`). Supplying this is the cheapest possible " +
						"retrieval: the run starts from it instead of searching.",
				}),
			),
			cwd: Type.Optional(Type.String({ description: "Working directory. Defaults to the current one." })),
			steps: Type.Optional(
				Type.Number({ description: `Max model steps. Default ${DEFAULT_LIMITS.steps}.`, minimum: 1 }),
			),
			usd: Type.Optional(
				Type.Number({ description: `Max spend in USD. Default ${DEFAULT_LIMITS.usd}.`, minimum: 0.01 }),
			),
			minutes: Type.Optional(
				Type.Number({
					description: `Max wall-clock minutes. Default ${Math.round(DEFAULT_LIMITS.wallMs / 60000)}.`,
					minimum: 1,
				}),
			),
			retrieval: Type.Optional(
				Type.Union([Type.Literal("auto"), Type.Literal("off")], {
					description:
						"`auto` (default) gives the run a semantic `locate` tool when this repo is indexed. " +
						"`off` restricts it to the shell.",
				}),
			),
			accept: Type.Optional(
				Type.String({
					description:
						"Acceptance predicate: a shell command run BY THE CALLER'S HARNESS after the run " +
						"ends; exit 0 defines done (e.g. `npm test -- retry` or `test -f out/report.md`). " +
						"The verdict is attached to the result — declare one whenever done is checkable.",
				}),
			),
			lease: Type.Optional(
				Type.Array(Type.String(), {
					description:
						"Write-set lease: path or glob patterns the run may create/modify (e.g. " +
						"`src/http/**`). File changes are observed via git after the run; a write outside " +
						"the lease fails the result. Omit only for read-only work.",
				}),
			),
		}),

		async execute(_toolCallId, params, signal, onUpdate, ctx) {
			const runId = randomUUID().slice(0, 8);
			const cwd = params.cwd ?? (ctx as ExtensionContext | undefined)?.cwd ?? process.cwd();
			const limits = {
				steps: params.steps ?? DEFAULT_LIMITS.steps,
				usd: params.usd ?? DEFAULT_LIMITS.usd,
				wallMs: (params.minutes ?? DEFAULT_LIMITS.wallMs / 60000) * 60_000,
			};

			if (taskRequiresLease(params.task) && !hasLease(params.lease)) {
				return {
					content: [{ type: "text" as const, text: "Refused: mutating tasks require a non-empty lease." }],
					details: undefined,
					isError: true,
				};
			}

			// A reservation belongs to an in-flight provider call, not to the whole
			// summon. Let queued/concurrent summons reach the per-call gate so an
			// unused reservation can be reconciled before refusing the next call.
			if (treeBudget.spentUsd >= treeBudget.ceilingUsd) {
				return {
					content: [
						{
							type: "text" as const,
							text:
								`Refused: the $${TREE_CEILING_USD.toFixed(2)} ceiling for runs summoned from this ` +
								`session is spent ($${treeBudget.spentUsd.toFixed(2)}). Do the work directly, or raise ` +
								"PI_MINI_TREE_USD.",
						},
					],
					details: undefined,
					isError: true,
				};
			}

			const controller = new AbortController();
			live.add(controller);
			const onAbort = () => controller.abort();
			if (signal?.aborted) controller.abort();
			signal?.addEventListener("abort", onAbort, { once: true });
			const startedAt = Date.now();
			let release: (() => void) | undefined;

			try {
				release = await semaphore.acquire(controller.signal);
				onUpdate?.({ content: [{ type: "text", text: `mini ${runId}: starting` }], details: undefined });

				const result = await runMiniAgent({
					task: params.task,
					contextPack: params.contextPack,
					cwd,
					limits,
					tree: treeBudget,
					baseDir: BASE_DIR,
					runId,
					model: (ctx as ExtensionContext | undefined)?.model,
					retrieval: params.retrieval ?? "auto",
					accept: params.accept,
					lease: params.lease,
					signal: controller.signal,
					onProgress: (text) =>
						onUpdate?.({
							content: [{ type: "text", text: `mini ${runId}: ${text}` }],
							details: undefined,
						}),
				});

				// One routing-ledger row per summon: model, verified outcome, lease
				// verdict, cost. This is what turns delegation from lore into data —
				// which model passes which task class at what price is answerable by
				// grepping audit.ndjson instead of remembering.
				const model = (ctx as ExtensionContext | undefined)?.model as
					| { id?: string; provider?: string }
					| undefined;
				auditSummon(BASE_DIR, {
					runId,
					depth: currentDepth,
					cwd,
					task: params.task.slice(0, 400),
					model: model?.id ?? "inherited-unknown",
					provider: model?.provider,
					exitReason: result.exitReason,
					verified: result.verification ? result.verification.ok : "no-predicate",
					leaseViolations: result.leaseViolations?.length ?? 0,
					filesChanged: result.filesChanged.length,
					filesChangedSource: result.filesChangedSource,
					steps: result.steps,
					costUsd: Number(result.costUsd.toFixed(4)),
					elapsedMs: Date.now() - startedAt,
					treeSpentUsd: Number(treeBudget.spentUsd.toFixed(4)),
				});

				return {
					content: [{ type: "text" as const, text: formatEnvelope(result) }],
					details: result,
					isError: isFailure(result),
				};
			} catch (error) {
				const message = error instanceof Error ? error.message : String(error);
				auditSummon(BASE_DIR, { runId, depth: currentDepth, cwd, exitReason: "error", error: message });
				return {
					content: [{ type: "text" as const, text: `mini ${runId} failed to start: ${message}` }],
					details: undefined,
					isError: true,
				};
			} finally {
				signal?.removeEventListener("abort", onAbort);
				release?.();
				live.delete(controller);
			}
		},
	});
}
