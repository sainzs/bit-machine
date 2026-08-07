/**
 * The harness store — durable state that outlives any session.
 *
 * The design premise (borrowed from operating a Prime-Agent-class harness in
 * anger, 2026-08): a coding agent's most expensive failure is re-learning.
 * Dead provider bindings, project taxonomies the user already corrected twice,
 * verified facts about repos — these die with the context window unless a layer
 * outside the transcript owns them.
 *
 * Two scopes, mirroring where lessons actually belong:
 *  - GLOBAL  (~/.bit-machine/harness.json): cross-project, cross-session. Durable user
 *    preferences, environment facts, hard-won tactics.
 *  - PROJECT (<cwd>/.bit-machine/harness.json): this repo's facts. Travels with the
 *    checkout, shareable through git if the team wants it.
 *
 * Deliberately boring storage: one small JSON file per scope, atomic-enough
 * writes (rename), no daemon, no database. The file is the API for humans too —
 * a memory you cannot read and edit with a text editor is a memory you cannot
 * audit, and unauditable memory drifts into fiction.
 */

import { mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";

export type Scope = "global" | "project";

export interface Memory {
	id: string;
	title: string;
	content: string;
	tags: string[];
	/** Bumped on every update; lets a reader spot churn. */
	v: number;
	createdAt: string;
	updatedAt: string;
}

export interface HarnessFile {
	schema: 1;
	memories: Memory[];
}

const EMPTY: HarnessFile = { schema: 1, memories: [] };

export function harnessPath(scope: Scope, cwd: string): string {
	return scope === "global"
		? join(homedir(), ".bit-machine", "harness.json")
		: join(cwd, ".bit-machine", "harness.json");
}

export function load(path: string): HarnessFile {
	try {
		const parsed = JSON.parse(readFileSync(path, "utf-8")) as HarnessFile;
		if (parsed?.schema !== 1 || !Array.isArray(parsed.memories)) return { ...EMPTY };
		return parsed;
	} catch {
		return { ...EMPTY, memories: [] };
	}
}

function save(path: string, file: HarnessFile): void {
	mkdirSync(dirname(path), { recursive: true });
	const tmp = `${path}.tmp-${process.pid}`;
	writeFileSync(tmp, `${JSON.stringify(file, null, "\t")}\n`, "utf-8");
	renameSync(tmp, path);
}

/** IDs are slugs: stable, human-typeable, greppable. */
export function slugify(title: string): string {
	return (
		title
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, "_")
			.replace(/^_+|_+$/g, "")
			.slice(0, 64) || "memory"
	);
}

export interface UpsertInput {
	id?: string;
	title: string;
	content: string;
	tags?: string[];
}

export function upsert(path: string, input: UpsertInput): Memory {
	const file = load(path);
	const id = input.id?.trim() || slugify(input.title);
	const now = new Date().toISOString();
	const existing = file.memories.find((m) => m.id === id);
	if (existing) {
		existing.title = input.title;
		existing.content = input.content;
		if (input.tags) existing.tags = input.tags;
		existing.v += 1;
		existing.updatedAt = now;
		save(path, file);
		return existing;
	}
	const memory: Memory = {
		id,
		title: input.title,
		content: input.content,
		tags: input.tags ?? [],
		v: 1,
		createdAt: now,
		updatedAt: now,
	};
	file.memories.push(memory);
	save(path, file);
	return memory;
}

export function remove(path: string, id: string): boolean {
	const file = load(path);
	const before = file.memories.length;
	file.memories = file.memories.filter((m) => m.id !== id);
	if (file.memories.length === before) return false;
	save(path, file);
	return true;
}
