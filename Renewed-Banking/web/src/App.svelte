<script lang="ts">
    import VisibilityProvider from "./providers/VisibilityProvider.svelte";
    import { debugData } from "./utils/debugData";
    import BankApp from "./components/BankApp.svelte";
    import Loading from "./components/Loading.svelte";
    import Notification from "./components/Notification.svelte";
    import { loading, notify } from "./store/stores";
    import { FALLBACK } from "./i18n/fallback";

    const now = Math.floor(Date.now() / 1000);

    debugData([
        {
            action: "updateLocale",
            data: { translations: FALLBACK, currency: "USD" },
        },
        {
            action: "setVisible",
            data: {
                status: true,
                loading: false,
                atm: false,
                accounts: [
                    {
                        id: "257636",
                        type: "Personal",
                        name: "Peter Holz",
                        frozen: 0,
                        amount: 77424,
                        cash: 12540,
                        transactions: [
                            { trans_id: "tx-1", title: "Salary / LSPD", amount: 8500, trans_type: "deposit", receiver: "Peter Holz", message: "Weekly salary paycheck", issuer: "Los Santos City", time: now - 3600 },
                            { trans_id: "tx-2", title: "Burger Shot", amount: 240, trans_type: "withdraw", receiver: "Burger Shot", message: "Food run on Vinewood", issuer: "Peter Holz", time: now - 7200 },
                            { trans_id: "tx-3", title: "Transfer / 441902", amount: 2500, trans_type: "withdraw", receiver: "441902", message: "Transferred rent to roommate", issuer: "Peter Holz", time: now - 10800 },
                            { trans_id: "tx-4", title: "LS Customs", amount: 4300, trans_type: "withdraw", receiver: "LS Customs", message: "Vehicle turbo install", issuer: "Peter Holz", time: now - 86400 },
                            { trans_id: "tx-5", title: "Parking fine", amount: 375, trans_type: "withdraw", receiver: "LSPD", message: "Parking ticket downtown", issuer: "Peter Holz", time: now - 90000 },
                            { trans_id: "tx-6", title: "Deposit / Cash", amount: 12000, trans_type: "deposit", receiver: "Peter Holz", message: "Deposited street cash", issuer: "Peter Holz", time: now - 172000 },
                            { trans_id: "tx-7", title: "Transfer / mechanic", amount: 1800, trans_type: "withdraw", receiver: "mechanic", message: "Crew cut transfer", issuer: "Peter Holz", time: now - 200000 },
                        ],
                    },
                    {
                        id: "police",
                        type: "Organization",
                        name: "LSPD",
                        frozen: 0,
                        amount: 240500,
                        transactions: [
                            { trans_id: "tx-p1", title: "Evidence sale", amount: 15000, trans_type: "deposit", receiver: "LSPD", message: "Impound auction", issuer: "City of Los Santos", time: now - 5000 },
                        ],
                    },
                    {
                        id: "envy-crew",
                        type: "Organization",
                        name: "Envy Crew",
                        frozen: 0,
                        amount: 89000,
                        creator: "257636",
                        transactions: [],
                    },
                ],
            },
        },
    ]);
</script>

<svelte:head>
    <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.1.2/css/all.min.css"
        integrity="sha512-1sCRPdkRXhBV2PBLUdRb4tMg1w2YPf37qatUFeS7zlBy7jJI8Lf4VHwWfZZfpXtYSLy85pkm9GaYVYMfw5BC1A=="
        crossorigin="anonymous"
        referrerpolicy="no-referrer"
    />
</svelte:head>

<VisibilityProvider>
    <BankApp />
    {#if $notify !== ""}
        <Notification />
    {/if}
</VisibilityProvider>
{#if $loading}
    <Loading />
{/if}
