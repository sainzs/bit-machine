/**
 * Rendering memories into the system prompt.
 *
 * Injection budget is a hard cap, enforced by code, for the same reason
 * pi-mini-agent caps its result envelope: anything appended to the system
 * prompt is re-read on EVERY step of EVERY turn. An unbounded memory section is
 * a permanent tax that grows monotonically — the failure mode of every naive
 * "just add memory" layer. Overflow drops whole memories (newest-updated first
 * are kept) and says so, rather than silently truncating one mid-sentence.
 *
 * Cache note: the section is appended per-turn via `before_agent_start`, and
 * memories change rarely, so the prefix stays stable across steps within a turn
 * and usually across turns. An edit mid-session costs one cache re-write — the
 * correct price for new standing knowledge.
 */

import type { Memory } from "./store.ts";

/** ~2k tokens. Half of what an AGENTS.md costs in ~/pi-mono; earns its keep or gets cut. */
const MAX_SECTION_CHARS = 8_000;

export function renderMemorySection(globalMemories: Memory[], projectMemories: Memory[]): string {
	const entries: Array<{ scope: string; m: Memory }> = [
		...projectMemories.map((m) => ({ scope: "project", m })),
		...globalMemories.map((m) => ({ scope: "global", m })),
	].sort((a, b) => (a.m.updatedAt < b.m.updatedAt ? 1 : -1));

	if (entries.length === 0) return "";

	const header = [
		"",
		"## Standing memory (bit-machine)",
		"",
		"Durable facts and lessons persisted across sessions. Treat as reliable context;",
		"correct with the `remember` tool when reality disagrees.",
		"",
	].join("\n");

	const lines: string[] = [];
	let used = header.length;
	let dropped = 0;
	for (const { scope, m } of entries) {
		const rendered = `- [${scope}:${m.id}] ${m.title} (v${m.v}): ${m.content}\n`;
		if (used + rendered.length > MAX_SECTION_CHARS) {
			dropped++;
			continue;
		}
		lines.push(rendered);
		used += rendered.length;
	}
	if (dropped > 0) {
		lines.push(`- [${dropped} older memories omitted for budget; read .bit-machine/harness.json for all]\n`);
	}
	return header + lines.join("");
}
