import { fetchNui } from "./fetchNui";
import { accounts, isBanker, loading, loanConfig, loans, notify, pendingLoans } from "../store/stores";
import { persist } from "./persist";
import { playUiSound } from "./misc";
import type { RecentRecipient } from "../types";

export function applyLoanPayload(result: any) {
    if (!result || result === false) return false;
    if (Array.isArray(result)) {
        accounts.set(result);
        return true;
    }
    if (result.accounts) accounts.set(result.accounts);
    if (result.loans) loans.set(result.loans);
    if (result.pendingLoans) pendingLoans.set(result.pendingLoans);
    if (typeof result.isBanker === "boolean") isBanker.set(result.isBanker);
    if (result.loanConfig) loanConfig.set(result.loanConfig);
    return true;
}

export function toast(message: string, ms = 3200) {
    notify.set(message);
    setTimeout(() => notify.set(""), ms);
}

export async function submitBankAction(
    action: "deposit" | "withdraw" | "transfer",
    payload: { fromAccount: string; amount: number; comment?: string; stateid?: string }
) {
    loading.set(true);
    playUiSound("PIN_BUTTON", "ATM_SOUNDS");
    try {
        const result = await fetchNui(action, payload);
        if (result !== false && applyLoanPayload(result)) {
            if (action === "transfer" && payload.stateid) {
                const recent = persist.read<RecentRecipient[]>("envy-bank-recipients", []);
                const next = [
                    { id: payload.stateid, name: payload.stateid, lastAmount: payload.amount, lastAt: Date.now() },
                    ...recent.filter((item) => item.id !== payload.stateid),
                ].slice(0, 8);
                persist.write("envy-bank-recipients", next);
            }
            playUiSound("LOCAL_PLYR_CASH_COUNTER_COMPLETE", "DLC_HEISTS_GENERAL_FRONTEND_SOUNDS");
            return result;
        }
        toast("Transaction failed");
        return false;
    } catch {
        toast("Transaction failed");
        return false;
    } finally {
        loading.set(false);
    }
}

export async function submitLoanAction(
    action: "applyLoan" | "repayLoan" | "decideLoan",
    payload: Record<string, unknown>
) {
    loading.set(true);
    playUiSound("PIN_BUTTON", "ATM_SOUNDS");
    try {
        const result = await fetchNui(action, payload);
        if (result !== false && applyLoanPayload(result)) {
            playUiSound("LOCAL_PLYR_CASH_COUNTER_COMPLETE", "DLC_HEISTS_GENERAL_FRONTEND_SOUNDS");
            return result;
        }
        toast("Loan action failed");
        return false;
    } catch {
        toast("Loan action failed");
        return false;
    } finally {
        loading.set(false);
    }
}
