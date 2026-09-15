local isVisible = false
local progressBar = Config.progressbar == 'circle' and lib.progressCircle or lib.progressBar
PlayerPed = cache.ped

lib.onCache('ped', function(newPed)
	PlayerPed = newPed
end)

local function nuiHandler(val)
    isVisible = val
    SetNuiFocus(val, val)
end

local function openBankUI(isAtm)
    SendNUIMessage({action = 'setLoading', status = true})
    nuiHandler(true)
    lib.callback('renewed-banking:server:initalizeBanking', false, function(payload)
        if not payload then
            nuiHandler(false)
            lib.notify({title = locale('bank_name'), description = locale('loading_failed'), type = 'error'})
            return
        end
        local accounts = payload.accounts or payload
        SetTimeout(1000, function()
            SendNUIMessage({
                action = 'setVisible',
                status = isVisible,
                accounts = accounts,
                loading = false,
                atm = isAtm,
                loans = payload.loans or {},
                pendingLoans = payload.pendingLoans or {},
                isBanker = payload.isBanker or false,
                loanConfig = payload.loanConfig or {}
            })
        end)
    end)
end

RegisterNetEvent('Renewed-Banking:client:openBankUI', function(data)
    data = type(data) == 'table' and data or {}
    local txt = data.atm and locale('open_atm') or locale('open_bank')
    TaskStartScenarioInPlace(PlayerPed, 'PROP_HUMAN_ATM', 0, true)
    if progressBar({
        label = txt,
        duration = math.random(3000,5000),
        position = 'bottom',
        useWhileDead = false,
        allowCuffed = false,
        allowFalling = false,
        canCancel = true,
        disable = {
            car = true,
            move = true,
            combat = true,
            mouse = false,
        }
    }) then
        openBankUI(data.atm)
        Wait(500)
        ClearPedTasksImmediately(PlayerPed)
    else
        ClearPedTasksImmediately(PlayerPed)
        lib.notify({title = locale('bank_name'), description = locale('canceled'), type = 'error'})
    end
end)

RegisterNUICallback('closeInterface', function(_, cb)
    nuiHandler(false)
    cb('ok')
end)

RegisterNUICallback('playSound', function(data, cb)
    local sound = data and data.sound or 'PIN_BUTTON'
    local set = data and data.set or 'ATM_SOUNDS'
    PlaySoundFrontend(-1, sound, set, true)
    cb('ok')
end)

RegisterCommand('closeBankUI', function() nuiHandler(false) end, false)

local function interactReady()
    local name = Config.interact and Config.interact.resource or 'interact'
    return GetResourceState(name) == 'started'
end

local function targetReady()
    return GetResourceState('ox_target') == 'started'
end

local function interactExport()
    return exports[Config.interact and Config.interact.resource or 'interact']
end

local function registerAtms()
    if interactReady() then
        local cfg = Config.interact
        for i = 1, #Config.atms do
            interactExport():AddModelInteraction({
                model = Config.atms[i],
                offset = vec3(0.0, 0.0, 0.95),
                name = 'renewed_banking_atm',
                id = ('renewed_banking_atm_%s'):format(i),
                distance = cfg.atmDistance,
                interactDst = cfg.atmInteract,
                ignoreLos = cfg.ignoreLos,
                options = {{
                    label = locale('view_bank'),
                    action = function()
                        TriggerEvent('Renewed-Banking:client:openBankUI', { atm = true })
                    end
                }}
            })
        end
        return
    end

    if targetReady() then
        exports.ox_target:addModel(Config.atms, {{
            name = 'renewed_banking_openui',
            event = 'Renewed-Banking:client:openBankUI',
            icon = 'fas fa-money-check',
            label = locale('view_bank'),
            atm = true,
            canInteract = function(_, distance)
                return distance < (Config.interact and Config.interact.atmInteract or 2.5)
            end
        }})
        return
    end

    print('^3[Renewed-Banking]^0 Start darktrovx/interact (resource name `interact`) so banks and ATMs can be used.')
end

local function removeAtms()
    if interactReady() then
        for i = 1, #Config.atms do
            pcall(function()
                interactExport():RemoveModelInteraction(Config.atms[i], ('renewed_banking_atm_%s'):format(i))
            end)
        end
    elseif targetReady() then
        exports.ox_target:removeModel(Config.atms, {'renewed_banking_openui'})
    end
end

local function tellerOptions(createAccounts)
    local options = {{
        label = locale('view_bank'),
        action = function()
            TriggerEvent('Renewed-Banking:client:openBankUI', { atm = false })
        end
    }}
    if createAccounts then
        options[#options+1] = {
            label = locale('manage_bank'),
            action = function()
                TriggerEvent('Renewed-Banking:client:accountManagmentMenu')
            end
        }
    end
    return options
end

local function addTellerInteract(ped, index, createAccounts)
    if not ped or ped == 0 then return end
    local cfg = Config.interact
    interactExport():AddLocalEntityInteraction({
        entity = ped,
        name = 'renewed_banking_teller',
        id = ('renewed_banking_teller_%s'):format(index),
        distance = cfg.tellerDistance,
        interactDst = cfg.tellerInteract,
        ignoreLos = cfg.ignoreLos,
        offset = cfg.tellerOffset,
        options = tellerOptions(createAccounts)
    })
end

local function removeTellerInteract(ped, index)
    if not ped or ped == 0 then return end
    if interactReady() then
        pcall(function()
            interactExport():RemoveLocalEntityInteraction(ped, ('renewed_banking_teller_%s'):format(index))
        end)
    elseif targetReady() then
        exports.ox_target:removeLocalEntity(ped, {'renewed_banking_accountmng', 'renewed_banking_openui'})
    end
end

local bankActions = {'deposit', 'withdraw', 'transfer'}
CreateThread(function ()
    for k=1, #bankActions do
        RegisterNUICallback(bankActions[k], function(data, cb)
            local newTransaction = lib.callback.await('Renewed-Banking:server:'..bankActions[k], false, data)
            cb(newTransaction)
        end)
    end
    local loanActions = { applyLoan = true, repayLoan = true, decideLoan = true }
    for name in pairs(loanActions) do
        RegisterNUICallback(name, function(data, cb)
            local result = lib.callback.await('Renewed-Banking:server:'..name, false, data)
            cb(result)
        end)
    end
    registerAtms()
end)

local pedSpawned = false
local blips = {}
function CreatePeds()
    if pedSpawned then return end
    for k = 1, #Config.peds do
        local coords = Config.peds[k].coords
        local pedPoint = lib.points.new({
            coords = coords,
            distance = 300,
            model = joaat(Config.peds[k].model),
            heading = coords.w,
            ped = nil,
            bankIndex = k,
            createAccounts = Config.peds[k].createAccounts
        })

        function pedPoint:onEnter()
            lib.requestModel(self.model, 10000)

            self.ped = CreatePed(0, self.model, self.coords.x, self.coords.y, self.coords.z-1, self.heading, false, false)
            SetEntityHeading(self.ped, self.heading)
            SetModelAsNoLongerNeeded(self.model)

            TaskStartScenarioInPlace(self.ped, 'PROP_HUMAN_STAND_IMPATIENT', 0, true)
            FreezeEntityPosition(self.ped, true)
            SetEntityInvincible(self.ped, true)
            SetBlockingOfNonTemporaryEvents(self.ped, true)

            if interactReady() then
                addTellerInteract(self.ped, self.bankIndex, self.createAccounts)
            elseif targetReady() then
                local reach = Config.interact and Config.interact.tellerInteract or 6.0
                exports.ox_target:addLocalEntity(self.ped, {
                    {
                        name = 'renewed_banking_accountmng',
                        event = 'Renewed-Banking:client:accountManagmentMenu',
                        icon = 'fas fa-money-check',
                        label = locale('manage_bank'),
                        atm = false,
                        canInteract = function(_, distance)
                            return distance < reach and self.createAccounts
                        end
                    },
                    {
                        name = 'renewed_banking_openui',
                        event = 'Renewed-Banking:client:openBankUI',
                        icon = 'fas fa-money-check',
                        label = locale('view_bank'),
                        atm = false,
                        canInteract = function(_, distance)
                            return distance < reach
                        end
                    }
                })
            end
        end

        function pedPoint:onExit()
            removeTellerInteract(self.ped, self.bankIndex)
            if DoesEntityExist(self.ped) then
                DeletePed(self.ped)
            end
            self.ped = nil
        end

        blips[k] = AddBlipForCoord(coords.x, coords.y, coords.z-1)
        SetBlipSprite(blips[k], Config.blip.sprite)
        SetBlipDisplay(blips[k], 4)
        SetBlipScale(blips[k], Config.blip.scale)
        SetBlipColour(blips[k], Config.blip.color)
        SetBlipAsShortRange(blips[k], true)
        BeginTextCommandSetBlipName('STRING')
        AddTextComponentString(Config.blip.label)
        EndTextCommandSetBlipName(blips[k])
    end
    pedSpawned = true
end

function DeletePeds()
    if not pedSpawned then return end
    local points = lib.points.getAllPoints()
    for i = 1, #points do
        if points[i].ped then
            removeTellerInteract(points[i].ped, points[i].bankIndex)
        end
        if DoesEntityExist(points[i].ped) then
            DeletePed(points[i].ped)
        end
        points[i]:remove()
    end
    for i = 1, #blips do
        RemoveBlip(blips[i])
    end
    pedSpawned = false
end

AddEventHandler('onResourceStop', function(resource)
    if resource ~= GetCurrentResourceName() then return end
    removeAtms()
    DeletePeds()
end)

RegisterNetEvent('Renewed-Banking:client:sendNotification', function(msg)
    if not msg then return end
    SendNUIMessage({
        action = 'notify',
        status = msg,
    })
end)

RegisterNetEvent('Renewed-Banking:client:viewAccountsMenu', function()
    TriggerServerEvent('Renewed-Banking:server:getPlayerAccounts')
end)
