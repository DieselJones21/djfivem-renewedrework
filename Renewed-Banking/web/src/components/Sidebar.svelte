<script lang="ts">
    import Logo from "./Logo.svelte";
    import { page, t, visibility, popupDetails } from "../store/stores";
    import { fetchNui } from "../utils/fetchNui";
    import type { PageId } from "../types";

    const nav: PageId[] = ["overview", "transactions", "bills", "card", "accounts"];
    const icons: Record<PageId, string> = {
        overview: "fa-chart-pie",
        transactions: "fa-arrow-right-arrow-left",
        bills: "fa-file-invoice-dollar",
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
    <Logo />
    <nav>
        {#each nav as id}
            <button class:active={$page === id} on:click={() => page.set(id)}>
                <i class="fa-solid {icons[id]}"></i>
                <span>{$t[id]}</span>
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
        width: 210px;
        flex: 0 0 210px;
        background: linear-gradient(180deg, rgba(8, 12, 16, 0.96), rgba(5, 8, 12, 0.96));
        border-right: 1px solid var(--line);
        display: flex;
        flex-direction: column;
        padding: 0.75rem 0.7rem 1rem;
        position: relative;
    }
    aside::after {
        content: "";
        position: absolute;
        inset: 0;
        background: radial-gradient(circle at 20% 0%, rgba(61, 255, 240, 0.08), transparent 46%);
        pointer-events: none;
    }
    nav,
    .exit {
        position: relative;
        z-index: 1;
    }
    nav {
        display: flex;
        flex-direction: column;
        gap: 0.35rem;
        margin-top: 0.4rem;
        flex: 1;
    }
    nav button,
    .exit {
        display: flex;
        align-items: center;
        gap: 0.7rem;
        padding: 0.72rem 0.85rem;
        border-radius: 12px;
        color: #c4ccd6;
        font-weight: 650;
        font-size: 0.9rem;
        text-align: left;
    }
    nav button i {
        width: 1.1rem;
        text-align: center;
        color: var(--cyan);
    }
    nav button.active,
    nav button:hover {
        background: linear-gradient(180deg, rgba(61, 255, 240, 0.18), rgba(61, 255, 240, 0.08));
        color: #fff;
        box-shadow: inset 0 0 0 1px rgba(61, 255, 240, 0.22);
    }
    .exit {
        color: #ff8aa0;
        margin-top: auto;
    }
    .exit:hover {
        background: var(--red-dim);
    }
</style>
