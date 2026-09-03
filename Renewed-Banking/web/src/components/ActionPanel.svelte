<script lang="ts">
    export let title: string;
    export let actionLabel: string;
    export let tone: "green" | "red" | "blue" = "green";
    export let disabled = false;
    export let showRecipient = false;
    export let recipient = "";
    export let amount: number | string = "";
    export let comment = "";
    export let placeholder = "$";
    export let recipientPlaceholder = "IBAN / Citizen ID";
    export let onSubmit: () => void;
    export let onAmount: (value: string) => void = () => undefined;
    export let onRecipient: (value: string) => void = () => undefined;
    export let onComment: (value: string) => void = () => undefined;
    export let showComment = false;
    export let quick: number[] = [100, 500, 1000, 5000];
    export let onQuick: (n: number | "max") => void = () => undefined;
    export let maxLabel = "MAX";

    function val(e: Event) {
        return (e.currentTarget as HTMLInputElement).value;
    }
</script>

<section class="panel action {tone}">
    <h4>{title}</h4>
    <input
        class="field"
        type="number"
        min="1"
        placeholder={placeholder}
        value={amount}
        disabled={disabled}
        on:input={(e) => onAmount(val(e))}
    />
    {#if showRecipient}
        <input
            class="field"
            type="text"
            placeholder={recipientPlaceholder}
            value={recipient}
            disabled={disabled}
            on:input={(e) => onRecipient(val(e))}
        />
    {/if}
    {#if showComment}
        <input
            class="field"
            type="text"
            placeholder="//"
            value={comment}
            disabled={disabled}
            on:input={(e) => onComment(val(e))}
        />
    {/if}
    <div class="quick">
        {#each quick as n}
            <button class="chip" type="button" disabled={disabled} on:click={() => onQuick(n)}>${n.toLocaleString()}</button>
        {/each}
        <button class="chip" type="button" disabled={disabled} on:click={() => onQuick("max")}>{maxLabel}</button>
    </div>
    <button class="btn btn-{tone === "green" ? "green" : tone === "red" ? "red" : "blue"}" disabled={disabled} on:click={onSubmit}>
        {actionLabel}
    </button>
</section>

<style>
    .action {
        padding: 0.7rem 0.8rem 0.75rem;
        display: flex;
        flex-direction: column;
        gap: 0.4rem;
        min-height: 0;
        flex: 1 1 0;
    }
    h4 {
        font-size: 0.82rem;
        font-weight: 700;
    }
    .action :global(.field) {
        padding: 0.55rem 0.7rem;
        font-size: 0.84rem;
    }
    .green { box-shadow: inset 0 0 0 1px rgba(61, 220, 151, 0.18), var(--shadow); }
    .red { box-shadow: inset 0 0 0 1px rgba(255, 92, 122, 0.18), var(--shadow); }
    .blue { box-shadow: inset 0 0 0 1px rgba(77, 163, 255, 0.2), var(--shadow); }
    .quick {
        display: flex;
        flex-wrap: nowrap;
        gap: 0.28rem;
    }
    .quick :global(.chip) {
        padding: 0.22rem 0.45rem;
        font-size: 0.68rem;
        flex: 1;
    }
    .btn {
        margin-top: auto;
        width: 100%;
        padding: 0.62rem 0.8rem;
        flex-shrink: 0;
    }
</style>
