<script lang="ts">
    import Logo from "./Logo.svelte";
    import { isBanker, page, pendingLoans, t, visibility, popupDetails } from "../store/stores";
    import { fetchNui } from "../utils/fetchNui";
    import type { PageId } from "../types";

    const nav: PageId[] = ["overview", "transactions", "bills", "loans", "card", "accounts"];
    const icons: Record<PageId, string> = {
        overview: "fa-house",
        transactions: "fa-arrow-right-arrow-left",
        bills: "fa-file-invoice-dollar",
        loans: "fa-hand-holding-dollar",
        card: "fa-credit-card",
        accounts: "fa-wallet",
    };

    function close() {
        fetchNui("closeInterface");
        visibility.set(false);
        popupDetails.update((val) => ({ ...val, actionType: "" }));
    }
</script>

<aside>
    <Logo compact />
    <nav>
        {#each nav as id}
            <button class:active={$page === id} on:click={() => page.set(id)}>
                <i class="fa-solid {icons[id]}"></i>
                <span>{$t[id]}</span>
                {#if id === "loans" && $isBanker && $pendingLoans.length}
                    <em>{$pendingLoans.length}</em>
                {/if}
            </button>
        {/each}
    </nav>
    <button class="exit" on:click={close}>
        <i class="fa-solid fa-power-off"></i>
        <span>{$t.exit}</span>
    </button>
</aside>

<style>
    aside {
        width: 118px;
        flex: 0 0 118px;
        background: rgba(8, 10, 14, 0.55);
        border-right: 1px solid rgba(215, 222, 230, 0.08);
        display: flex;
        flex-direction: column;
        padding: 0.35rem 0.45rem 0.7rem;
    }
    nav {
        display: flex;
        flex-direction: column;
        gap: 0.28rem;
        margin-top: 0.2rem;
        flex: 1;
    }
    nav button,
    .exit {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.28rem;
        padding: 0.62rem 0.3rem;
        border-radius: 16px;
        color: #c5cdd6;
        font-weight: 650;
        font-size: 0.68rem;
        position: relative;
    }
    nav button i {
        font-size: 1.05rem;
        color: var(--chrome);
    }
    nav button.active,
    nav button:hover {
        background: var(--crimson-dim);
        color: #fff;
    }
    nav button.active i {
        color: var(--chrome);
    }
    nav button em {
        position: absolute;
        top: 0.28rem;
        right: 0.35rem;
        min-width: 1rem;
        height: 1rem;
        border-radius: 99px;
        background: var(--crimson);
        color: #fff;
        font-style: normal;
        font-size: 0.58rem;
        display: grid;
        place-items: center;
        padding: 0 0.2rem;
    }
    .exit {
        color: #ff8aa0;
        margin-top: auto;
    }
</style>
