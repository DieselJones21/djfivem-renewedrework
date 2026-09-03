export interface Transaction {
    trans_id: string;
    title: string;
    amount: number;
    trans_type: "deposit" | "withdraw" | string;
    receiver: string;
    message: string;
    issuer: string;
    time: number;
}

export interface Account {
    id: string;
    type: string;
    name: string;
    frozen: number | boolean;
    amount: number;
    cash?: number;
    transactions: Transaction[];
    auth?: Record<string, boolean>;
    creator?: string | null;
}

export interface SavingsGoal {
    id: string;
    name: string;
    target: number;
    saved: number;
}

export interface SavedBill {
    id: string;
    name: string;
    iban: string;
    amount: number;
    category: string;
}

export interface RecentRecipient {
    id: string;
    name: string;
    lastAmount: number;
    lastAt: number;
}

export type PageId = "overview" | "transactions" | "bills" | "card" | "accounts";
export type CardSkin = "envy" | "midnight" | "chrome" | "vice" | "gold" | "obsidian";
