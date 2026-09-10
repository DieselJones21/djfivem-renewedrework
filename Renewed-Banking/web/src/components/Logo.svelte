<script lang="ts">
    export let compact = false;
</script>

<div class="logo" class:compact>
    <img src="./img/rebel-logo.png" alt="Rebel Roleplay" />
    {#if !compact}
        <div class="wordmark">
            <span class="bank">REBEL BANK</span>
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
        filter: none;
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
        width: 6.6rem;
    }
</style>
