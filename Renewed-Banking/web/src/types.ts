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

export interface Loan {
    id: number;
    account: string;
    accountType: "personal" | "job" | string;
    accountName?: string;
    applicantCid: string;
    applicantName: string;
    amount: number;
    interest: number;
    total: number;
    remaining: number;
    termDays: number;
    reason: string;
    status: "pending" | "approved" | "active" | "denied" | "paid" | string;
    bankerCid?: string | null;
    bankerName?: string | null;
    createdAt: number;
    decidedAt?: number | null;
}

export interface LoanConfig {
    enabled?: boolean;
    minAmount: number;
    maxPersonal: number;
    maxJob: number;
    interestPercent: number;
    terms: number[];
}

export type PageId = "overview" | "transactions" | "bills" | "loans" | "card" | "accounts";
export type CardSkin = "rebel" | "midnight" | "chrome" | "vice" | "gold" | "obsidian";
