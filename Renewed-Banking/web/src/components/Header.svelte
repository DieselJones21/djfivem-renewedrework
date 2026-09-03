<script lang="ts">
    import { accounts, activeAccount, hideBalance, t } from "../store/stores";
    import { formatIban, initials } from "../utils/misc";
    import { setClipboard } from "../utils/setClipboad";
    import { toast } from "../utils/actions";

    $: account = $accounts.find((item) => item.id === $activeAccount) || $accounts[0];
    $: cashAccount = $accounts[0];

    function copy() {
        if (!account) return;
        setClipboard(String(account.id));
        toast($t.iban_copied);
    }
</script>

{#if account}
    <header>
        <div>
            <h1>{$t.welcome}</h1>
            <p>{$t.tagline}</p>
        </div>
        <div class="right">
            {#if cashAccount?.cash != null}
                <div class="cash">
                    <small>{$t.cash_on_hand}</small>
                    <strong class="mono">{ $hideBalance ? "••••" : `$${Number(cashAccount.cash).toLocaleString()}` }</strong>
                </div>
            {/if}
            <button class="eye" on:click={() => hideBalance.update((v) => !v)} title={$hideBalance ? $t.show_balance : $t.hide_balance}>
                <i class="fa-solid {$hideBalance ? 'fa-eye-slash' : 'fa-eye'}"></i>
            </button>
            <button class="profile" on:click={copy}>
                <i>{initials(account.name)}</i>
                <div>
                    <strong>{account.name}</strong>
                    <span>{formatIban(account.id)}</span>
                </div>
            </button>
        </div>
    </header>
{/if}

<style>
    header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 1rem;
        padding: 0.2rem 0.2rem 0.9rem;
    }
    h1 {
        font-size: 1.55rem;
        font-weight: 800;
        letter-spacing: -0.03em;
    }
    p {
        color: var(--muted);
        font-size: 0.9rem;
        margin-top: 0.15rem;
    }
    .right {
        display: flex;
        align-items: center;
        gap: 0.7rem;
    }
    .cash {
        text-align: right;
        padding-right: 0.4rem;
    }
    .cash small {
        display: block;
        color: var(--muted);
        font-size: 0.68rem;
        letter-spacing: 0.08em;
        text-transform: uppercase;
    }
    .eye,
    .profile {
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid var(--line);
        border-radius: 14px;
    }
    .eye {
        width: 42px;
        height: 42px;
        color: var(--cyan);
    }
    .profile {
        display: flex;
        align-items: center;
        gap: 0.7rem;
        padding: 0.4rem 0.75rem 0.4rem 0.4rem;
        text-align: left;
    }
    .profile i {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        display: grid;
        place-items: center;
        background: linear-gradient(180deg, #5cffef, #1aaea4);
        color: #041614;
        font-style: normal;
        font-weight: 800;
    }
    .profile strong {
        display: block;
        font-size: 0.88rem;
    }
    .profile span {
        display: block;
        color: var(--muted);
        font-size: 0.72rem;
        letter-spacing: 0.04em;
    }
</style>
