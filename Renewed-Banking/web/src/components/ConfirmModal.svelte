<script lang="ts">
    import { t } from "../store/stores";
    import { formatMoney } from "../utils/misc";

    export let open = false;
    export let title = "Confirm";
    export let amount = 0;
    export let from = "";
    export let to = "";
    export let note = "";
    export let onCancel: () => void;
    export let onConfirm: () => void;
</script>

{#if open}
    <div class="overlay" on:click={onCancel} on:keydown={() => {}}>
        <section class="panel modal" on:click|stopPropagation>
            <h3>{title}</h3>
            <dl>
                <div><dt>{$t.amount}</dt><dd class="mono">{formatMoney(amount)}</dd></div>
                {#if from}<div><dt>{$t.from}</dt><dd>{from}</dd></div>{/if}
                {#if to}<div><dt>{$t.to}</dt><dd>{to}</dd></div>{/if}
                {#if note}<div><dt>{$t.comment}</dt><dd>{note}</dd></div>{/if}
            </dl>
            <div class="row">
                <button class="btn btn-ghost" type="button" on:click={onCancel}>{$t.cancel}</button>
                <button class="btn btn-cyan" type="button" on:click={onConfirm}>{$t.confirm}</button>
            </div>
        </section>
    </div>
{/if}

<style>
    .overlay {
        position: absolute;
        inset: 0;
        background: rgba(4, 8, 12, 0.62);
        display: grid;
        place-items: center;
        z-index: 20;
        border-radius: 24px;
    }
    .modal {
        width: min(420px, 90%);
        padding: 1.4rem;
    }
    h3 {
        margin-bottom: 1rem;
        font-size: 1.1rem;
    }
    dl {
        display: grid;
        gap: 0.7rem;
        margin-bottom: 1.2rem;
    }
    dl div {
        display: flex;
        justify-content: space-between;
        gap: 1rem;
        color: var(--muted);
        font-size: 0.88rem;
    }
    dd {
        color: var(--text);
        font-weight: 700;
    }
    .row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0.6rem;
    }
</style>
