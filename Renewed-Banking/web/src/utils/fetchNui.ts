/**
 * @param eventName - The endpoint eventname to target
 * @param data - Data you wish to send in the NUI Callback
 */
import { get } from "svelte/store";
import { accounts } from "../store/stores";
import { isEnvBrowser } from "./misc";
import type { Account, Transaction } from "../types";

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
