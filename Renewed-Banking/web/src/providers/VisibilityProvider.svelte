<script lang="ts">
    import { fetchNui } from "../utils/fetchNui";
    import { onMount } from "svelte";
    import {
        visibility,
        accounts,
        activeAccount,
        loading,
        notify,
        popupDetails,
        atm,
        translations,
        currency,
        page,
        loans,
        pendingLoans,
        isBanker,
        loanConfig,
    } from "../store/stores";
    import { FALLBACK } from "../i18n/fallback";
    import { useNuiEvent } from "../utils/useNuiEvent";
    import type { Account } from "../types";

    let isVisible = false;

    visibility.subscribe((visible) => {
        isVisible = visible;
    });

    useNuiEvent<any>("setVisible", (data) => {
        const list: Account[] = data.accounts || [];
        accounts.set(list);
        if (list[0]) activeAccount.set(list[0].id);
        visibility.set(data.status);
        loading.set(Boolean(data.loading));
        atm.set(Boolean(data.atm));
        loans.set(data.loans || []);
        pendingLoans.set(data.pendingLoans || []);
        isBanker.set(Boolean(data.isBanker));
        if (data.loanConfig) loanConfig.set(data.loanConfig);
        page.set("overview");
    });

    useNuiEvent<any>("setLoading", (data) => {
        loading.set(data.status);
    });

    useNuiEvent<any>("notify", (data) => {
        notify.set(data.status);
        setTimeout(() => notify.set(""), 3500);
    });

    useNuiEvent<any>("updateLocale", (data) => {
        translations.set({ ...FALLBACK, ...(data.translations || {}) });
        currency.set(data.currency || "USD");
    });

    onMount(() => {
        const keyHandler = (e: KeyboardEvent) => {
            if (!isVisible) return;
            const typing = e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement;
            if (["Escape"].includes(e.code)) {
                fetchNui("closeInterface");
                visibility.set(false);
                popupDetails.update((val) => ({ ...val, actionType: "" }));
            }
            if (typing) return;
            if (e.key === "1") page.set("overview");
            if (e.key === "2") page.set("transactions");
            if (e.key === "3") page.set("bills");
            if (e.key === "4") page.set("loans");
            if (e.key === "5") page.set("card");
            if (e.key === "6") page.set("accounts");
        };

        window.addEventListener("keydown", keyHandler);
        return () => window.removeEventListener("keydown", keyHandler);
    });
</script>

{#if isVisible}
    <slot />
{/if}
