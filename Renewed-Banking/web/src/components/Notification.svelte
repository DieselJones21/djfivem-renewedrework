<script>
    import { notify } from "../store/stores";
</script>

<section class="toast">
    <i class="fa-solid fa-circle-info"></i>
    <strong>{$notify}</strong>
</section>

<style>
    .toast {
        position: absolute;
        top: 1.1rem;
        right: 1.2rem;
        z-index: 30;
        display: flex;
        align-items: center;
        gap: 0.6rem;
        background: #10161e;
        border: 1px solid var(--line-strong);
        box-shadow: var(--glow);
        border-radius: 12px;
        padding: 0.75rem 0.95rem;
        max-width: 280px;
        animation: in 0.25s ease;
    }
    i { color: var(--cyan); }
    strong { font-size: 0.82rem; font-weight: 650; }
    @keyframes in {
        from { transform: translateY(-8px); opacity: 0; }
        to { transform: none; opacity: 1; }
    }
</style>
