<section class="loading-container">
    <div class="box">
        <img src="./img/envy-logo.png" alt="Envy" />
        <div class="bar"><i></i></div>
        <p>Loading Envy Bank...</p>
    </div>
</section>

<style>
    .loading-container {
        position: fixed;
        inset: 0;
        display: grid;
        place-items: center;
        background: rgba(4, 7, 10, 0.35);
        z-index: 50;
    }
    .box {
        width: min(360px, 80vw);
        background: #0c1118;
        border: 1px solid var(--line);
        border-radius: 18px;
        padding: 1.4rem 1.5rem 1.2rem;
        text-align: center;
        box-shadow: var(--glow), var(--shadow);
    }
    img {
        width: 220px;
        margin: 0 auto 1rem;
        filter: drop-shadow(0 0 16px rgba(61, 255, 240, 0.35));
    }
    .bar {
        height: 6px;
        background: rgba(255, 255, 255, 0.08);
        border-radius: 99px;
        overflow: hidden;
    }
    .bar i {
        display: block;
        height: 100%;
        width: 40%;
        background: linear-gradient(90deg, #1ad7c2, #7ef6ff);
        animation: load 1.1s ease-in-out infinite;
    }
    p {
        margin-top: 0.8rem;
        color: var(--muted);
        font-size: 0.82rem;
        letter-spacing: 0.08em;
        text-transform: uppercase;
    }
    @keyframes load {
        0% { transform: translateX(-120%); }
        100% { transform: translateX(280%); }
    }
</style>
