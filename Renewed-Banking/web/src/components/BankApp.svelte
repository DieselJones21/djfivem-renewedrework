<script lang="ts">
    import Sidebar from "./Sidebar.svelte";
    import Header from "./Header.svelte";
    import Overview from "./pages/Overview.svelte";
    import Transactions from "./pages/Transactions.svelte";
    import Bills from "./pages/Bills.svelte";
    import CardPage from "./pages/CardPage.svelte";
    import Accounts from "./pages/Accounts.svelte";
    import ConfirmModal from "./ConfirmModal.svelte";
    import { accounts, activeAccount, atm, page, t } from "../store/stores";
    import { isFrozen } from "../utils/misc";
    import { submitBankAction } from "../utils/actions";

    let pending: null | {
        action: "deposit" | "withdraw" | "transfer";
        amount: number;
        stateid?: string;
        comment?: string;
        title: string;
        to?: string;
    } = null;

    $: account = $accounts.find((item) => item.id === $activeAccount) || $accounts[0];
    $: frozen = isFrozen(account);

    function requestConfirm(opts: typeof pending) {
        pending = opts;
    }

    async function confirm() {
        if (!pending || !account) return;
        const payload = {
            fromAccount: account.id,
            amount: pending.amount,
            comment: pending.comment || "",
            stateid: pending.stateid,
        };
        const action = pending.action;
        pending = null;
        await submitBankAction(action, payload);
    }
</script>

<div class="root">
    <div class="shell">
        <div class="glow"></div>
        <Sidebar />
        <main>
            <Header />
            {#if $atm}
                <div class="banner">{$t.atm_notice}</div>
            {/if}
            {#if frozen}
                <div class="banner freeze">{$t.frozen_notice}</div>
            {/if}
            <div class="content">
                {#if $page === "overview"}
                    <Overview {requestConfirm} />
                {:else if $page === "transactions"}
                    <Transactions />
                {:else if $page === "bills"}
                    <Bills {requestConfirm} />
                {:else if $page === "card"}
                    <CardPage {requestConfirm} />
                {:else}
                    <Accounts />
                {/if}
            </div>
        </main>
        <ConfirmModal
            open={Boolean(pending)}
            title={pending?.title || $t.confirm}
            amount={pending?.amount || 0}
            from={account ? `${account.name} · ${account.id}` : ""}
            to={pending?.to || ""}
            note={pending?.comment || ""}
            onCancel={() => pending = null}
            onConfirm={confirm}
        />
    </div>
</div>

<style>
    .root {
        width: 100vw;
        height: 100vh;
        display: grid;
        place-items: center;
        padding: 2.4vh 2vw;
    }
    .shell {
        width: min(1480px, 94vw);
        height: min(900px, 92vh);
        display: flex;
        position: relative;
        overflow: hidden;
        border-radius: 24px;
        background:
            radial-gradient(1200px 400px at 80% -10%, rgba(61, 255, 240, 0.12), transparent 50%),
            linear-gradient(180deg, rgba(12, 16, 24, 0.96), rgba(7, 10, 16, 0.96));
        border: 1px solid rgba(61, 255, 240, 0.16);
        box-shadow: 0 30px 80px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(255, 255, 255, 0.04) inset;
    }
    .glow {
        position: absolute;
        inset: auto -10% -30% 40%;
        height: 50%;
        background: radial-gradient(circle, rgba(61, 255, 240, 0.08), transparent 60%);
        pointer-events: none;
    }
    main {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        padding: 1.1rem 1.15rem 1rem;
        position: relative;
        z-index: 1;
    }
    .content {
        flex: 1;
        min-height: 0;
        position: relative;
        display: flex;
        flex-direction: column;
    }
    .content > :global(*) {
        flex: 1;
        min-height: 0;
        height: 100%;
    }
    .banner {
        background: var(--cyan-dim);
        border: 1px solid var(--line-strong);
        color: var(--cyan);
        border-radius: 10px;
        padding: 0.45rem 0.75rem;
        font-size: 0.78rem;
        margin-bottom: 0.7rem;
    }
    .freeze {
        background: var(--red-dim);
        border-color: rgba(255, 92, 122, 0.35);
        color: #ff8aa0;
    }
</style>
