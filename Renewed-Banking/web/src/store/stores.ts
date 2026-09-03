import { derived, writable } from "svelte/store";
import { FALLBACK } from "../i18n/fallback";
import { persist } from "../utils/persist";
import type { Account, CardSkin, PageId } from "../types";

export const visibility = writable(false);
export const loading = writable(false);
export const notify = writable("");
export const activeAccount = writable<string | null>(null);
export const atm = writable(false);
export const currency = writable("USD");
export const page = writable<PageId>("overview");
export const hideBalance = writable(persist.read("envy-bank-hide-balance", false));
export const cardSkin = writable<CardSkin>(persist.read("envy-bank-card-skin", "envy"));

export const popupDetails = writable({
    account: {} as Account | Record<string, never>,
    actionType: "",
});

export const accounts = writable<Account[]>([]);
export const translations = writable<Record<string, string>>({ ...FALLBACK });

export const t = derived(translations, (dict) => {
    const merged: Record<string, string> = { ...FALLBACK, ...(dict || {}) };
    return new Proxy(merged, {
        get(target, prop: string) {
            const value = target[prop];
            if (value && value !== prop) return value;
            return FALLBACK[prop] || prop;
        },
    });
});

hideBalance.subscribe((value) => persist.write("envy-bank-hide-balance", value));
cardSkin.subscribe((value) => persist.write("envy-bank-card-skin", value));
