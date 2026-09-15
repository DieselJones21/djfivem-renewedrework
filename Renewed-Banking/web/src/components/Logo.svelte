<script lang="ts">
    export let compact = false;
</script>

<div class="logo" class:compact>
    <img src="./img/the305-logo.png" alt="The 305" />
    {#if !compact}
        <div class="wordmark">
            <span class="bank">THE 305 BANK</span>
            <span class="sub">MIAMI</span>
        </div>
    {/if}
</div>

<style>
    .logo {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.15rem;
        padding: 0.4rem 0.4rem 0.8rem;
    }
    img {
        width: 100%;
        height: auto;
        filter: drop-shadow(0 0 16px rgba(255, 45, 138, 0.45));
        object-fit: contain;
        border-radius: 12px;
    }
    .wordmark {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-top: -0.2rem;
    }
    .bank {
        font-family: var(--display);
        letter-spacing: 0.22em;
        font-size: 0.82rem;
        font-weight: 700;
        color: #fff7fb;
        text-shadow: 0 0 16px rgba(255, 45, 138, 0.55);
    }
    .sub {
        font-size: 0.62rem;
        letter-spacing: 0.42em;
        color: var(--cyan);
        font-weight: 700;
    }
    .compact {
        padding: 0.15rem 0.1rem 0.35rem;
    }
    .compact img {
        width: 6.5rem;
    }
</style>
