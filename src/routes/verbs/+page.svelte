<script lang="ts">
	import { verbs, TENSES, TENSE_LABELS, type Tense, type Verb } from '$lib/data/verbs';

	let selectedVerbId = $state<string>(verbs[0].id);
	let selectedTense = $state<Tense>('present');
	let error = $state<string | null>(null);

	const playingIds = $state(new Set<string>());

	const selectedVerb = $derived<Verb>(
		verbs.find((v) => v.id === selectedVerbId) ?? verbs[0]
	);

	const activeConjugations = $derived(selectedVerb.conjugations[selectedTense]);
	const activeExamples = $derived(selectedVerb.examples[selectedTense]);

	async function playPronunciation(teluguScript: string, id: string) {
		if (playingIds.has(id)) return;
		playingIds.add(id);
		try {
			const res = await fetch('/api/tts', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ teluguScript })
			});
			if (!res.ok) throw new Error('Audio failed');
			const blob = await res.blob();
			const url = URL.createObjectURL(blob);
			const audio = new Audio(url);
			audio.addEventListener('ended', () => {
				URL.revokeObjectURL(url);
				playingIds.delete(id);
			});
			audio.addEventListener('error', () => {
				URL.revokeObjectURL(url);
				playingIds.delete(id);
			});
			await audio.play();
		} catch (err) {
			playingIds.delete(id);
			error = err instanceof Error ? err.message : 'Audio failed';
		}
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
								class="play"
								onclick={() =>
									playPronunciation(
										row.verb.script,
										`conj-${selectedVerb.id}-${selectedTense}-${idx}`
									)}
								disabled={playingIds.has(
									`conj-${selectedVerb.id}-${selectedTense}-${idx}`
								)}
								aria-label="Play pronunciation"
							>
								{playingIds.has(`conj-${selectedVerb.id}-${selectedTense}-${idx}`)
									? '▶︎…'
									: '▶︎'}
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
				<li class="example">
					<div class="example-text">
						<div class="cell-script">{ex.script}</div>
						<div class="cell-roman">{ex.roman}</div>
						<div class="cell-english">{ex.english}</div>
					</div>
					<button
						type="button"
						class="play"
						onclick={() =>
							playPronunciation(
								ex.script,
								`ex-${selectedVerb.id}-${selectedTense}-${idx}`
							)}
						disabled={playingIds.has(`ex-${selectedVerb.id}-${selectedTense}-${idx}`)}
						aria-label="Play sentence"
					>
						{playingIds.has(`ex-${selectedVerb.id}-${selectedTense}-${idx}`)
							? '▶︎…'
							: '▶︎'}
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
		padding: 0 1.25rem 4rem;
		font-family:
			ui-sans-serif,
			system-ui,
			-apple-system,
			'Segoe UI',
			Roboto,
			sans-serif;
		color: #1a1a1a;
	}

	header {
		margin-bottom: 1.5rem;
	}

	h1.page-title {
		font-size: 1.75rem;
		font-weight: 600;
		margin: 0 0 0.25rem;
		letter-spacing: -0.01em;
	}

	.tagline {
		margin: 0;
		color: #666;
		font-size: 0.95rem;
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
		background: #fff;
		border: 1px solid #ddd;
		border-radius: 12px;
		padding: 0.55rem 0.85rem;
		cursor: pointer;
		text-align: left;
		font-family: inherit;
		color: #1a1a1a;
		transition:
			background 120ms ease,
			border-color 120ms ease;
	}

	.verb-pill:hover {
		border-color: #b8b8b8;
	}

	.verb-pill.active {
		background: #1a1a1a;
		border-color: #1a1a1a;
		color: #fff;
	}

	.pill-script {
		font-size: 1.05rem;
		font-weight: 500;
	}

	.pill-english {
		font-size: 0.78rem;
		color: #777;
	}

	.verb-pill.active .pill-english {
		color: #d8d8d8;
	}

	.tense-toggle {
		display: inline-flex;
		gap: 0;
		background: #f1f1f1;
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
		color: #555;
		font-weight: 500;
		font-family: inherit;
	}

	.toggle.active {
		background: #fff;
		color: #1a1a1a;
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
	}

	.error {
		color: #c0392b;
		font-size: 0.9rem;
		margin: 0.5rem 0 1rem;
	}

	.conjugation-card {
		background: #fafafa;
		border: 1px solid #eee;
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
		color: #888;
		font-style: italic;
	}

	.card-sub {
		font-size: 0.9rem;
		color: #777;
	}

	.card-tense {
		font-size: 0.78rem;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: #888;
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
		border-top: 1px solid #ececec;
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
		color: #1c80c4;
	}

	.cell-roman {
		font-size: 0.8rem;
		color: #888;
		font-style: italic;
		margin-top: 0.15rem;
	}

	.cell-english {
		font-size: 0.9rem;
		color: #333;
		margin-top: 0.2rem;
	}

	.play {
		flex: 0 0 auto;
		background: #fff;
		border: 1px solid #ddd;
		border-radius: 999px;
		width: 32px;
		height: 32px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		font-size: 0.8rem;
		padding: 0;
		cursor: pointer;
		color: #1a1a1a;
	}

	.play:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.examples h2 {
		font-size: 1rem;
		font-weight: 600;
		color: #555;
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
		background: #fff;
		border: 1px solid #eee;
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
