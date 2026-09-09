/**
 * @param eventName - The endpoint eventname to target
 * @param data - Data you wish to send in the NUI Callback
 */
import { get } from "svelte/store";
import { accounts, isBanker, loanConfig, loans, pendingLoans } from "../store/stores";
import { isEnvBrowser } from "./misc";
import type { Account, Loan, Transaction } from "../types";

function packState(list?: Account[]) {
    return {
        accounts: list || get(accounts),
        loans: get(loans),
        pendingLoans: get(pendingLoans),
        isBanker: get(isBanker),
        loanConfig: get(loanConfig),
    };
}

const identity: string = atob("UmVuZXdlZC1CYW5raW5n");

function mockTransaction(partial: Partial<Transaction>): Transaction {
    return {
        trans_id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
        title: "Envy Bank",
        amount: 0,
        trans_type: "deposit",
        receiver: "You",
        message: "",
        issuer: "Envy Bank",
        time: Math.floor(Date.now() / 1000),
        ...partial,
    };
}

function mockAction(eventName: string, data: any): Account[] | false {
    const list = get(accounts).map((account) => ({
        ...account,
        transactions: [...(account.transactions || [])],
    }));
    const amount = Number(data?.amount);
    if (!amount || amount < 1) return false;

    const from = list.find((account) => account.id === data.fromAccount) || list[0];
    if (!from) return false;

    if (eventName === "deposit") {
        const cash = Number(from.cash || 0);
        if (cash < amount) return false;
        from.cash = cash - amount;
        from.amount = Number(from.amount) + amount;
        from.transactions.unshift(mockTransaction({
            title: `Personal Account / ${from.id}`,
            amount,
            trans_type: "deposit",
            receiver: from.name,
            issuer: from.name,
            message: data.comment || `Deposited $${amount}`,
        }));
    } else if (eventName === "withdraw") {
        if (Number(from.amount) < amount) return false;
        from.amount = Number(from.amount) - amount;
        from.cash = Number(from.cash || 0) + amount;
        from.transactions.unshift(mockTransaction({
            title: `Personal Account / ${from.id}`,
            amount,
            trans_type: "withdraw",
            receiver: from.name,
            issuer: from.name,
            message: data.comment || `Withdrew $${amount}`,
        }));
    } else if (eventName === "transfer") {
        if (Number(from.amount) < amount) return false;
        from.amount = Number(from.amount) - amount;
        from.transactions.unshift(mockTransaction({
            title: `Transfer / ${data.stateid}`,
            amount,
            trans_type: "withdraw",
            receiver: data.stateid,
            issuer: from.name,
            message: data.comment || `Transferred $${amount} to ${data.stateid}`,
        }));
    }
    return list;
}

function mockLoan(eventName: string, data: any) {
    const cfg = get(loanConfig);
    const list = get(accounts).map((account) => ({
        ...account,
        transactions: [...(account.transactions || [])],
    }));
    let mine = [...get(loans)];
    let queue = [...get(pendingLoans)];

    if (eventName === "applyLoan") {
        const amount = Number(data.amount);
        const account = list.find((item) => item.id === data.account) || list[0];
        if (!account || amount < cfg.minAmount) return false;
        const interest = cfg.interestPercent;
        const total = Math.floor(amount * (100 + interest) / 100);
        const loan: Loan = {
            id: Date.now(),
            account: account.id,
            accountType: account.id === list[0].id ? "personal" : "job",
            accountName: account.name,
            applicantCid: String(list[0].id),
            applicantName: list[0].name,
            amount,
            interest,
            total,
            remaining: total,
            termDays: Number(data.termDays),
            reason: String(data.reason || ""),
            status: "pending",
            createdAt: Math.floor(Date.now() / 1000),
        };
        mine = [loan, ...mine];
        queue = [loan, ...queue];
        loans.set(mine);
        pendingLoans.set(queue);
        return packState(list);
    }

    if (eventName === "decideLoan") {
        if (!get(isBanker)) return false;
        const decision = data.decision;
        const update = (loan: Loan) => {
            if (loan.id !== Number(data.loanId)) return loan;
            if (decision === "deny") return { ...loan, status: "denied", bankerName: "Preview Banker", decidedAt: Math.floor(Date.now() / 1000) };
            const target = list.find((item) => item.id === loan.account);
            if (target) {
                target.amount = Number(target.amount) + loan.amount;
                target.transactions.unshift(mockTransaction({
                    title: "Loan disbursement",
                    amount: loan.amount,
                    trans_type: "deposit",
                    receiver: target.name,
                    issuer: "Envy Bank",
                    message: "Approved Envy Bank loan",
                }));
            }
            return { ...loan, status: "active", bankerName: "Preview Banker", decidedAt: Math.floor(Date.now() / 1000) };
        };
        mine = mine.map(update);
        queue = queue.filter((loan) => loan.id !== Number(data.loanId));
        loans.set(mine);
        pendingLoans.set(queue);
        return packState(list);
    }

    if (eventName === "repayLoan") {
        const amount = Number(data.amount);
        const loan = mine.find((item) => item.id === Number(data.loanId));
        const account = loan && list.find((item) => item.id === loan.account);
        if (!loan || !account || amount < 1 || Number(account.amount) < amount) return false;
        account.amount = Number(account.amount) - amount;
        const remaining = Math.max(0, loan.remaining - amount);
        mine = mine.map((item) => item.id === loan.id ? { ...item, remaining, status: remaining <= 0 ? "paid" : "active" } : item);
        loans.set(mine);
        return packState(list);
    }

    return packState(list);
}

export async function fetchNui<T = any>(
    eventName: string,
    data: unknown = {}
): Promise<T> {
    if (isEnvBrowser()) {
        if (eventName === "closeInterface") return "ok" as unknown as T;
        if (eventName === "playSound") return "ok" as unknown as T;
        if (["deposit", "withdraw", "transfer"].includes(eventName)) {
            return mockAction(eventName, data) as unknown as T;
        }
        if (["applyLoan", "repayLoan", "decideLoan"].includes(eventName)) {
            return mockLoan(eventName, data) as unknown as T;
        }
        return {} as T;
    }

    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json; charset=UTF-8",
        },
        body: JSON.stringify(data),
    };

    const resp = await fetch(`https://${identity}/${eventName}`, options);
    return await resp.json();
}
