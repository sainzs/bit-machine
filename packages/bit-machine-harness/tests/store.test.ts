import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { renderMemorySection } from "../src/prompt.ts";
import { load, remove, slugify, upsert, type Memory } from "../src/store.ts";

function tempStore(): string {
	return join(mkdtempSync(join(tmpdir(), "bit-machine-harness-")), "harness.json");
}

test("upsert creates, then updates in place with a version bump", () => {
	const path = tempStore();
	const first = upsert(path, { title: "Dead binding", content: "opencode/x is 401" });
	assert.equal(first.v, 1);
	assert.equal(first.id, "dead_binding");

	const second = upsert(path, { id: "dead_binding", title: "Dead binding", content: "fixed 2026-08-09" });
	assert.equal(second.v, 2);
	assert.equal(load(path).memories.length, 1, "update must not duplicate");
	assert.match(load(path).memories[0]!.content, /fixed/);
});

test("delete removes exactly the named memory and reports absence honestly", () => {
	const path = tempStore();
	upsert(path, { title: "keep me", content: "k" });
	upsert(path, { title: "drop me", content: "d" });
	assert.equal(remove(path, "drop_me"), true);
	assert.equal(remove(path, "drop_me"), false, "second delete must report no-op");
	assert.deepEqual(load(path).memories.map((m) => m.id), ["keep_me"]);
});

test("the store file is human-auditable JSON on disk", () => {
	const path = tempStore();
	upsert(path, { title: "auditable", content: "read me with an editor" });
	const raw = readFileSync(path, "utf-8");
	assert.match(raw, /"auditable"/);
	assert.doesNotThrow(() => JSON.parse(raw));
});

test("a corrupt store loads as empty instead of crashing the session", () => {
	const path = tempStore();
	upsert(path, { title: "x", content: "y" });
	writeFileSync(path, "{not json", "utf-8");
	assert.deepEqual(load(path).memories, []);
});

test("an empty-string id falls through to the slug (live-run regression, 2026-08-07)", () => {
	const path = tempStore();
	const m = upsert(path, { id: "", title: "Bit Machine first light", content: "x" });
	assert.equal(m.id, "bit_machine_first_light");
});

test("slugs are stable, typeable, bounded", () => {
	assert.equal(slugify("Dead binding: opencode/x → 401!"), "dead_binding_opencode_x_401");
	assert.equal(slugify("###"), "memory");
	assert.ok(slugify("a".repeat(200)).length <= 64);
});

function mem(id: string, content: string, updatedAt: string): Memory {
	return { id, title: id, content, tags: [], v: 1, createdAt: updatedAt, updatedAt };
}

test("injection is hard-capped: whole memories dropped, disclosure appended", () => {
	const globals = Array.from({ length: 40 }, (_, i) =>
		mem(`m${i}`, "x".repeat(400), new Date(2026, 0, i + 1).toISOString()),
	);
	const section = renderMemorySection(globals, []);
	assert.ok(section.length <= 8_200, `section was ${section.length} chars`);
	assert.match(section, /older memories omitted for budget/);
});

test("project memories and recency win the budget", () => {
	const old = mem("old_global", "ancient", "2026-01-01T00:00:00Z");
	const fresh = mem("fresh_project", "current", "2026-08-01T00:00:00Z");
	const section = renderMemorySection([old], [fresh]);
	assert.ok(section.indexOf("fresh_project") < section.indexOf("old_global"));
	assert.match(section, /\[project:fresh_project\]/);
	assert.match(section, /\[global:old_global\]/);
});

test("no memories, no section — zero prompt tax when unused", () => {
	assert.equal(renderMemorySection([], []), "");
});
