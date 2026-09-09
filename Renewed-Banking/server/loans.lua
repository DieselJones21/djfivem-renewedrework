local function loanCfg()
    return Config.loans or {}
end

local function serializeLoan(row)
    return {
        id = row.id,
        account = row.account,
        accountType = row.account_type,
        accountName = row.account_name,
        applicantCid = row.applicant_cid,
        applicantName = row.applicant_name,
        amount = row.amount,
        interest = row.interest,
        total = row.total,
        remaining = row.remaining,
        termDays = row.term_days,
        reason = row.reason,
        status = row.status,
        bankerCid = row.banker_cid,
        bankerName = row.banker_name,
        createdAt = row.created_at,
        decidedAt = row.decided_at
    }
end

local function getAccessibleAccount(source, accountId)
    local Player = GetPlayerObject(source)
    if not Player then return nil end
    local cid = GetIdentifier(Player)
    local data = getBankData(source)
    for i = 1, #data do
        if data[i] and data[i].id == accountId then
            local kind = accountId == cid and 'personal' or 'job'
            return data[i], kind, Player, cid
        end
    end
    return nil
end

local function countOpenLoans(accountId)
    local count = MySQL.scalar.await('SELECT COUNT(*) FROM bank_loans WHERE account = ? AND status IN (?, ?, ?)', {
        accountId, 'pending', 'approved', 'active'
    })
    return tonumber(count) or 0
end

local function notifyBankers(message)
    for _, id in ipairs(GetPlayers()) do
        local ply = GetPlayerObject(tonumber(id))
        if ply and IsBanker(ply) then
            Notify(tonumber(id), { title = locale('bank_name'), description = message, type = 'inform' })
        end
    end
end

local function notifyApplicant(cid, message, ntype)
    local ply = GetPlayerObjectFromID(cid)
    if not ply then return end
    local src = GetPlayerSource(ply)
    if src then
        Notify(src, { title = locale('bank_name'), description = message, type = ntype or 'inform' })
    end
end

function DisbursePendingPersonalLoans(source)
    local Player = GetPlayerObject(source)
    if not Player then return end
    local cid = GetIdentifier(Player)
    local rows = MySQL.query.await('SELECT * FROM bank_loans WHERE applicant_cid = ? AND account_type = ? AND status = ?', {
        cid, 'personal', 'approved'
    }) or {}
    for i = 1, #rows do
        local loan = rows[i]
        AddMoney(Player, loan.amount, 'bank', locale('loan_disburse') or 'Loan disbursement')
        handleTransaction(loan.account, locale('personal_acc') .. loan.account, loan.amount, locale('loan_disburse_msg') or 'Approved personal loan', locale('bank_name'), GetCharacterName(Player), 'deposit')
        MySQL.update.await('UPDATE bank_loans SET status = ? WHERE id = ?', { 'active', loan.id })
    end
end

function BuildLoanPayload(source)
    local Player = GetPlayerObject(source)
    if not Player then
        return { loans = {}, pendingLoans = {}, isBanker = false, loanConfig = {} }
    end
    local cid = GetIdentifier(Player)
    local cfg = loanCfg()
    local mine = MySQL.query.await('SELECT * FROM bank_loans WHERE applicant_cid = ? ORDER BY id DESC LIMIT 40', { cid }) or {}
    local loans = {}
    for i = 1, #mine do
        loans[#loans + 1] = serializeLoan(mine[i])
    end

    local isBanker = IsBanker(Player)
    local pendingLoans = {}
    if isBanker then
        local queue = MySQL.query.await('SELECT * FROM bank_loans WHERE status = ? ORDER BY id ASC LIMIT 80', { 'pending' }) or {}
        for i = 1, #queue do
            pendingLoans[#pendingLoans + 1] = serializeLoan(queue[i])
        end
    end

    return {
        loans = loans,
        pendingLoans = pendingLoans,
        isBanker = isBanker,
        loanConfig = {
            enabled = cfg.enabled ~= false,
            minAmount = cfg.minAmount or 1000,
            maxPersonal = cfg.maxPersonal or 75000,
            maxJob = cfg.maxJob or 250000,
            interestPercent = cfg.interestPercent or 8,
            terms = cfg.terms or { 7, 14, 28, 56 }
        }
    }
end

local function loanResponse(source, ok, message)
    if not ok and message then
        TriggerClientEvent('Renewed-Banking:client:sendNotification', source, message)
        return false
    end
    local payload = {
        accounts = getBankData(source)
    }
    local extra = BuildLoanPayload(source)
    for key, value in pairs(extra) do
        payload[key] = value
    end
    return payload
end

lib.callback.register('Renewed-Banking:server:applyLoan', function(source, data)
    local cfg = loanCfg()
    if cfg.enabled == false then
        return loanResponse(source, false, locale('loan_disabled') or 'Loans are disabled')
    end
    local amount = tonumber(data and data.amount)
    local term = tonumber(data and data.termDays)
    local reason = data and tostring(data.reason or '')
    local accountId = data and data.account
    if not amount or amount < (cfg.minAmount or 1000) then
        return loanResponse(source, false, locale('invalid_amount', 'loan') or 'Invalid loan amount')
    end
    local allowedTerm = false
    for i = 1, #(cfg.terms or {}) do
        if cfg.terms[i] == term then allowedTerm = true end
    end
    if not allowedTerm then
        return loanResponse(source, false, locale('loan_bad_term') or 'Invalid loan term')
    end
    if reason == '' then
        return loanResponse(source, false, locale('loan_need_reason') or 'Add a reason for this loan')
    end

    local account, kind, Player, cid = getAccessibleAccount(source, accountId)
    if not account or not Player then
        return loanResponse(source, false, locale('no_account') or 'Account not found')
    end
    if account.frozen and account.frozen ~= 0 then
        return loanResponse(source, false, locale('frozen') or 'Account is frozen')
    end

    local maxAmount = kind == 'personal' and (cfg.maxPersonal or 75000) or (cfg.maxJob or 250000)
    if amount > maxAmount then
        return loanResponse(source, false, locale('loan_too_large') or 'Amount is above the limit for this account')
    end
    if countOpenLoans(accountId) >= (cfg.maxActivePerAccount or 1) then
        return loanResponse(source, false, locale('loan_already_open') or 'This account already has an open loan')
    end

    local interest = cfg.interestPercent or 8
    local total = math.floor(amount * (100 + interest) / 100)
    MySQL.insert.await('INSERT INTO bank_loans (account, account_type, account_name, applicant_cid, applicant_name, amount, interest, total, remaining, term_days, reason, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', {
        accountId,
        kind,
        account.name,
        cid,
        GetCharacterName(Player),
        amount,
        interest,
        total,
        total,
        term,
        reason:sub(1, 240),
        'pending',
        os.time()
    })
    notifyBankers((locale('loan_new_request') or '%s requested a $%s loan'):format(GetCharacterName(Player), amount))
    return loanResponse(source, true)
end)

lib.callback.register('Renewed-Banking:server:repayLoan', function(source, data)
    local loanId = tonumber(data and data.loanId)
    local amount = tonumber(data and data.amount)
    if not loanId or not amount or amount < 1 then
        return loanResponse(source, false, locale('invalid_amount', 'repay') or 'Invalid repayment')
    end
    local row = MySQL.single.await('SELECT * FROM bank_loans WHERE id = ?', { loanId })
    if not row or (row.status ~= 'active' and row.status ~= 'approved') then
        return loanResponse(source, false, locale('loan_not_found') or 'Loan not found')
    end
    local account = getAccessibleAccount(source, row.account)
    if not account then
        return loanResponse(source, false, locale('no_account') or 'Account not found')
    end
    amount = math.min(amount, tonumber(row.remaining) or 0)
    if amount < 1 then
        return loanResponse(source, false, locale('loan_already_paid') or 'Loan is already paid')
    end

    local Player = GetPlayerObject(source)
    local paid = false
    if cachedAccounts[row.account] then
        paid = RemoveAccountMoney(row.account, amount)
    else
        paid = RemoveMoney(Player, amount, 'bank', locale('loan_repay') or 'Loan repayment')
    end
    if not paid then
        return loanResponse(source, false, locale('not_enough_money'))
    end

    handleTransaction(row.account, locale('loan_repay') or 'Loan repayment', amount, locale('loan_repay_msg') or 'Loan payment', GetCharacterName(Player), locale('bank_name'), 'withdraw')
    local remaining = (tonumber(row.remaining) or 0) - amount
    local status = remaining <= 0 and 'paid' or 'active'
    MySQL.update.await('UPDATE bank_loans SET remaining = ?, status = ? WHERE id = ?', { math.max(remaining, 0), status, loanId })
    return loanResponse(source, true)
end)

lib.callback.register('Renewed-Banking:server:decideLoan', function(source, data)
    local Player = GetPlayerObject(source)
    if not Player or not IsBanker(Player) then
        return loanResponse(source, false, locale('loan_not_banker') or 'Only a banker can decide loans')
    end
    local loanId = tonumber(data and data.loanId)
    local decision = data and data.decision
    if not loanId or (decision ~= 'approve' and decision ~= 'deny') then
        return loanResponse(source, false, locale('loan_bad_decision') or 'Invalid decision')
    end
    local row = MySQL.single.await('SELECT * FROM bank_loans WHERE id = ?', { loanId })
    if not row or row.status ~= 'pending' then
        return loanResponse(source, false, locale('loan_not_found') or 'Loan not found')
    end

    local bankerCid = GetIdentifier(Player)
    local bankerName = GetCharacterName(Player)
    if decision == 'deny' then
        MySQL.update.await('UPDATE bank_loans SET status = ?, banker_cid = ?, banker_name = ?, decided_at = ? WHERE id = ?', {
            'denied', bankerCid, bankerName, os.time(), loanId
        })
        notifyApplicant(row.applicant_cid, locale('loan_denied') or 'Your loan was denied', 'error')
        return loanResponse(source, true)
    end

    local status = 'active'
    if row.account_type == 'personal' then
        local borrower = GetPlayerObjectFromID(row.applicant_cid)
        if borrower then
            AddMoney(borrower, row.amount, 'bank', locale('loan_disburse') or 'Loan disbursement')
            handleTransaction(row.account, locale('personal_acc') .. row.account, row.amount, locale('loan_disburse_msg') or 'Approved personal loan', locale('bank_name'), row.applicant_name, 'deposit')
        else
            status = 'approved'
        end
    else
        if not cachedAccounts[row.account] then
            return loanResponse(source, false, locale('invalid_account', row.account))
        end
        AddAccountMoney(row.account, row.amount)
        handleTransaction(row.account, row.account_name or row.account, row.amount, locale('loan_disburse_msg') or 'Approved job loan', locale('bank_name'), row.account_name or row.account, 'deposit')
    end

    MySQL.update.await('UPDATE bank_loans SET status = ?, banker_cid = ?, banker_name = ?, decided_at = ? WHERE id = ?', {
        status, bankerCid, bankerName, os.time(), loanId
    })
    notifyApplicant(row.applicant_cid, locale('loan_approved') or 'Your loan was approved', 'success')
    return loanResponse(source, true)
end)

exports('getAccountLoans', function(account)
    local rows = MySQL.query.await('SELECT * FROM bank_loans WHERE account = ? ORDER BY id DESC', { account }) or {}
    local list = {}
    for i = 1, #rows do
        list[#list + 1] = serializeLoan(rows[i])
    end
    return list
end)
