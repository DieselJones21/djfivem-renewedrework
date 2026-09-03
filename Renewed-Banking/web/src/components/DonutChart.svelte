<script lang="ts">
    export let withdrawPct = 57;
    export let depositPct = 43;
    export let withdrawLabel = "Withdraw";
    export let depositLabel = "Deposit";

    $: w = Math.max(0, Math.min(100, withdrawPct));
    $: d = Math.max(0, Math.min(100, depositPct));
    const r = 42;
    const c = 2 * Math.PI * r;
    $: dashW = (w / 100) * c;
    $: dashD = (d / 100) * c;
</script>

<div class="donut">
    <svg viewBox="0 0 120 120">
        <circle class="track" cx="60" cy="60" r={r} />
        <circle class="withdraw" cx="60" cy="60" r={r} stroke-dasharray="{dashW} {c}" />
        <circle class="deposit" cx="60" cy="60" r={r} stroke-dasharray="{dashD} {c}" stroke-dashoffset={-dashW} />
        <text x="60" y="56" text-anchor="middle">{w}%</text>
        <text class="sub" x="60" y="74" text-anchor="middle">{withdrawLabel}</text>
    </svg>
    <div class="legend">
        <span><i class="w"></i>{w}% {withdrawLabel}</span>
        <span><i class="d"></i>{d}% {depositLabel}</span>
    </div>
</div>

<style>
    .donut {
        display: flex;
        align-items: center;
        gap: 0.9rem;
    }
    svg {
        width: 118px;
        height: 118px;
        transform: rotate(-90deg);
    }
    circle {
        fill: none;
        stroke-width: 12;
        stroke-linecap: round;
    }
    .track {
        stroke: rgba(255, 255, 255, 0.08);
    }
    .withdraw {
        stroke: #7ef6ff;
        filter: drop-shadow(0 0 6px rgba(61, 255, 240, 0.6));
    }
    .deposit {
        stroke: #1d6f78;
    }
    text {
        transform: rotate(90deg);
        transform-origin: 60px 60px;
        fill: #fff;
        font-size: 16px;
        font-weight: 800;
        font-family: "Plus Jakarta Sans", sans-serif;
    }
    .sub {
        font-size: 8px;
        font-weight: 600;
        fill: #9aa3b2;
        letter-spacing: 0.4px;
    }
    .legend {
        display: flex;
        flex-direction: column;
        gap: 0.4rem;
        font-size: 0.78rem;
        color: var(--muted);
    }
    .legend i {
        display: inline-block;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        margin-right: 0.4rem;
    }
    .w { background: #7ef6ff; }
    .d { background: #1d6f78; }
</style>
