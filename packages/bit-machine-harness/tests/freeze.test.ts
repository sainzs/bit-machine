/**
 * Regression: the memory section must be frozen per process lifetime.
 *
 * 2026-08-17, live: a `remember` upsert from one session changed the system
 * prompt of every OTHER live session on its next turn, invalidating every
 * server-side prompt-prefix cache at the memory block. On a local 32K model
 * that forced a ~21K-token re-prefill per turn (20+ second stalls). The
 * harness now snapshots the section on first injection; new processes see new
 * memories, live ones keep a stable prompt.
 */
import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import extension from "../src/index.ts";
import { upsert } from "../src/store.ts";

interface FakeEvent {
	systemPrompt: string;
}
type Handler = (event: FakeEvent) => { systemPrompt: string } | undefined;

function installExtension(): Handler {
	let handler: Handler | undefined;
	const pi = {
		on(event: string, h: Handler) {
			if (event === "before_agent_start") handler = h;
		},
		registerTool() {},
	};
	// deno-lint-ignore no-explicit-any
	extension(pi as any);
	assert.ok(handler, "extension must register before_agent_start");
	return handler as Handler;
}

function isolated(): { projectStore: string; restore: () => void } {
	const home = mkdtempSync(join(tmpdir(), "bmh-home-"));
	const proj = mkdtempSync(join(tmpdir(), "bmh-proj-"));
	const oldHome = process.env.HOME;
	const oldCwd = process.cwd();
	const oldLive = process.env.BIT_MACHINE_LIVE_MEMORY;
	process.env.HOME = home;
	delete process.env.BIT_MACHINE_LIVE_MEMORY;
	process.chdir(proj);
	return {
		projectStore: join(proj, ".bit-machine", "harness.json"),
		restore() {
			process.env.HOME = oldHome;
			if (oldLive === undefined) delete process.env.BIT_MACHINE_LIVE_MEMORY;
			else process.env.BIT_MACHINE_LIVE_MEMORY = oldLive;
			process.chdir(oldCwd);
		},
	};
}

test("memory section is frozen for the process lifetime", () => {
	const { projectStore, restore } = isolated();
	try {
		upsert(projectStore, { title: "seed fact", content: "first version" });
		const handler = installExtension();

		const first = handler({ systemPrompt: "BASE" });
		assert.ok(first, "section must be injected when memories exist");
		assert.match(first.systemPrompt, /seed fact/);

		// A concurrent session writes a new memory mid-flight.
		upsert(projectStore, { title: "later fact", content: "must not appear mid-session" });

		const second = handler({ systemPrompt: "BASE" });
		assert.ok(second);
		assert.equal(second.systemPrompt, first.systemPrompt, "prompt must not drift under a live session");

		// A NEW process (fresh extension instance) sees the new memory.
		const nextSession = installExtension();
		const fresh = nextSession({ systemPrompt: "BASE" });
		assert.ok(fresh);
		assert.match(fresh.systemPrompt, /later fact/);
	} finally {
		restore();
	}
});

test("empty store freezes as empty — no section appears later mid-session", () => {
	const { projectStore, restore } = isolated();
	try {
		const handler = installExtension();
		assert.equal(handler({ systemPrompt: "BASE" }), undefined, "no memories, no section");

		upsert(projectStore, { title: "arrives late", content: "x" });
		assert.equal(handler({ systemPrompt: "BASE" }), undefined, "snapshot of emptiness must hold");
	} finally {
		restore();
	}
});

test("BIT_MACHINE_LIVE_MEMORY=1 restores per-turn reads", () => {
	const { projectStore, restore } = isolated();
	try {
		process.env.BIT_MACHINE_LIVE_MEMORY = "1";
		upsert(projectStore, { title: "seed fact", content: "v1" });
		const handler = installExtension();
		assert.match(handler({ systemPrompt: "BASE" })?.systemPrompt ?? "", /seed fact/);

		upsert(projectStore, { title: "live fact", content: "v2" });
		assert.match(handler({ systemPrompt: "BASE" })?.systemPrompt ?? "", /live fact/);
	} finally {
		restore();
	}
});
