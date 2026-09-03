import { currency } from "../store/stores";
import type { Account, Transaction } from "../types";

export const isEnvBrowser = (): boolean => !(window as any).invokeNative;

let activeCurrency = "USD";

currency.subscribe((value: string) => {
    activeCurrency = value || "USD";
});

export function formatMoney(number: number, hidden = false) {
    if (hidden) return "••••••";
    const value = Number(number) || 0;
    try {
        return value.toLocaleString("en-US", { style: "currency", currency: activeCurrency, maximumFractionDigits: 0 });
    } catch {
        return `$${value.toLocaleString("en-US")}`;
    }
}

export function formatIban(id: string) {
    const clean = String(id || "").replace(/\s+/g, "");
    if (!clean) return "ENVY 00 000000";
    if (/^\d+$/.test(clean) && clean.length <= 8) {
        return `ENVY 00 ${clean}`;
    }
    return `ENVY ${clean.toUpperCase()}`;
}

export function lastFour(id: string) {
    const clean = String(id || "0000");
    return clean.slice(-4).padStart(4, "0");
}

export function initials(name: string) {
    const parts = String(name || "EB").trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function cardExpiry(id: string) {
    let hash = 0;
    for (let i = 0; i < String(id).length; i++) {
        hash = (hash * 31 + String(id).charCodeAt(i)) >>> 0;
    }
    const month = String((hash % 12) + 1).padStart(2, "0");
    const year = 27 + (hash % 4);
    return `${month}/${year}`;
}

export function isFrozen(account?: Account | null) {
    if (!account) return false;
    return Boolean(account.frozen);
}

export function accountKind(account?: Account | null): "personal" | "org" | "shared" {
    if (!account) return "personal";
    const type = String(account.type || "").toLowerCase();
    if (type.includes("personal")) return "personal";
    if (account.creator) return "shared";
    return "org";
}

export function getTimeElapsed(seconds: number, dict: Record<string, string>): string {
    const timestamp = Math.floor(Date.now() / 1000) - Number(seconds || 0);
    const minutes = Math.floor(timestamp / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const replace = (template: string, value: number) => template.replace("%s", String(value));

    if (weeks > 1) return replace(dict.weeks, weeks);
    if (weeks === 1) return dict.aweek;
    if (days > 1) return replace(dict.days, days);
    if (days === 1) return dict.aday;
    if (hours > 1) return replace(dict.hours, hours);
    if (hours === 1) return dict.ahour;
    if (minutes > 1) return replace(dict.mins, minutes);
    if (minutes === 1) return dict.amin;
    return dict.secs;
}

export function formatDate(seconds: number) {
    const date = new Date(Number(seconds) * 1000);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export type TxCategory = "food" | "vehicles" | "fines" | "salary" | "transfer" | "other";

const CATEGORY_RULES: Array<{ key: TxCategory; pattern: RegExp }> = [
    { key: "food", pattern: /food|burger|restaurant|cafe|coffee|pizza|drink|bar/i },
    { key: "vehicles", pattern: /vehicle|car|moto|mechanic|ls custom|auto|garage|fuel|gas/i },
    { key: "fines", pattern: /fine|ticket|police|lspd|bail|impound/i },
    { key: "salary", pattern: /salary|paycheck|paycheque|wage|job payment|income/i },
    { key: "transfer", pattern: /transfer|sent|wire|iban/i },
];

export function categorize(tx: Transaction): TxCategory {
    const hay = `${tx.title || ""} ${tx.message || ""} ${tx.issuer || ""} ${tx.receiver || ""}`;
    for (const rule of CATEGORY_RULES) {
        if (rule.pattern.test(hay)) return rule.key;
    }
    if (String(tx.trans_type).toLowerCase() === "withdraw" && /transfer/i.test(hay)) return "transfer";
    return "other";
}

export function txStatus(tx: Transaction): "income" | "outcome" | "sent" {
    const type = String(tx.trans_type || "").toLowerCase();
    if (type === "deposit") return "income";
    if (categorize(tx) === "transfer" || /transfer/i.test(`${tx.title} ${tx.message}`)) return "sent";
    return "outcome";
}

export function getStats(account?: Account | null) {
    const transactions = account?.transactions || [];
    let withdraw = 0;
    let deposit = 0;
    let transfer = 0;
    const weekAgo = Math.floor(Date.now() / 1000) - 7 * 24 * 60 * 60;
    let weekSpent = 0;
    let weekGained = 0;

    for (const tx of transactions) {
        const amount = Number(tx.amount) || 0;
        const status = txStatus(tx);
        if (status === "income") deposit += amount;
        else if (status === "sent") transfer += amount;
        else withdraw += amount;

        if (Number(tx.time) >= weekAgo) {
            if (status === "income") weekGained += amount;
            else weekSpent += amount;
        }
    }

    const total = withdraw + deposit || 1;
    return {
        withdraw,
        deposit,
        transfer,
        weekSpent,
        weekGained,
        withdrawPct: Math.round((withdraw / total) * 100),
        depositPct: Math.round((deposit / total) * 100),
    };
}

export function playUiSound(sound = "PIN_BUTTON", set = "ATM_SOUNDS") {
    if (isEnvBrowser()) return;
    fetch(`https://${atob("UmVuZXdlZC1CYW5raW5n")}/playSound`, {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=UTF-8" },
        body: JSON.stringify({ sound, set }),
    }).catch(() => undefined);
}
