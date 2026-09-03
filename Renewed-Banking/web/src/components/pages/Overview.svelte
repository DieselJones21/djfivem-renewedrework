<script lang="ts">
    import DonutChart from "../DonutChart.svelte";
    import TransactionTable from "../TransactionTable.svelte";
    import ActionPanel from "../ActionPanel.svelte";
    import { accounts, activeAccount, atm, hideBalance, t } from "../../store/stores";
    import { formatMoney, getStats, isFrozen, txStatus } from "../../utils/misc";

    export let requestConfirm: (opts: {
        action: "deposit" | "withdraw" | "transfer";
        amount: number;
        stateid?: string;
        comment?: string;
        title: string;
        to?: string;
    }) => void;

    let withdrawAmt: string | number = "";
    let depositAmt: string | number = "";
    let transferAmt: string | number = "";
    let transferTo = "";
    let withdrawNote = "";
    let depositNote = "";
    let transferNote = "";

    $: account = $accounts.find((item) => item.id === $activeAccount) || $accounts[0];
    $: stats = getStats(account);
    $: frozen = isFrozen(account);
    $: lastTx = (account?.transactions || []).slice(0, 6);
    $: lastTransfers = (account?.transactions || []).filter((tx) => txStatus(tx) === "sent").slice(0, 6);

    function parseAmt(value: string | number) {
        return Math.floor(Number(value) || 0);
    }

    function fill(which: "withdraw" | "deposit" | "transfer", n: number | "max") {
        if (!account) return;
        const max = which === "deposit" ? Number(account.cash || 0) : Number(account.amount || 0);
        const value = n === "max" ? max : n;
        if (which === "withdraw") withdrawAmt = value;
        if (which === "deposit") depositAmt = value;
        if (which === "transfer") transferAmt = value;
    }

    function go(action: "deposit" | "withdraw" | "transfer") {
        if (!account || frozen) return;
        const amount = parseAmt(action === "deposit" ? depositAmt : action === "withdraw" ? withdrawAmt : transferAmt);
        if (amount < 1) return;
        const comment = action === "deposit" ? depositNote : action === "withdraw" ? withdrawNote : transferNote;
        const stateid = action === "transfer" ? transferTo.trim() : undefined;
        if (action === "transfer" && !stateid) return;
        requestConfirm({
            action,
            amount,
            stateid,
            comment,
            title: action === "deposit" ? $t.confirm_deposit : action === "withdraw" ? $t.confirm_withdraw : $t.confirm_transfer,
            to: stateid,
        });
    }
</script>

{#if account}
    <div class="overview">
        <div class="stats">
            <article class="panel stat">
                <span>{$t.total_withdraw}</span>
                <strong class="mono">{formatMoney(stats.withdraw, $hideBalance)}</strong>
                <i class="fa-solid fa-arrow-up-from-bracket red"></i>
            </article>
            <article class="panel stat">
                <span>{$t.total_deposit}</span>
                <strong class="mono">{formatMoney(stats.deposit, $hideBalance)}</strong>
                <i class="fa-solid fa-arrow-down-to-bracket green"></i>
            </article>
            <article class="panel stat">
                <span>{$t.total_transfer}</span>
                <strong class="mono">{formatMoney(stats.transfer, $hideBalance)}</strong>
                <i class="fa-solid fa-paper-plane cyan"></i>
            </article>
        </div>

        <section class="panel balance">
            <div>
                <p class="kicker">{$t.my_account}</p>
                <h3>{$t.current_balance}</h3>
                <div class="amount mono">{formatMoney(account.amount, $hideBalance)}</div>
                <p class="muted week">{$t.insights}: {$t.week_spent} {formatMoney(stats.weekSpent, $hideBalance)} · {$t.week_gained} {formatMoney(stats.weekGained, $hideBalance)}</p>
            </div>
            <DonutChart
                withdrawPct={stats.withdrawPct}
                depositPct={stats.depositPct}
                withdrawLabel={$t.spent_ratio}
                depositLabel={$t.gained_ratio}
            />
        </section>

        <div class="tables">
            <section class="panel table-card">
                <div class="section-title">{$t.last_transactions}</div>
                <TransactionTable transactions={lastTx} compact empty={$t.empty_transactions} />
            </section>
            <section class="panel table-card">
                <div class="section-title">{$t.last_transfers}</div>
                <TransactionTable transactions={lastTransfers} compact empty={$t.empty_transactions} />
            </section>
        </div>

        <div class="actions">
            <ActionPanel
                title={$t.withdraw_money}
                actionLabel={$t.withdraw_but}
                tone="green"
                disabled={frozen}
                amount={withdrawAmt}
                comment={withdrawNote}
                maxLabel={$t.max}
                onAmount={(v) => withdrawAmt = v}
                onComment={(v) => withdrawNote = v}
                onQuick={(n) => fill("withdraw", n)}
                onSubmit={() => go("withdraw")}
            />
            {#if !$atm}
                <ActionPanel
                    title={$t.deposit_money}
                    actionLabel={$t.deposit_but}
                    tone="red"
                    disabled={frozen}
                    amount={depositAmt}
                    comment={depositNote}
                    maxLabel={$t.max}
                    onAmount={(v) => depositAmt = v}
                    onComment={(v) => depositNote = v}
                    onQuick={(n) => fill("deposit", n)}
                    onSubmit={() => go("deposit")}
                />
            {/if}
            <ActionPanel
                title={$t.transfer_money}
                actionLabel={$t.transfer_but}
                tone="blue"
                disabled={frozen}
                showRecipient
                amount={transferAmt}
                recipient={transferTo}
                comment={transferNote}
                recipientPlaceholder={$t.recipient}
                maxLabel={$t.max}
                onAmount={(v) => transferAmt = v}
                onRecipient={(v) => transferTo = v}
                onComment={(v) => transferNote = v}
                onQuick={(n) => fill("transfer", n)}
                onSubmit={() => go("transfer")}
            />
        </div>
    </div>
{/if}

<style>
    .overview {
        display: grid;
        grid-template-columns: minmax(0, 1fr) 300px;
        grid-template-rows: auto auto minmax(0, 1fr);
        gap: 0.9rem;
        height: 100%;
        min-height: 0;
    }
    .stats {
        grid-column: 1 / -1;
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 0.8rem;
    }
    .stat {
        padding: 0.9rem 1rem;
        position: relative;
        overflow: hidden;
    }
    .stat span {
        color: var(--muted);
        font-size: 0.75rem;
        letter-spacing: 0.06em;
        text-transform: uppercase;
    }
    .stat strong {
        display: block;
        margin-top: 0.35rem;
        font-size: 1.25rem;
    }
    .stat i {
        position: absolute;
        right: 1rem;
        top: 50%;
        transform: translateY(-50%);
        font-size: 1.2rem;
        opacity: 0.9;
    }
    .red { color: var(--red); }
    .green { color: var(--green); }
    .cyan { color: var(--cyan); }
    .balance {
        grid-column: 1;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.1rem 1.2rem;
        gap: 1rem;
    }
    .kicker {
        color: var(--cyan);
        font-size: 0.72rem;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        font-weight: 700;
    }
    h3 {
        margin: 0.25rem 0 0.15rem;
        font-size: 0.95rem;
        color: var(--muted);
        font-weight: 600;
    }
    .amount {
        font-size: 2rem;
        font-weight: 800;
        letter-spacing: -0.04em;
    }
    .week {
        margin-top: 0.45rem;
        font-size: 0.78rem;
    }
    .tables {
        grid-column: 1;
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0.8rem;
        min-height: 0;
    }
    .table-card {
        padding: 0.9rem;
        min-height: 0;
        display: flex;
        flex-direction: column;
    }
    .actions {
        grid-column: 2;
        grid-row: 2 / 4;
        display: flex;
        flex-direction: column;
        gap: 0.7rem;
        min-height: 0;
        overflow: auto;
    }
</style>
