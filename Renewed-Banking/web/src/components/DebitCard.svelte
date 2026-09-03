<script lang="ts">
    import { cardSkin, t } from "../store/stores";
    import { cardExpiry, formatIban, lastFour } from "../utils/misc";

    export let name = "Envy Client";
    export let id = "000000";
    export let large = false;
</script>

<article class="card {$cardSkin}" class:large>
    <div class="card-top">
        <span>{$t.envy_bank}</span>
        <span class="contactless"><i class="fa-solid fa-wifi"></i></span>
    </div>
    <div class="chip-row">
        <div class="chip"></div>
        <div class="iban">{formatIban(id)}</div>
    </div>
    <div class="type">{$t.debit_card} · {lastFour(id)}</div>
    <div class="card-bottom">
        <div>
            <small>{$t.cardholder}</small>
            <strong>{name}</strong>
        </div>
        <div class="expiry">
            <small>{$t.valid_thru}</small>
            <strong>{cardExpiry(id)}</strong>
        </div>
        <div class="mark">
            <span></span>
            <span></span>
        </div>
    </div>
</article>

<style>
    .card {
        position: relative;
        overflow: hidden;
        border-radius: 18px;
        padding: 1.1rem 1.2rem 1rem;
        min-height: 168px;
        color: #f7fdff;
        box-shadow: 0 16px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.08) inset;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
    }
    .card.large {
        min-height: 220px;
        padding: 1.4rem 1.5rem;
    }
    .card::after {
        content: "";
        position: absolute;
        inset: auto -20% -40% 30%;
        height: 140%;
        background: radial-gradient(circle, rgba(255, 255, 255, 0.16), transparent 60%);
        transform: rotate(18deg);
        pointer-events: none;
    }
    .envy {
        background: linear-gradient(135deg, #08343a 0%, #0e6f70 42%, #19d6c8 100%);
    }
    .midnight {
        background: linear-gradient(135deg, #0b1020 0%, #172447 52%, #2a3d7a 100%);
    }
    .chrome {
        background: linear-gradient(135deg, #3b424a 0%, #8b959f 45%, #d5dee6 100%);
        color: #11161c;
    }
    .vice {
        background: linear-gradient(135deg, #1a0b2e 0%, #7a1ea3 50%, #00d4c8 100%);
    }
    .gold {
        background: linear-gradient(135deg, #3a2a12 0%, #8a6a28 48%, #e6c57a 100%);
        color: #1b1308;
    }
    .obsidian {
        background: linear-gradient(135deg, #050607 0%, #1a1d22 55%, #2c333c 100%);
    }
    .card-top,
    .card-bottom,
    .chip-row {
        position: relative;
        z-index: 1;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    .card-top {
        font-family: var(--display);
        letter-spacing: 0.22em;
        font-size: 0.78rem;
        font-weight: 700;
    }
    .contactless {
        transform: rotate(90deg);
        opacity: 0.85;
        font-size: 0.95rem;
    }
    .chip {
        width: 38px;
        height: 28px;
        border-radius: 6px;
        background: linear-gradient(180deg, #efe3b0, #c9a24a);
        box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.2);
    }
    .iban {
        font-weight: 800;
        letter-spacing: 0.08em;
        font-size: 0.95rem;
    }
    .type {
        position: relative;
        z-index: 1;
        font-size: 0.72rem;
        letter-spacing: 0.16em;
        opacity: 0.85;
        margin: 0.4rem 0 0.6rem;
    }
    .card-bottom {
        align-items: flex-end;
    }
    small {
        display: block;
        font-size: 0.58rem;
        letter-spacing: 0.12em;
        opacity: 0.7;
        margin-bottom: 0.15rem;
    }
    strong {
        font-size: 0.92rem;
        text-transform: uppercase;
        letter-spacing: 0.04em;
    }
    .mark {
        display: flex;
        width: 46px;
        height: 28px;
        position: relative;
    }
    .mark span {
        width: 26px;
        height: 26px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.7);
        position: absolute;
        top: 0;
    }
    .mark span:last-child {
        right: 0;
        background: rgba(61, 255, 240, 0.7);
        mix-blend-mode: screen;
    }
</style>
