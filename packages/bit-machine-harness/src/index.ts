/**
 * bit-machine-harness — the continual layer: what the agent knows OUTSIDE any session.
 *
 * bit-machine's thesis, in one line: an agent = a runtime (pi, vendored upstream), a
 * leaf discipline (pi-mini-agent: budgets, predicates, leases), and a HARNESS —
 * durable memory plus verification doctrine — and of the three, only the
 * harness compounds. This package is the harness's first organ: standing
 * memory. Refinement, skills and routing live on the roadmap (see /README.md).
 *
 * Mechanics: on every turn, `before_agent_start` appends a bounded memory
 * section to the assembled system prompt (append — never replace: the event
 * exposes the full prompt precisely so extensions can compose). One tool,
 * `remember`, mutates the store; the file on disk is the source of truth and
 * is human-editable by design.
 */

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";
import { renderMemorySection } from "./prompt.ts";
import { harnessPath, load, remove, type Scope, upsert } from "./store.ts";

export default function (pi: ExtensionAPI) {
	const liveMemory = process.env.BIT_MACHINE_LIVE_MEMORY === "1";
	let cachedSection: string | undefined;
	let sectionLoaded = false;

	pi.on("before_agent_start", (event) => {
		if (!sectionLoaded || liveMemory) {
			const cwd = process.cwd();
			const globalMems = load(harnessPath("global", cwd)).memories;
			const projectMems = load(harnessPath("project", cwd)).memories;
			cachedSection = renderMemorySection(globalMems, projectMems) || undefined;
			sectionLoaded = true;
		}
		const section = cachedSection;
		if (!section) return undefined;
		return { systemPrompt: event.systemPrompt + section };
	});

	pi.registerTool({
		name: "remember",
		label: "remember",
		description:
			"Persist, update, or delete a standing memory that survives across sessions. Use for " +
			"durable facts: environment quirks, user-corrected taxonomy, verified project state, " +
			"hard-won tactics. scope=project (this repo, .bit-machine/harness.json) for repo facts; " +
			"scope=global (~/.bit-machine) for cross-project lessons. Keep entries small and evidence-backed; " +
			"update or delete stale ones rather than accumulating.",
		promptSnippet: "Persist a durable memory across sessions",
		parameters: Type.Object({
			op: Type.Union([Type.Literal("upsert"), Type.Literal("delete")], {
				description: "upsert creates or updates (by id, else by slug of title); delete removes by id.",
			}),
			scope: Type.Union([Type.Literal("project"), Type.Literal("global")], {
				description: "Where the memory belongs. Default project.",
			}),
			id: Type.Optional(Type.String({ description: "Stable id. Required for delete; optional for upsert." })),
			title: Type.Optional(Type.String({ description: "Short title (upsert)." })),
			content: Type.Optional(Type.String({ description: "The memory body, 1-4 sentences (upsert)." })),
			tags: Type.Optional(Type.Array(Type.String())),
		}),
		async execute(_toolCallId, params) {
			const scope = (params.scope ?? "project") as Scope;
			const path = harnessPath(scope, process.cwd());
			if (params.op === "delete") {
				if (!params.id) {
					return {
						content: [{ type: "text" as const, text: "delete requires id" }],
						details: undefined,
						isError: true,
					};
				}
				const ok = remove(path, params.id);
				return {
					content: [
						{
							type: "text" as const,
							text: ok ? `deleted ${scope}:${params.id}` : `no such memory: ${scope}:${params.id}`,
						},
					],
					details: undefined,
					isError: !ok,
				};
			}
			if (!params.title || !params.content) {
				return {
					content: [{ type: "text" as const, text: "upsert requires title and content" }],
					details: undefined,
					isError: true,
				};
			}
			const memory = upsert(path, {
				id: params.id,
				title: params.title,
				content: params.content,
				tags: params.tags,
			});
			return {
				content: [{ type: "text" as const, text: `remembered ${scope}:${memory.id} (v${memory.v}) → ${path}` }],
				details: memory,
				isError: false,
			};
		},
	});
}
