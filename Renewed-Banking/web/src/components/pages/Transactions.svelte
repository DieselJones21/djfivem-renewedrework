<script lang="ts">
    import TransactionTable from "../TransactionTable.svelte";
    import { accounts, activeAccount, atm, t } from "../../store/stores";
    import { categorize, txStatus } from "../../utils/misc";
    import { convertToCSV } from "../../utils/convertToCSV";
    import { setClipboard } from "../../utils/setClipboad";
    import { toast } from "../../utils/actions";
    import type { Transaction } from "../../types";
    import type { TxCategory } from "../../utils/misc";

    let query = "";
    let status: "all" | "income" | "outcome" | "sent" = "all";
    let category: "all" | TxCategory = "all";
    let selected: Transaction | null = null;

    $: account = $accounts.find((item) => item.id === $activeAccount) || $accounts[0];
    $: filtered = (account?.transactions || []).filter((tx) => {
        const hay = `${tx.message} ${tx.trans_id} ${tx.receiver} ${tx.issuer} ${tx.title}`.toLowerCase();
        if (query && !hay.includes(query.toLowerCase())) return false;
        if (status !== "all" && txStatus(tx) !== status) return false;
        if (category !== "all" && categorize(tx) !== category) return false;
        return true;
    });

    function exportCsv() {
        if (!account?.transactions?.length) {
            toast($t.no_export);
            return;
        }
        setClipboard(convertToCSV(account.transactions));
        toast($t.data_copied);
    }
</script>

<div class="page">
    <div class="toolbar">
        <input class="field" bind:value={query} placeholder={$t.search_placeholder} />
        <div class="chips">
            {#each ["all", "income", "outcome", "sent"] as key}
                <button class="chip" class:active={status === key} on:click={() => status = key}>{$t[key]}</button>
            {/each}
        </div>
        <div class="chips">
            {#each ["all", "food", "vehicles", "fines", "salary", "transfer", "other"] as key}
                <button class="chip" class:active={category === key} on:click={() => category = key}>
                    {key === "transfer" ? $t.cat_transfer : $t[key] || key}
                </button>
            {/each}
        </div>
        {#if !$atm}
            <button class="btn btn-cyan" on:click={exportCsv}><i class="fa-solid fa-file-export"></i> {$t.export_data}</button>
        {/if}
    </div>
    <section class="panel list">
        <TransactionTable transactions={filtered} empty={$t.trans_not_found} onSelect={(tx) => selected = tx} />
    </section>
</div>

{#if selected}
    <aside class="panel detail">
        <header>
            <strong>{$t.details}</strong>
            <button class="chip" on:click={() => selected = null}>{$t.close}</button>
        </header>
        <p><span>{$t.amount}</span> ${Number(selected.amount).toLocaleString()}</p>
        <p><span>{$t.issuer}</span> {selected.issuer}</p>
        <p><span>{$t.receiver}</span> {selected.receiver}</p>
        <p><span>{$t.ref}</span> {selected.trans_id}</p>
        <p><span>{$t.message}</span> {selected.message}</p>
    </aside>
{/if}

<style>
    .page {
        height: 100%;
        display: flex;
        flex-direction: column;
        gap: 0.8rem;
        min-width: 0;
        flex: 1;
    }
    .toolbar {
        display: flex;
        flex-wrap: wrap;
        gap: 0.55rem;
        align-items: center;
    }
    .toolbar .field {
        flex: 1 1 220px;
    }
    .chips {
        display: flex;
        flex-wrap: wrap;
        gap: 0.3rem;
    }
    .list {
        flex: 1;
        min-height: 0;
        padding: 0.9rem;
        display: flex;
        flex-direction: column;
    }
    .detail {
        position: absolute;
        right: 1.1rem;
        top: 5.6rem;
        bottom: 1.1rem;
        width: 280px;
        padding: 1rem;
        z-index: 5;
    }
    .detail header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.9rem;
    }
    .detail p {
        margin-bottom: 0.7rem;
        font-size: 0.86rem;
        word-break: break-word;
    }
    .detail span {
        display: block;
        color: var(--muted);
        font-size: 0.7rem;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        margin-bottom: 0.15rem;
    }
</style>
