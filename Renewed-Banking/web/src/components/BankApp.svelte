<script lang="ts">
    import Sidebar from "./Sidebar.svelte";
    import Header from "./Header.svelte";
    import Overview from "./pages/Overview.svelte";
    import Transactions from "./pages/Transactions.svelte";
    import Bills from "./pages/Bills.svelte";
    import CardPage from "./pages/CardPage.svelte";
    import Accounts from "./pages/Accounts.svelte";
    import Loans from "./pages/Loans.svelte";
    import StatusBar from "./StatusBar.svelte";
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
    <div class="ipad">
        <div class="camera"></div>
        <div class="shell">
            <StatusBar />
            <div class="workspace">
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
                        {:else if $page === "loans"}
                            <Loans />
                        {:else if $page === "card"}
                            <CardPage {requestConfirm} />
                        {:else}
                            <Accounts />
                        {/if}
                    </div>
                </main>
            </div>
            <div class="home"></div>
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
</div>

<style>
    .root {
        width: 100vw;
        height: 100vh;
        display: grid;
        place-items: center;
        padding: 2vh 2vw;
    }
    .ipad {
        width: min(1440px, 94vw);
        height: min(920px, 94vh);
        padding: 14px 14px 16px;
        border-radius: 36px;
        background:
            linear-gradient(160deg, #f4f7fa 0%, #b7c0c8 18%, #8d969e 46%, #d5dde4 78%, #f7f9fb 100%);
        box-shadow:
            0 28px 80px rgba(0, 0, 0, 0.55),
            inset 0 1px 0 rgba(255, 255, 255, 0.75),
            inset 0 -2px 6px rgba(0, 0, 0, 0.25);
        position: relative;
    }
    .camera {
        position: absolute;
        top: 50%;
        left: 7px;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: radial-gradient(circle at 35% 35%, #6ee7ff, #123 70%);
        transform: translateY(-50%);
        box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.25);
    }
    .shell {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        position: relative;
        overflow: hidden;
        border-radius: 24px;
        background: linear-gradient(180deg, #0b0f14 0%, #07090d 100%);
        border: 1px solid rgba(255, 255, 255, 0.08);
    }
    .workspace {
        flex: 1;
        min-height: 0;
        display: flex;
    }
    .home {
        width: 132px;
        height: 5px;
        border-radius: 99px;
        background: rgba(215, 222, 230, 0.55);
        margin: 0.35rem auto 0.45rem;
    }
    main {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        padding: 0.35rem 1.05rem 0.55rem;
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
