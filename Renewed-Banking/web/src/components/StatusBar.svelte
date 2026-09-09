<script lang="ts">
    import { onMount } from "svelte";
    import { t } from "../store/stores";

    let clock = "";

    function tick() {
        clock = new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    }

    onMount(() => {
        tick();
        const id = setInterval(tick, 15000);
        return () => clearInterval(id);
    });
</script>

<div class="bar">
    <span class="time">{clock}</span>
    <span class="center">{$t.envy_bank}</span>
    <span class="sys">
        <i class="fa-solid fa-wifi"></i>
        <i class="fa-solid fa-signal"></i>
        <em>100%</em>
        <i class="fa-solid fa-battery-full"></i>
    </span>
</div>

<style>
    .bar {
        display: grid;
        grid-template-columns: 1fr auto 1fr;
        align-items: center;
        padding: 0.35rem 1.1rem 0.2rem;
        font-size: 0.72rem;
        font-weight: 700;
        letter-spacing: 0.04em;
        color: #eef4f7;
    }
    .center {
        letter-spacing: 0.22em;
        font-family: var(--display);
        color: var(--chrome);
    }
    .sys {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        gap: 0.4rem;
        color: var(--chrome);
    }
    em {
        font-style: normal;
        font-size: 0.68rem;
    }
</style>
