<script lang="ts">
    import DebitCard from "../DebitCard.svelte";
    import SavingsGoals from "../SavingsGoals.svelte";
    import { accounts, activeAccount, cardSkin, t } from "../../store/stores";
    import { persist } from "../../utils/persist";
    import { formatIban, formatMoney } from "../../utils/misc";
    import { setClipboard } from "../../utils/setClipboad";
    import { toast } from "../../utils/actions";
    import type { CardSkin, RecentRecipient } from "../../types";

    export let requestConfirm: (opts: any) => void;

    const skins: CardSkin[] = ["envy", "midnight", "chrome", "vice", "gold", "obsidian"];
    let iban = "";
    let amount = "";
    let note = "";

    $: account = $accounts.find((item) => item.id === $activeAccount) || $accounts[0];
    $: recipients = persist.read<RecentRecipient[]>("envy-bank-recipients", []);

    function copy() {
        if (!account) return;
        setClipboard(String(account.id));
        toast($t.iban_copied);
    }

    function fast() {
        if (!account || !iban.trim() || Number(amount) < 1) return;
        requestConfirm({
            action: "transfer",
            amount: Number(amount),
            stateid: iban.trim(),
            comment: note || "Fast transfer",
            title: $t.fast_transfer,
            to: iban.trim(),
        });
    }
</script>

{#if account}
    <div class="page">
        <div class="left">
            <DebitCard name={account.name} id={account.id} large />
            <section class="panel skins">
                <div class="section-title">{$t.card_skins}</div>
                <div class="row">
                    {#each skins as skin}
                        <button class="swatch {skin}" class:active={$cardSkin === skin} on:click={() => cardSkin.set(skin)} title={$t[`skin_${skin}`]}></button>
                    {/each}
                </div>
            </section>
            <section class="panel copy">
                <div>
                    <small>{$t.iban}</small>
                    <strong>{formatIban(account.id)}</strong>
                </div>
                <button class="btn btn-cyan" on:click={copy}>{$t.copy_iban}</button>
            </section>
            <SavingsGoals accountId={account.id} />
        </div>
        <div class="right">
            <section class="panel fast">
                <div class="section-title">{$t.fast_transfer}</div>
                <input class="field" placeholder={$t.iban} bind:value={iban} />
                <input class="field" type="number" placeholder={$t.amount} bind:value={amount} />
                <input class="field" placeholder={$t.comment} bind:value={note} />
                <button class="btn btn-cyan" on:click={fast}>{$t.fast_transfer}</button>
            </section>
            <section class="panel recents">
                <div class="section-title">{$t.recent_recipients}</div>
                {#if recipients.length === 0}
                    <p class="muted">{$t.empty_transactions}</p>
                {:else}
                    <div class="chips">
                        {#each recipients as person}
                            <button class="chip" on:click={() => { iban = person.id; amount = String(person.lastAmount); }}>
                                {person.id} · {formatMoney(person.lastAmount)}
                            </button>
                        {/each}
                    </div>
                {/if}
            </section>
        </div>
    </div>
{/if}

<style>
    .page {
        display: grid;
        grid-template-columns: 1.15fr 0.85fr;
        gap: 1rem;
        height: 100%;
        min-height: 0;
    }
    .left,
    .right {
        display: flex;
        flex-direction: column;
        gap: 0.85rem;
        min-height: 0;
        overflow: auto;
    }
    .skins,
    .copy,
    .fast,
    .recents {
        padding: 1rem;
    }
    .row {
        display: flex;
        gap: 0.55rem;
        flex-wrap: wrap;
    }
    .swatch {
        width: 34px;
        height: 34px;
        border-radius: 50%;
        border: 2px solid transparent;
    }
    .swatch.active {
        border-color: #fff;
        box-shadow: var(--glow);
    }
    .envy { background: linear-gradient(135deg, #0e6f70, #3dfff0); }
    .midnight { background: linear-gradient(135deg, #172447, #4da3ff); }
    .chrome { background: linear-gradient(135deg, #8b959f, #d5dee6); }
    .vice { background: linear-gradient(135deg, #7a1ea3, #00d4c8); }
    .gold { background: linear-gradient(135deg, #8a6a28, #e6c57a); }
    .obsidian { background: linear-gradient(135deg, #1a1d22, #4a5560); }
    .copy {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 1rem;
    }
    .copy small {
        display: block;
        color: var(--muted);
        letter-spacing: 0.1em;
        font-size: 0.68rem;
        margin-bottom: 0.2rem;
    }
    .fast {
        display: flex;
        flex-direction: column;
        gap: 0.55rem;
    }
    .chips {
        display: flex;
        flex-wrap: wrap;
        gap: 0.4rem;
    }
</style>
