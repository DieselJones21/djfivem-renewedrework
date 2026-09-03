<script lang="ts">
    import { accounts, activeAccount, hideBalance, page, t } from "../../store/stores";
    import { accountKind, formatIban, formatMoney, initials, isFrozen } from "../../utils/misc";

    let filter: "all" | "personal" | "org" | "shared" = "all";
    $: cash = $accounts[0]?.cash ?? 0;
    $: list = $accounts.filter((account) => filter === "all" || accountKind(account) === filter);

    function select(id: string) {
        activeAccount.set(id);
        page.set("overview");
    }
</script>

<div class="page">
    <div class="toolbar">
        <div class="chips">
            {#each ["all", "personal", "org", "shared"] as key}
                <button class="chip" class:active={filter === key} on:click={() => filter = key}>
                    {key === "personal" ? $t.personal_tab : key === "org" ? $t.org_tab : key === "shared" ? $t.shared_tab : $t.all}
                </button>
            {/each}
        </div>
        <div class="cash panel">{$t.cash_on_hand}: <strong class="mono">{formatMoney(cash, $hideBalance)}</strong></div>
    </div>
    <section class="grid scroller">
        {#if list.length === 0}
            <p class="muted">{$t.account_not_found}</p>
        {:else}
            {#each list as account (account.id)}
                <button class="panel card" class:active={$activeAccount === account.id} on:click={() => select(account.id)}>
                    <div class="who">
                        <i>{initials(account.name)}</i>
                        <div>
                            <strong>{account.name}</strong>
                            <span>{account.type}{$t.account}/ {formatIban(account.id)}</span>
                        </div>
                    </div>
                    <div class="bal mono">{formatMoney(account.amount, $hideBalance)}</div>
                    <p class="muted">{isFrozen(account) ? $t.frozen : $t.available}</p>
                </button>
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
    .toolbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 0.8rem;
    }
    .chips { display: flex; gap: 0.35rem; }
    .cash {
        padding: 0.55rem 0.8rem;
        font-size: 0.85rem;
    }
    .grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
        gap: 0.8rem;
        align-content: start;
    }
    .card {
        padding: 1rem;
        text-align: left;
        color: inherit;
    }
    .card.active {
        box-shadow: inset 0 0 0 1px var(--line-strong), var(--glow);
    }
    .who {
        display: flex;
        gap: 0.7rem;
        align-items: center;
        margin-bottom: 1rem;
    }
    .who i {
        width: 38px;
        height: 38px;
        border-radius: 50%;
        display: grid;
        place-items: center;
        background: linear-gradient(180deg, #5cffef, #1aaea4);
        color: #041614;
        font-style: normal;
        font-weight: 800;
    }
    .who span {
        display: block;
        color: var(--muted);
        font-size: 0.72rem;
        margin-top: 0.15rem;
    }
    .bal {
        font-size: 1.35rem;
        font-weight: 800;
    }
</style>
