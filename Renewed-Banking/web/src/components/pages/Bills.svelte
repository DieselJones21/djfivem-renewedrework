<script lang="ts">
    import { accounts, activeAccount, t } from "../../store/stores";
    import { persist } from "../../utils/persist";
    import { formatMoney } from "../../utils/misc";
    import type { SavedBill } from "../../types";

    export let requestConfirm: (opts: any) => void;

    let name = "";
    let iban = "";
    let amount = "";
    let category = "other";

    $: account = $accounts.find((item) => item.id === $activeAccount) || $accounts[0];
    $: bills = persist.read<SavedBill[]>(`envy-bank-bills-${account?.id || "default"}`, []);

    function save(next: SavedBill[]) {
        persist.write(`envy-bank-bills-${account?.id || "default"}`, next);
        bills = next;
    }

    function addBill() {
        if (!name.trim() || !iban.trim() || !Number(amount)) return;
        save([...bills, { id: String(Date.now()), name: name.trim(), iban: iban.trim(), amount: Number(amount), category }]);
        name = "";
        iban = "";
        amount = "";
    }

    function pay(bill: SavedBill) {
        if (!account) return;
        requestConfirm({
            action: "transfer",
            amount: bill.amount,
            stateid: bill.iban,
            comment: `Bill: ${bill.name}`,
            title: $t.pay_bill,
            to: `${bill.name} (${bill.iban})`,
        });
    }
</script>

<div class="page">
    <section class="panel form">
        <div class="section-title">
            <span>{$t.add_bill}</span>
            <small class="muted">{$t.bill_hint}</small>
        </div>
        <div class="grid">
            <input class="field" placeholder={$t.bill_name} bind:value={name} />
            <input class="field" placeholder={$t.iban} bind:value={iban} />
            <input class="field" type="number" placeholder={$t.amount} bind:value={amount} />
            <select class="field" bind:value={category}>
                <option value="other">{$t.other}</option>
                <option value="food">{$t.food}</option>
                <option value="vehicles">{$t.vehicles}</option>
                <option value="fines">{$t.fines}</option>
            </select>
            <button class="btn btn-cyan" on:click={addBill}>{$t.save}</button>
        </div>
    </section>

    <section class="list scroller">
        {#if bills.length === 0}
            <div class="panel empty">{$t.no_bills}</div>
        {:else}
            {#each bills as bill (bill.id)}
                <article class="panel bill">
                    <div>
                        <strong>{bill.name}</strong>
                        <p class="muted">{bill.iban} · {$t[bill.category] || bill.category}</p>
                    </div>
                    <div class="right">
                        <span class="mono">{formatMoney(bill.amount)}</span>
                        <button class="btn btn-green" on:click={() => pay(bill)}>{$t.pay}</button>
                        <button class="chip" on:click={() => save(bills.filter((item) => item.id !== bill.id))}>{$t.delete}</button>
                    </div>
                </article>
            {/each}
        {/if}
    </section>
</div>

<style>
    .page {
        height: 100%;
        display: flex;
        flex-direction: column;
        gap: 0.85rem;
        min-height: 0;
    }
    .form {
        padding: 1rem;
    }
    .grid {
        display: grid;
        grid-template-columns: 1.1fr 1fr 0.7fr 0.7fr auto;
        gap: 0.5rem;
    }
    .list {
        display: flex;
        flex-direction: column;
        gap: 0.65rem;
        min-height: 0;
    }
    .bill,
    .empty {
        padding: 1rem 1.1rem;
    }
    .bill {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 1rem;
    }
    .right {
        display: flex;
        align-items: center;
        gap: 0.55rem;
    }
    .right span {
        font-weight: 800;
        min-width: 90px;
        text-align: right;
    }
</style>
