/**
 * The acceptance predicate — verification moved from discipline into the contract.
 *
 * The single biggest failure mode observed across harnesses (this repo's own
 * design notes, and a 2026-08-07 multi-agent reorg run) is a child that reports
 * "completed" having done nothing, or reports file changes that never happened.
 * The fix is structural: the CALLER declares, before the run starts, a shell
 * command whose exit code defines "done". The HARNESS runs it after the child
 * submits — in the same cwd, with a hard timeout — and attaches the verdict to
 * the envelope. The child's summary is never surfaced without it.
 *
 * The predicate is also shown to the child in its task message. That is not a
 * leak; it is the point. A machine-checkable definition of done is the cheapest
 * possible alignment between caller and child, and the child running it before
 * submitting converts "I think I'm done" into "the caller's own check passes".
 *
 * What this deliberately is NOT: a sandbox. The child could craft a state that
 * passes the predicate without doing the work. The predicate bounds *negligence
 * and self-deception*, which are the observed failure modes; it does not bound
 * adversarial children, which are a model-quality problem no post-hoc check
 * solves.
 */

import { type ChildProcess, spawn } from "node:child_process";

const OUTPUT_CAP = 800;
/** Predicates are gates, not builds. A slow predicate is a design smell. */
const DEFAULT_TIMEOUT_MS = 30_000;

export interface Verification {
	command: string;
	/** null when the predicate itself could not run (timeout, spawn failure). */
	exitCode: number | null;
	ok: boolean;
	/** Combined stdout+stderr, capped. */
	output: string;
}

export function runAcceptance(
	command: string,
	cwd: string,
	timeoutMs = DEFAULT_TIMEOUT_MS,
	signal?: AbortSignal,
): Promise<Verification> {
	if (signal?.aborted) {
		return Promise.resolve({ command, exitCode: null, ok: false, output: "[predicate aborted]" });
	}
	return new Promise((resolve) => {
		let child: ChildProcess;
		try {
			child = spawn("bash", ["-c", command], {
				cwd,
				stdio: ["ignore", "pipe", "pipe"],
				detached: process.platform !== "win32",
			});
		} catch (error) {
			resolve({ command, exitCode: null, ok: false, output: String(error) });
			return;
		}

		let stdout = "";
		let stderr = "";
		let timedOut = false;
		let aborted = false;
		let settled = false;
		let escalation: ReturnType<typeof setTimeout> | undefined;
		const timer = setTimeout(
			() => {
				timedOut = true;
				terminateProcessTree(child, "SIGTERM");
				escalation = setTimeout(() => terminateProcessTree(child, "SIGKILL"), 200);
			},
			Math.max(1, timeoutMs),
		);
		const onAbort = () => {
			aborted = true;
			terminateProcessTree(child, "SIGTERM");
			escalation = setTimeout(() => terminateProcessTree(child, "SIGKILL"), 200);
		};
		signal?.addEventListener("abort", onAbort, { once: true });

		const append = (current: string, chunk: Buffer | string): string => {
			if (current.length >= 4 * 1024 * 1024) return current;
			return current + chunk.toString().slice(0, 4 * 1024 * 1024 - current.length);
		};
		child.stdout?.on("data", (chunk: Buffer | string) => {
			stdout = append(stdout, chunk);
		});
		child.stderr?.on("data", (chunk: Buffer | string) => {
			stderr = append(stderr, chunk);
		});
		const finish = (exitCode: number | null, spawnError?: string) => {
			if (settled) return;
			settled = true;
			clearTimeout(timer);
			if (escalation) clearTimeout(escalation);
			signal?.removeEventListener("abort", onAbort);
			const combined = `${stdout}${stderr ? `\n${stderr}` : ""}`.trim();
			const output =
				combined.length > OUTPUT_CAP
					? `${combined.slice(0, OUTPUT_CAP)}\n[... ${combined.length - OUTPUT_CAP} chars truncated]`
					: combined;
			const reason = aborted
				? `[predicate aborted]`
				: timedOut
					? `[predicate timed out after ${timeoutMs}ms]`
					: spawnError;
			resolve({
				command,
				exitCode,
				ok: !reason && exitCode === 0,
				output: reason ? `${reason}${output ? ` ${output}` : ""}` : output,
			});
		};
		child.once("error", (error) => finish(null, error.message));
		child.once("close", (code) => finish(typeof code === "number" ? code : null));
	});
}

function terminateProcessTree(child: ChildProcess, signal: NodeJS.Signals): void {
	if (child.pid === undefined) return;
	if (process.platform !== "win32") {
		try {
			process.kill(-child.pid, signal);
			return;
		} catch {
			// Fall through to the direct child when group creation failed.
		}
	}
	try {
		child.kill(signal);
	} catch {
		// The process may already have exited.
	}
}
