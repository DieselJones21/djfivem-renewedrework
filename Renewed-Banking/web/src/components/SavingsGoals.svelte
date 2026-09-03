<script lang="ts">
    import { persist } from "../utils/persist";
    import { t } from "../store/stores";
    import { formatMoney } from "../utils/misc";
    import type { SavingsGoal } from "../types";

    export let accountId = "";
    let name = "";
    let target = "";
    let contributeAmt = "";
    let selected: string | null = null;

    $: goals = persist.read<SavingsGoal[]>(`envy-bank-goals-${accountId}`, []);

    function save(next: SavingsGoal[]) {
        persist.write(`envy-bank-goals-${accountId}`, next);
        goals = next;
    }

    function addGoal() {
        const targetNum = Number(target);
        if (!name.trim() || !targetNum) return;
        save([
            ...goals,
            { id: String(Date.now()), name: name.trim(), target: targetNum, saved: 0 },
        ]);
        name = "";
        target = "";
    }

    function contribute(id: string) {
        const amount = Number(contributeAmt);
        if (!amount) return;
        save(goals.map((goal) => goal.id === id ? { ...goal, saved: Math.min(goal.target, goal.saved + amount) } : goal));
        contributeAmt = "";
        selected = null;
    }

    function remove(id: string) {
        save(goals.filter((goal) => goal.id !== id));
    }
</script>

<section class="panel goals">
    <div class="section-title">
        <span>{$t.savings_goals}</span>
        <small class="muted">{$t.goal_hint}</small>
    </div>
    {#if goals.length === 0}
        <p class="muted">{$t.no_goals}</p>
    {:else}
        <div class="list">
            {#each goals as goal (goal.id)}
                {@const pct = Math.min(100, Math.round((goal.saved / Math.max(goal.target, 1)) * 100))}
                <article>
                    <header>
                        <strong>{goal.name}</strong>
                        <span class="mono">{formatMoney(goal.saved)} / {formatMoney(goal.target)}</span>
                    </header>
                    <div class="bar"><i style="width:{pct}%"></i></div>
                    <footer>
                        <span>{pct}%</span>
                        <div>
                            {#if selected === goal.id}
                                <input class="field mini" type="number" placeholder="$" bind:value={contributeAmt} />
                                <button class="chip active" type="button" on:click={() => contribute(goal.id)}>{$t.save}</button>
                            {:else}
                                <button class="chip" type="button" on:click={() => selected = goal.id}>{$t.contribute}</button>
                            {/if}
                            <button class="chip" type="button" on:click={() => remove(goal.id)}>{$t.delete}</button>
                        </div>
                    </footer>
                </article>
            {/each}
        </div>
    {/if}
    <div class="add">
        <input class="field" placeholder={$t.goal_name} bind:value={name} />
        <input class="field" type="number" placeholder={$t.goal_target} bind:value={target} />
        <button class="btn btn-cyan" type="button" on:click={addGoal}>{$t.add_goal}</button>
    </div>
</section>

<style>
    .goals {
        padding: 1rem;
        display: flex;
        flex-direction: column;
        gap: 0.8rem;
    }
    .list {
        display: grid;
        gap: 0.75rem;
    }
    article header,
    article footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 0.5rem;
    }
    .bar {
        height: 8px;
        border-radius: 99px;
        background: rgba(255, 255, 255, 0.08);
        margin: 0.45rem 0;
        overflow: hidden;
    }
    .bar i {
        display: block;
        height: 100%;
        background: linear-gradient(90deg, #1ad7c2, #7ef6ff);
        box-shadow: 0 0 12px rgba(61, 255, 240, 0.45);
    }
    footer {
        font-size: 0.78rem;
        color: var(--muted);
    }
    footer div {
        display: flex;
        gap: 0.35rem;
        align-items: center;
    }
    .mini {
        width: 88px;
        padding: 0.35rem 0.5rem;
    }
    .add {
        display: grid;
        grid-template-columns: 1.2fr 0.8fr auto;
        gap: 0.45rem;
    }
</style>
