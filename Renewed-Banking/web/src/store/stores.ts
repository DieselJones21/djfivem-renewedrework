import { derived, writable } from "svelte/store";
import { FALLBACK } from "../i18n/fallback";
import { persist } from "../utils/persist";
import type { Account, CardSkin, Loan, LoanConfig, PageId } from "../types";

export const visibility = writable(false);
export const loading = writable(false);
export const notify = writable("");
export const activeAccount = writable<string | null>(null);
export const atm = writable(false);
export const currency = writable("USD");
export const page = writable<PageId>("overview");
export const hideBalance = writable(persist.read("rebel-bank-hide-balance", false));
export const cardSkin = writable<CardSkin>(persist.read("rebel-bank-card-skin", "rebel"));

export const popupDetails = writable({
    account: {} as Account | Record<string, never>,
    actionType: "",
});

export const accounts = writable<Account[]>([]);
export const loans = writable<Loan[]>([]);
export const pendingLoans = writable<Loan[]>([]);
export const isBanker = writable(false);
export const loanConfig = writable<LoanConfig>({
    enabled: true,
    minAmount: 1000,
    maxPersonal: 75000,
    maxJob: 250000,
    interestPercent: 8,
    terms: [7, 14, 28, 56],
});
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

hideBalance.subscribe((value) => persist.write("rebel-bank-hide-balance", value));
cardSkin.subscribe((value) => persist.write("rebel-bank-card-skin", value));
