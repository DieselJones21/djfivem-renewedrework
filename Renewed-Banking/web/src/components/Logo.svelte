<script lang="ts">
    export let compact = false;
</script>

<div class="logo" class:compact>
    <img src="./img/envy-logo.png" alt="Envy Roleplay" />
    {#if !compact}
        <div class="wordmark">
            <span class="bank">ENVY BANK</span>
            <span class="sub">ROLEPLAY</span>
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
        filter: drop-shadow(0 0 18px rgba(61, 255, 240, 0.35));
        object-fit: contain;
    }
    .wordmark {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-top: -0.4rem;
    }
    .bank {
        font-family: var(--display);
        letter-spacing: 0.28em;
        font-size: 0.95rem;
        font-weight: 700;
        color: #f7fbff;
        text-shadow: 0 0 16px rgba(61, 255, 240, 0.45);
    }
    .sub {
        font-size: 0.62rem;
        letter-spacing: 0.42em;
        color: var(--cyan);
        font-weight: 700;
    }
    .compact img {
        width: 7.5rem;
    }
</style>
