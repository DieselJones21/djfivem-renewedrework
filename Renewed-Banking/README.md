# Renewed-Banking — Envy Roleplay Rework

Drop-in UI rework of [Renewed-Banking](https://github.com/Renewed-Scripts/Renewed-Banking) themed for **Envy Roleplay**.

The resource folder is named **`Renewed-Banking` on purpose**. Do not rename it. Every existing script that uses `exports['Renewed-Banking']:...` keeps working.

This is an adapted work of Renewed-Banking by uShifty / Renewed-Scripts, licensed under [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/). The original 2.0 UI was designed by qwadebot.

## Install

1. Copy the `Renewed-Banking` folder into your server `resources` directory.
2. Keep the folder name exactly `Renewed-Banking`.
3. Import `Renewed-Banking.sql` if you are not already running Renewed-Banking.
4. Add `ensure oxmysql`, `ensure ox_lib`, `ensure ox_target`, then `ensure Renewed-Banking`.
5. Replace any `qb-management` / `qb-banking` / `esx_society` money exports with the Renewed-Banking exports below.

## What changed in this rework

The Lua exports, callbacks, SQL, and NUI event names are unchanged. Only the interface and branding are new.

- Envy Roleplay cyan / chrome / black theme with the Envy logo
- Overview dashboard: stats, donut split, recent tables, inline withdraw / deposit / transfer
- Digital debit card with IBAN, copy-to-clipboard, and card skins
- Fast transfer plus recent recipients
- Saved bills / payees (one-tap transfer)
- Savings goals with progress bars (local, does not lock funds)
- Transaction search, status filters, category filters, and CSV export
- Personal / business / shared account switcher
- Hide-balance toggle, cash-on-hand, ATM compact mode
- Confirm modal, keyboard shortcuts (`1–5` pages, `Esc` close)

## Exports (unchanged)

```lua
exports['Renewed-Banking']:handleTransaction(account, title, amount, message, issuer, receiver, type, transID)
exports['Renewed-Banking']:getAccountMoney(account)
exports['Renewed-Banking']:addAccountMoney(account, amount)
exports['Renewed-Banking']:removeAccountMoney(account, amount)
exports['Renewed-Banking']:CreateJobAccount(job, initialBalance)
exports['Renewed-Banking']:GetJobAccount(jobName)
exports['Renewed-Banking']:addAccountMember(account, member)
exports['Renewed-Banking']:removeAccountMember(account, member)
exports['Renewed-Banking']:getAccountTransactions(account)
exports['Renewed-Banking']:changeAccountName(account, newName)
```

## Rebuild the UI (optional)

The built files in `web/public/build` are included. To edit the interface:

```bash
cd web
npm install
npm run build
```

Preview in a browser with `cd web && npm run start` (debug data is injected automatically outside FiveM).
