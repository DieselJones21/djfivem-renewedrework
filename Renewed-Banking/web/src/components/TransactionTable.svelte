<script lang="ts">
    import { t } from "../store/stores";
    import { formatDate, formatMoney, initials, txStatus } from "../utils/misc";
    import type { Transaction } from "../types";

    export let transactions: Transaction[] = [];
    export let compact = false;
    export let empty = "No recent activity";
    export let onSelect: ((tx: Transaction) => void) | null = null;

    $: rows = compact ? transactions.slice(0, 5) : transactions;
</script>

<div class="table wrap scroller">
    <div class="head">
        <span>{$t.name}</span>
        <span>{$t.date}</span>
        <span>{$t.amount}</span>
        <span>{$t.status}</span>
    </div>
    {#if rows.length === 0}
        <div class="empty">{empty}</div>
    {:else}
        {#each rows as tx (tx.trans_id)}
            <button class="row" type="button" on:click={() => onSelect && onSelect(tx)}>
                <span class="who">
                    <i>{initials(tx.issuer || tx.receiver || "EB")}</i>
                    <em>{tx.issuer || tx.title}</em>
                </span>
                <span class="muted">{formatDate(tx.time)}</span>
                <span class="mono" class:neg={txStatus(tx) !== "income"}>
                    {txStatus(tx) === "income" ? "+" : "-"}{formatMoney(tx.amount)}
                </span>
                <span>
                    <span class="badge {txStatus(tx)}">
                        {txStatus(tx) === "income" ? $t.income : txStatus(tx) === "sent" ? $t.sent : $t.outcome}
                    </span>
                </span>
            </button>
        {/each}
    {/if}
</div>

<style>
    .wrap {
        min-height: 0;
    }
    .head,
    .row {
        display: grid;
        grid-template-columns: 1.4fr 0.9fr 1fr 0.8fr;
        gap: 0.6rem;
        align-items: center;
        width: 100%;
        text-align: left;
    }
    .head {
        color: var(--muted);
        font-size: 0.72rem;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        padding: 0 0.4rem 0.55rem;
        border-bottom: 1px solid var(--line);
    }
    .row {
        padding: 0.7rem 0.4rem;
        border-radius: 10px;
        color: inherit;
        background: transparent;
    }
    .row:hover {
        background: rgba(61, 255, 240, 0.05);
    }
    .who {
        display: flex;
        align-items: center;
        gap: 0.55rem;
        min-width: 0;
    }
    .who i {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        display: grid;
        place-items: center;
        background: linear-gradient(180deg, #2ee6c8, #0f6d6c);
        color: #041614;
        font-size: 0.65rem;
        font-style: normal;
        font-weight: 800;
        flex: 0 0 auto;
    }
    .who em {
        font-style: normal;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        font-size: 0.86rem;
    }
    .empty {
        padding: 1.4rem 0.4rem;
        color: var(--muted);
        font-size: 0.86rem;
    }
    .neg {
        color: var(--red);
    }
    .mono:not(.neg) {
        color: var(--green);
    }
    .muted {
        color: var(--muted);
        font-size: 0.8rem;
    }
</style>
