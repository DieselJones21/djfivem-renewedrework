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
    <input
        class="field"
        type="text"
        placeholder="//"
        value={comment}
        disabled={disabled}
        on:input={(e) => onComment(val(e))}
    />
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
        padding: 0.95rem;
        display: flex;
        flex-direction: column;
        gap: 0.55rem;
        min-height: 0;
    }
    h4 {
        font-size: 0.92rem;
        font-weight: 700;
    }
    .green { box-shadow: inset 0 0 0 1px rgba(61, 220, 151, 0.18), var(--shadow); }
    .red { box-shadow: inset 0 0 0 1px rgba(255, 92, 122, 0.18), var(--shadow); }
    .blue { box-shadow: inset 0 0 0 1px rgba(77, 163, 255, 0.2), var(--shadow); }
    .quick {
        display: flex;
        flex-wrap: wrap;
        gap: 0.35rem;
    }
    .btn {
        margin-top: 0.15rem;
        width: 100%;
    }
</style>
