<script lang="ts">
	import { verbs, TENSES, TENSE_LABELS, type Tense, type Verb } from '$lib/data/verbs';
	import PlayIndicator from '$lib/components/PlayIndicator.svelte';
	import { playPronunciation, type PlayState } from '$lib/utils/audio';
	import { SvelteMap } from 'svelte/reactivity';

	let selectedVerbId = $state<string>(verbs[0].id);
	let selectedTense = $state<Tense>('present');
	let error = $state<string | null>(null);

	const playStates = new SvelteMap<string, PlayState>();

	const selectedVerb = $derived<Verb>(
		verbs.find((v) => v.id === selectedVerbId) ?? verbs[0]
	);

	const activeConjugations = $derived(selectedVerb.conjugations[selectedTense]);
	const activeExamples = $derived(selectedVerb.examples[selectedTense]);

	function playAudio(teluguScript: string, id: string) {
		return playPronunciation(teluguScript, id, playStates, (msg) => (error = msg));
	}
</script>

<svelte:head>
	<title>Chilaka — Verbs</title>
</svelte:head>

<main>
	<header>
		<h1 class="page-title">Telugu verbs</h1>
		<p class="tagline">Learn how verbs change with the subject and tense.</p>
	</header>

	<section class="verb-picker" aria-label="Choose a verb">
		<div class="picker-row">
			{#each verbs as verb (verb.id)}
				<button
					type="button"
					class="verb-pill"
					class:active={verb.id === selectedVerbId}
					onclick={() => (selectedVerbId = verb.id)}
				>
					<span class="pill-script">{verb.infinitive.script}</span>
					<span class="pill-english">{verb.infinitive.english}</span>
				</button>
			{/each}
		</div>
	</section>

	<section class="tense-toggle" role="tablist" aria-label="Tense">
		{#each TENSES as tense (tense)}
			<button
				type="button"
				role="tab"
				class="toggle"
				class:active={tense === selectedTense}
				aria-selected={tense === selectedTense}
				onclick={() => (selectedTense = tense)}
			>
				{TENSE_LABELS[tense]}
			</button>
		{/each}
	</section>

	{#if error}
		<p class="error" role="alert">{error}</p>
	{/if}

	<section class="conjugation-card" aria-label="Conjugation table">
		<div class="card-header">
			<div class="card-infinitive">
				<span class="card-title">{selectedVerb.infinitive.script}</span>
				<span class="card-roman">{selectedVerb.infinitive.roman}</span>
				<span class="card-sub">{selectedVerb.infinitive.english}</span>
			</div>
			<span class="card-tense">{TENSE_LABELS[selectedTense]}</span>
		</div>

		<table class="conjugations">
			<tbody>
				{#each activeConjugations as row, idx (selectedVerb.id + '-' + selectedTense + '-' + idx)}
					{@const conjId = `conj-${selectedVerb.id}-${selectedTense}-${idx}`}
					<tr>
						<td class="cell pronoun-cell">
							<div class="cell-script">{row.pronoun.script}</div>
							<div class="cell-roman">{row.pronoun.roman}</div>
							<div class="cell-english">{row.pronoun.english}</div>
						</td>
						<td class="cell verb-cell">
							<div class="verb-text">
								<div class="cell-script accent">{row.verb.script}</div>
								<div class="cell-roman">{row.verb.roman}</div>
								<div class="cell-english">{row.verb.english}</div>
							</div>
							<button
								type="button"
								class="play small"
								class:fetching={playStates.get(conjId) === 'fetching'}
								class:playing={playStates.get(conjId) === 'playing'}
								onclick={() => playAudio(row.verb.script, conjId)}
								disabled={playStates.has(conjId)}
								aria-label="Play pronunciation"
							>
								<PlayIndicator state={playStates.get(conjId) ?? 'idle'} size={14} />
							</button>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</section>

	<section class="examples" aria-label="Example sentences">
		<h2>In a sentence</h2>
		<ul>
			{#each activeExamples as ex, idx (selectedVerb.id + '-' + selectedTense + '-ex-' + idx)}
				{@const exId = `ex-${selectedVerb.id}-${selectedTense}-${idx}`}
				<li class="example">
					<div class="example-text">
						<div class="cell-script">{ex.script}</div>
						<div class="cell-roman">{ex.roman}</div>
						<div class="cell-english">{ex.english}</div>
					</div>
					<button
						type="button"
						class="play small"
						class:fetching={playStates.get(exId) === 'fetching'}
						class:playing={playStates.get(exId) === 'playing'}
						onclick={() => playAudio(ex.script, exId)}
						disabled={playStates.has(exId)}
						aria-label="Play sentence"
					>
						<PlayIndicator state={playStates.get(exId) ?? 'idle'} size={14} />
					</button>
				</li>
			{/each}
		</ul>
	</section>
</main>

<style>
	main {
		max-width: 640px;
		margin: 0 auto;
		padding: var(--space-lg) var(--space-lg) var(--space-xl);
		font-family: inherit;
		color: var(--color-text);
	}

	header {
		margin-bottom: 1.5rem;
	}

	h1.page-title {
		font-size: var(--text-lg);
		font-weight: 600;
		margin: 0 0 0.25rem;
		letter-spacing: -0.01em;
		color: var(--color-text-muted);
	}

	.tagline {
		margin: 0;
		color: var(--color-text-muted);
		font-size: var(--text-sm);
	}

	.verb-picker {
		margin-bottom: 1rem;
		overflow-x: auto;
		-webkit-overflow-scrolling: touch;
	}

	.picker-row {
		display: flex;
		gap: 0.5rem;
		padding-bottom: 0.25rem;
	}

	.verb-pill {
		appearance: none;
		flex: 0 0 auto;
		display: inline-flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 0.1rem;
		background: var(--color-surface);
		border: 1px solid var(--color-border-strong);
		border-radius: 12px;
		padding: 0.55rem 0.85rem;
		cursor: pointer;
		text-align: left;
		font-family: inherit;
		color: var(--color-text);
		transition:
			background 120ms ease,
			border-color 120ms ease;
	}

	.verb-pill:hover {
		border-color: color-mix(in srgb, var(--color-border-strong) 60%, var(--color-text-muted));
	}

	.verb-pill.active {
		background: var(--color-primary);
		border-color: var(--color-primary);
		color: var(--color-surface);
	}

	.pill-script {
		font-size: 1.05rem;
		font-weight: 500;
	}

	.pill-english {
		font-size: 0.78rem;
		color: var(--color-text-muted);
	}

	.verb-pill.active .pill-english {
		color: color-mix(in srgb, var(--color-surface) 80%, var(--color-primary));
	}

	.tense-toggle {
		display: inline-flex;
		gap: 0;
		background: var(--color-surface-muted);
		padding: 4px;
		border-radius: 999px;
		margin-bottom: 1.25rem;
	}

	.toggle {
		appearance: none;
		border: 0;
		background: transparent;
		padding: 0.5rem 1rem;
		font-size: 0.9rem;
		border-radius: 999px;
		cursor: pointer;
		color: var(--color-text-muted);
		font-weight: 500;
		font-family: inherit;
	}

	.toggle.active {
		background: var(--color-surface);
		color: var(--color-text);
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
	}

	.error {
		color: var(--color-error);
		font-size: 0.9rem;
		margin: 0.5rem 0 1rem;
	}

	.conjugation-card {
		background: var(--color-surface-muted);
		border: 1px solid var(--color-border-subtle);
		border-radius: 14px;
		padding: 0.5rem 0.5rem 0.75rem;
		margin-bottom: 2rem;
	}

	.card-header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		padding: 0.75rem 0.75rem 0.5rem;
		gap: 0.75rem;
	}

	.card-infinitive {
		display: flex;
		flex-direction: column;
		gap: 0.1rem;
	}

	.card-title {
		font-size: 1.2rem;
		font-weight: 600;
	}

	.card-roman {
		font-size: 0.82rem;
		color: var(--color-text-muted);
		font-style: italic;
	}

	.card-sub {
		font-size: 0.9rem;
		color: var(--color-text-muted);
	}

	.card-tense {
		font-size: 0.78rem;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--color-text-muted);
		font-weight: 600;
	}

	table.conjugations {
		width: 100%;
		border-collapse: collapse;
		table-layout: fixed;
	}

	.cell {
		vertical-align: top;
		padding: 0.85rem 0.75rem;
		border-top: 1px solid var(--color-border-subtle);
	}

	tr:first-child .cell {
		border-top: 0;
	}

	.pronoun-cell {
		width: 44%;
	}

	.verb-cell {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 0.6rem;
	}

	.verb-text {
		min-width: 0;
	}

	.cell-script {
		font-size: 1.15rem;
		font-weight: 500;
		line-height: 1.2;
	}

	.cell-script.accent {
		color: var(--color-accent-blue);
	}

	.cell-roman {
		font-size: 0.8rem;
		color: var(--color-text-muted);
		font-style: italic;
		margin-top: 0.15rem;
	}

	.cell-english {
		font-size: 0.9rem;
		color: var(--color-text);
		margin-top: 0.2rem;
	}

	.play {
		flex: 0 0 auto;
		background: var(--color-surface);
		border: 1px solid var(--color-border-strong);
		border-radius: 999px;
		width: 36px;
		height: 36px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0;
		cursor: pointer;
		color: var(--color-text);
		transition: transform 120ms ease;
	}

	.play.small {
		width: 30px;
		height: 30px;
	}

	.play:hover:not(:disabled) {
		background: var(--color-surface-hover);
	}

	.play:active:not(:disabled) {
		transform: scale(0.92);
	}

	.play:disabled {
		opacity: 1;
		cursor: progress;
	}

	.play.fetching,
	.play.playing {
		color: var(--color-primary);
		border-color: color-mix(in srgb, var(--color-primary) 35%, var(--color-border-strong));
	}

	.play.playing {
		animation: play-pulse 1.4s ease-out infinite;
	}

	@keyframes play-pulse {
		0% {
			box-shadow: 0 0 0 0 color-mix(in srgb, var(--color-primary) 45%, transparent);
		}
		70% {
			box-shadow: 0 0 0 10px color-mix(in srgb, var(--color-primary) 0%, transparent);
		}
		100% {
			box-shadow: 0 0 0 0 color-mix(in srgb, var(--color-primary) 0%, transparent);
		}
	}

	.examples h2 {
		font-size: 1rem;
		font-weight: 600;
		color: var(--color-text-muted);
		margin: 0 0 0.75rem;
	}

	.examples ul {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
	}

	.example {
		background: var(--color-surface);
		border: 1px solid var(--color-border-subtle);
		border-radius: 12px;
		padding: 0.85rem 1rem;
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 0.75rem;
	}

	.example-text {
		min-width: 0;
	}

	@media (max-width: 480px) {
		.pronoun-cell {
			width: 40%;
		}

		.cell {
			padding: 0.7rem 0.5rem;
		}
	}
</style>
