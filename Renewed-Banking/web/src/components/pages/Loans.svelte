<script lang="ts">
    import { accounts, activeAccount, atm, isBanker, loanConfig, loans, pendingLoans, t } from "../../store/stores";
    import { accountKind, formatMoney } from "../../utils/misc";
    import { submitLoanAction } from "../../utils/actions";

    let tab: "mine" | "desk" = "mine";
    let amount = "";
    let reason = "";
    let termDays = 14;
    let repayId: number | null = null;
    let repayAmt = "";

    $: cfg = $loanConfig;
    $: account = $accounts.find((item) => item.id === $activeAccount) || $accounts[0];
    $: kind = accountKind(account) === "personal" ? "personal" : "job";
    $: maxAmount = kind === "personal" ? cfg.maxPersonal : cfg.maxJob;
    $: parsed = Math.floor(Number(amount) || 0);
    $: total = parsed > 0 ? Math.floor(parsed * (100 + (cfg.interestPercent || 0)) / 100) : 0;
    $: weekly = total && termDays ? Math.ceil(total / Math.max(1, Math.ceil(termDays / 7))) : 0;

    function statusClass(status: string) {
        if (status === "paid" || status === "active" || status === "approved") return "income";
        if (status === "denied" || status === "pending") return "pending";
        return "sent";
    }

    async function apply() {
        if (!account || parsed < cfg.minAmount || $atm) return;
        await submitLoanAction("applyLoan", {
            account: account.id,
            amount: parsed,
            termDays,
            reason,
        });
        amount = "";
        reason = "";
    }

    async function repay() {
        if (!repayId || Number(repayAmt) < 1) return;
        await submitLoanAction("repayLoan", { loanId: repayId, amount: Number(repayAmt) });
        repayId = null;
        repayAmt = "";
    }

    async function decide(loanId: number, decision: "approve" | "deny") {
        await submitLoanAction("decideLoan", { loanId, decision });
    }
</script>

<div class="page">
    <div class="chips">
        <button class="chip" class:active={tab === "mine"} on:click={() => tab = "mine"}>{$t.my_loans}</button>
        {#if $isBanker}
            <button class="chip" class:active={tab === "desk"} on:click={() => tab = "desk"}>
                {$t.banker_desk}
                {#if $pendingLoans.length}<span class="count">{$pendingLoans.length}</span>{/if}
            </button>
        {/if}
    </div>

    {#if tab === "mine"}
        <div class="grid">
            <section class="panel form">
                <div class="section-title">{$t.apply_loan}</div>
                <p class="muted hint">{$atm ? $t.atm_loans : $t.loan_apply_hint}</p>
                <span class="lbl">{$t.loan_account}</span>
                <div class="account">{account?.name} · {kind === "personal" ? $t.loan_type_personal : $t.loan_type_job}</div>
                <span class="lbl">{$t.amount} (${cfg.minAmount.toLocaleString()} – ${maxAmount.toLocaleString()})</span>
                <input class="field" type="number" min={cfg.minAmount} max={maxAmount} bind:value={amount} disabled={$atm} />
                <span class="lbl">{$t.loan_term}</span>
                <div class="chips">
                    {#each cfg.terms as days}
                        <button class="chip" class:active={termDays === days} on:click={() => termDays = days}>
                            {$t.loan_days.replace("%s", String(days))}
                        </button>
                    {/each}
                </div>
                <span class="lbl">{$t.loan_reason}</span>
                <input class="field" bind:value={reason} placeholder={$t.loan_reason} disabled={$atm} />
                {#if parsed >= cfg.minAmount}
                    <div class="quote">
                        <span>{$t.loan_interest}: {cfg.interestPercent}%</span>
                        <span>{$t.loan_total}: {formatMoney(total)}</span>
                        <span>{$t.weekly_payment}: {formatMoney(weekly)}</span>
                    </div>
                {/if}
                <button class="btn btn-cyan" disabled={$atm || parsed < cfg.minAmount || !reason.trim()} on:click={apply}>
                    {$t.confirm_loan}
                </button>
            </section>

            <section class="list scroller">
                {#if $loans.length === 0}
                    <div class="panel empty">{$t.no_loans}</div>
                {:else}
                    {#each $loans as loan (loan.id)}
                        <article class="panel loan">
                            <header>
                                <strong>{loan.accountName || loan.account}</strong>
                                <span class="badge {statusClass(loan.status)}">{$t[loan.status] || loan.status}</span>
                            </header>
                            <p class="muted">{loan.reason}</p>
                            <div class="meta">
                                <span>{formatMoney(loan.amount)} @ {loan.interest}%</span>
                                <span>{$t.loan_remaining}: {formatMoney(loan.remaining)}</span>
                                <span>{$t.loan_days.replace("%s", String(loan.termDays))}</span>
                            </div>
                            {#if loan.status === "pending"}
                                <p class="muted">{$t.loan_awaiting}</p>
                            {/if}
                            {#if loan.status === "approved"}
                                <p class="muted">{$t.loan_offline_note}</p>
                            {/if}
                            {#if loan.status === "active"}
                                {#if repayId === loan.id}
                                    <div class="repay">
                                        <input class="field" type="number" bind:value={repayAmt} placeholder={$t.amount} />
                                        <button class="btn btn-green" on:click={repay}>{$t.confirm_repay}</button>
                                        <button class="chip" on:click={() => repayId = null}>{$t.cancel}</button>
                                    </div>
                                {:else}
                                    <button class="btn btn-cyan" on:click={() => { repayId = loan.id; repayAmt = String(Math.min(loan.remaining, Math.floor((account?.amount || 0)))); }}>{$t.repay_loan}</button>
                                {/if}
                            {/if}
                        </article>
                    {/each}
                {/if}
            </section>
        </div>
    {:else}
        <section class="list scroller desk">
            {#if $pendingLoans.length === 0}
                <div class="panel empty">{$t.no_pending_loans}</div>
            {:else}
                {#each $pendingLoans as loan (loan.id)}
                    <article class="panel loan">
                        <header>
                            <strong>{loan.applicantName}</strong>
                            <span class="badge sent">{loan.accountType === "personal" ? $t.loan_type_personal : $t.loan_type_job}</span>
                        </header>
                        <p>{loan.accountName} · {loan.account}</p>
                        <p class="muted">{loan.reason}</p>
                        <div class="meta">
                            <span>{formatMoney(loan.amount)} → {formatMoney(loan.total)}</span>
                            <span>{$t.loan_days.replace("%s", String(loan.termDays))}</span>
                            <span>{loan.interest}%</span>
                        </div>
                        <div class="actions">
                            <button class="btn btn-green" on:click={() => decide(loan.id, "approve")}>{$t.approve}</button>
                            <button class="btn btn-red" on:click={() => decide(loan.id, "deny")}>{$t.deny}</button>
                        </div>
                    </article>
                {/each}
            {/if}
        </section>
    {/if}
</div>

<style>
    .page {
        height: 100%;
        display: flex;
        flex-direction: column;
        gap: 0.8rem;
        min-height: 0;
    }
    .chips {
        display: flex;
        flex-wrap: wrap;
        gap: 0.35rem;
    }
    .count {
        margin-left: 0.35rem;
        background: var(--crimson);
        color: #fff;
        border-radius: 99px;
        padding: 0 0.4rem;
        font-size: 0.68rem;
    }
    .grid {
        flex: 1;
        min-height: 0;
        display: grid;
        grid-template-columns: 0.95fr 1.05fr;
        gap: 0.8rem;
    }
    .form,
    .empty,
    .loan {
        padding: 1rem;
    }
    .form {
        display: flex;
        flex-direction: column;
        gap: 0.45rem;
    }
    .lbl {
        font-size: 0.72rem;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--muted);
    }
    .hint { font-size: 0.82rem; }
    .account { font-weight: 700; }
    .quote {
        display: flex;
        justify-content: space-between;
        gap: 0.5rem;
        font-size: 0.78rem;
        color: var(--chrome);
    }
    .list {
        display: flex;
        flex-direction: column;
        gap: 0.65rem;
        min-height: 0;
    }
    .desk { flex: 1; }
    .loan header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 0.35rem;
    }
    .meta {
        display: flex;
        flex-wrap: wrap;
        gap: 0.7rem;
        margin: 0.45rem 0;
        font-size: 0.8rem;
        color: var(--muted);
    }
    .actions,
    .repay {
        display: flex;
        gap: 0.45rem;
        align-items: center;
    }
    .repay .field { max-width: 140px; }
</style>
