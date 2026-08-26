/**
 * Hard budgets — the feature pi genuinely lacks.
 *
 * pi has no `--max-turns` and no `--max-cost` (verified against `pi --help` and
 * docs/settings.md on 0.83.0). mini-swe-agent's entire "step limits cap the
 * bill" value proposition is this file and nothing else.
 *
 * Two properties matter, both copied from mini-swe-agent's `default.py`:
 *
 *  1. The check runs **before** the model call, not after. Post-hoc summing of
 *     usage lets a single request overrun by an unbounded amount (one 900k-token
 *     prompt is one "step"). `query()` in mini-swe checks limits before
 *     `self.model.query`; we check in `before_provider_request`, which fires
 *     after the payload is serialized and before the HTTP call.
 *  2. Exhaustion is a *reported exit status*, not an exception that loses work.
 */

/** Why a run stopped. Mirrors mini-swe-agent's `exit_status`. */
export type ExitReason =
	| "submitted"
	| "step_limit"
	| "cost_limit"
	| "wall_limit"
	| "tree_budget"
	| "aborted"
	/** The model binding itself is dead (auth/config failure on the first call). */
	| "binding_error"
	| "error";

export interface BudgetLimits {
	/** Max model calls. mini-swe-agent's `step_limit`; its default is 40. */
	steps: number;
	/** Max spend in USD for this run. mini-swe-agent's `cost_limit`; default 3.0. */
	usd: number;
	/** Max wall-clock ms. mini-swe-agent's `wall_time_limit_seconds`. */
	wallMs: number;
}

export const DEFAULT_LIMITS: BudgetLimits = {
	steps: 40,
	usd: 3.0,
	wallMs: 20 * 60 * 1000,
};

/** Normalize caller-supplied limits so non-finite values always fail closed. */
export function normalizeBudgetLimits(limits: BudgetLimits): BudgetLimits {
	return {
		steps: finiteNonNegativeInteger(limits.steps),
		usd: finiteNonNegative(limits.usd),
		wallMs: finiteNonNegative(limits.wallMs),
	};
}

/**
 * A budget shared by a whole tree of summoned runs.
 *
 * Deliberately in-process. Reservations make the shared ceiling safe even when
 * sibling runs reach the provider gate in the same turn: a run must reserve its
 * remaining allowance before the request begins, then settle that reservation
 * with the provider's observed cost.
 */
export class TreeBudget {
	readonly ceilingUsd: number;
	spentUsd = 0;
	private reserved = 0;
	private readonly reservations = new Set<TreeReservation>();

	constructor(ceilingUsd: number) {
		if (!Number.isFinite(ceilingUsd) || ceilingUsd < 0) {
			throw new RangeError(`tree budget ceiling must be a finite non-negative number, got ${ceilingUsd}`);
		}
		this.ceilingUsd = ceilingUsd;
	}

	get remainingUsd(): number {
		return Math.max(0, this.ceilingUsd - this.spentUsd - this.reserved);
	}

	get exhausted(): boolean {
		return this.remainingUsd <= 0;
	}

	/** Amount currently held by in-flight provider requests. */
	get reservedUsd(): number {
		return this.reserved;
	}

	/** Reserve an allowance before starting a provider request. */
	reserve(amountUsd: number): TreeReservation | undefined {
		if (!Number.isFinite(amountUsd) || amountUsd <= 0 || amountUsd > this.remainingUsd) return undefined;
		const reservation = { amountUsd };
		this.reservations.add(reservation);
		this.reserved += amountUsd;
		return reservation;
	}

	/** Release an allowance and charge the observed provider cost. */
	settle(reservation: TreeReservation, actualUsd = 0): void {
		if (!this.reservations.delete(reservation)) return;
		this.reserved = Math.max(0, this.reserved - reservation.amountUsd);
		if (Number.isFinite(actualUsd) && actualUsd > 0) this.spentUsd += actualUsd;
	}

	/** Charge an observed cost that was not preceded by a reservation. */
	record(actualUsd: number): void {
		if (Number.isFinite(actualUsd) && actualUsd > 0) this.spentUsd += actualUsd;
	}
}

export interface TreeReservation {
	readonly amountUsd: number;
}

export interface BudgetSnapshot {
	steps: number;
	stepLimit: number;
	usd: number;
	usdLimit: number;
	elapsedMs: number;
	wallMs: number;
}

/** Per-run budget. Charges a shared `TreeBudget` so a whole fan-out is capped. */
export class Budget {
	readonly limits: BudgetLimits;
	readonly startedAt = Date.now();
	private readonly tree: TreeBudget;
	private readonly reservations: TreeReservation[] = [];

	steps = 0;
	usd = 0;
	/** Set once a limit trips, so the runner can report a precise exit status. */
	tripped: ExitReason | undefined;

	constructor(limits: BudgetLimits, tree: TreeBudget) {
		// Malformed numeric input must fail closed. Comparisons against NaN are
		// always false, which would otherwise disable every gate.
		this.limits = normalizeBudgetLimits(limits);
		this.tree = tree;
	}

	get elapsedMs(): number {
		return Date.now() - this.startedAt;
	}

	get stepsRemaining(): number {
		return Math.max(0, this.limits.steps - this.steps);
	}

	/**
	 * Pre-spend gate. Returns the reason to stop, or undefined to proceed.
	 *
	 * Called from `before_provider_request`, i.e. with the payload built but no
	 * HTTP call made yet — the only pre-spend checkpoint pi exposes.
	 */
	checkBeforeCall(): ExitReason | undefined {
		if (this.steps >= this.limits.steps) return this.trip("step_limit");
		if (this.usd >= this.limits.usd) return this.trip("cost_limit");
		if (this.elapsedMs >= this.limits.wallMs) return this.trip("wall_limit");
		if (this.tree.exhausted) return this.trip("tree_budget");
		// Hold the whole remaining per-run allowance while this request is in
		// flight. The provider's actual cost is unknown at this point; reserving
		// only the tree's currently available fraction would let a request spend
		// past the shared ceiling before its response reconciles the ledger.
		const allowance = this.limits.usd - this.usd - this.reservedUsd;
		if (allowance <= 0) return this.trip("cost_limit");
		// A partial reservation would be unsound: two requests could each reserve
		// the currently available fraction and then each spend their full local
		// allowance. Refuse the request unless the whole possible spend fits in the
		// shared pool.
		const reservation = this.tree.reserve(allowance);
		if (!reservation) return this.trip("tree_budget");
		this.reservations.push(reservation);
		return undefined;
	}

	private trip(reason: ExitReason): ExitReason {
		this.tripped ??= reason;
		return reason;
	}

	/** Stop an in-flight run from an external wall-clock or cancellation guard. */
	stop(reason: ExitReason): void {
		this.trip(reason);
	}

	/** Count a model call that is about to be made. */
	countStep(): void {
		this.steps++;
	}

	/** Charge observed spend to this run and to the shared tree ceiling. */
	charge(usd: number): void {
		const reservation = this.reservations.shift();
		if (!Number.isFinite(usd) || usd <= 0) {
			if (reservation) this.tree.settle(reservation);
			return;
		}
		this.usd += usd;
		if (reservation) this.tree.settle(reservation, usd);
		else this.tree.record(usd);
	}

	/** Release requests that ended without a usage event. */
	releaseReservations(): void {
		for (const reservation of this.reservations.splice(0)) this.tree.settle(reservation);
	}

	private get reservedUsd(): number {
		return this.reservations.reduce((total, reservation) => total + reservation.amountUsd, 0);
	}

	snapshot(): BudgetSnapshot {
		return {
			steps: this.steps,
			stepLimit: this.limits.steps,
			usd: this.usd,
			usdLimit: this.limits.usd,
			elapsedMs: this.elapsedMs,
			wallMs: this.limits.wallMs,
		};
	}

	/**
	 * A one-line nudge appended to tool output when the run is nearly done, so
	 * the model submits its best result instead of being cut off mid-thought.
	 * mini-swe-agent does the same thing by forcing a final submission turn.
	 */
	warningLine(): string | undefined {
		const left = this.stepsRemaining;
		if (left <= 2) {
			return `[budget] ${left} step${left === 1 ? "" : "s"} left — call submit now with your best result.`;
		}
		const usdLeft = this.limits.usd - this.usd;
		if (usdLeft <= this.limits.usd * 0.1) {
			return `[budget] ~$${usdLeft.toFixed(2)} left — call submit now with your best result.`;
		}
		const msLeft = this.limits.wallMs - this.elapsedMs;
		if (msLeft <= 60_000) {
			return `[budget] ${Math.max(0, Math.round(msLeft / 1000))}s left — call submit now with your best result.`;
		}
		return undefined;
	}
}

function finiteNonNegative(value: number): number {
	return Number.isFinite(value) && value >= 0 ? value : 0;
}

function finiteNonNegativeInteger(value: number): number {
	return Number.isFinite(value) && value >= 0 ? Math.floor(value) : 0;
}
