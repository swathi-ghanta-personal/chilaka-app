<script lang="ts">
	import { untrack } from 'svelte';
	import { page } from '$app/state';
	import { fly } from 'svelte/transition';
	import { LoaderCircle, Volume2 } from '@lucide/svelte';
	import parrot from '$lib/assets/parrot.png';
	import chilakaEmpty from '$lib/assets/chilaka-empty.png';
	import type { PageData } from './$types';

	interface Card {
		id: number;
		english: string;
		teluguScript: string;
		teluguRoman: string;
	}

	interface DeckItem {
		card: Card;
		key: number;
	}

	let { data }: { data: PageData } = $props();

	const user = $derived(page.data.user as { id: string } | null);
	const isSignedIn = $derived(!!user);

	function shuffle<T>(arr: T[]): T[] {
		const copy = arr.slice();
		for (let i = copy.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[copy[i], copy[j]] = [copy[j], copy[i]];
		}
		return copy;
	}

	let nextInstance = 0;

	function makeDeck(cards: Card[]): DeckItem[] {
		return shuffle(cards).map((card) => ({ card, key: nextInstance++ }));
	}

	let deck = $state<DeckItem[]>(untrack(() => makeDeck(data.cards as Card[])));
	let initialSize = $state(untrack(() => data.cards.length));
	const firstTryCorrect = $state(new Set<number>());
	const everWrong = $state(new Set<number>());

	type Phase = 'idle' | 'wrong' | 'leaving' | 'done';
	let phase = $state<Phase>('idle');
	let guess = $state('');
	let error = $state<string | null>(null);
	let inputEl = $state<HTMLInputElement | undefined>();

	const playingIds = $state(new Set<string>());

	const topItem = $derived<DeckItem | undefined>(deck[0]);
	const topCard = $derived<Card | undefined>(topItem?.card);
	const visibleItems = $derived(deck.slice(0, 3));
	const completedCount = $derived(initialSize - deck.length);
	const showWrongOverlay = $derived(phase === 'wrong');

	function normalize(s: string): string {
		return s
			.toLowerCase()
			.trim()
			.replace(/^(the |a |an |to )/, '')
			.replace(/^[\s"'(]+|[\s"'),.!?]+$/g, '');
	}

	function isMatch(typed: string, english: string): boolean {
		const g = normalize(typed);
		if (!g) return false;
		const alternates = english.split(/[,/]/).map(normalize).filter(Boolean);
		return alternates.includes(g);
	}

	function submit() {
		if (!topCard || phase !== 'idle') return;
		if (!guess.trim()) return;

		if (isMatch(guess, topCard.english)) {
			handleCorrect();
		} else {
			handleWrong();
		}
	}

	function handleCorrect() {
		if (!topCard) return;
		const id = topCard.id;
		if (!everWrong.has(id)) firstTryCorrect.add(id);

		phase = 'leaving';
		setTimeout(() => {
			deck.shift();
			guess = '';
			phase = deck.length === 0 ? 'done' : 'idle';
			if (phase === 'idle') requestAnimationFrame(() => inputEl?.focus());
		}, 450);
	}

	function handleWrong() {
		if (!topCard) return;
		everWrong.add(topCard.id);
		phase = 'wrong';
	}

	function dismissWrong() {
		if (!topItem) return;
		const item = topItem;
		phase = 'leaving';
		setTimeout(() => {
			deck.shift();
			deck.push({ card: item.card, key: nextInstance++ });
			guess = '';
			phase = 'idle';
			requestAnimationFrame(() => inputEl?.focus());
		}, 450);
	}

	function playAgain() {
		deck = makeDeck(data.cards as Card[]);
		initialSize = deck.length;
		firstTryCorrect.clear();
		everWrong.clear();
		guess = '';
		phase = 'idle';
		requestAnimationFrame(() => inputEl?.focus());
	}

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

	function openSignIn() {
		const trigger = document.querySelector<HTMLButtonElement>('aside.sidebar button.nav-btn');
		trigger?.click();
	}
</script>

<svelte:head>
	<title>Chilaka — Quiz</title>
</svelte:head>

<main>
	{#if !isSignedIn}
		<section class="empty">
			<img src={chilakaEmpty} alt="" class="empty-art" />
			<h1>Sign in to practice</h1>
			<p>Create an account to save flashcards and practice them in the Quiz.</p>
			<button type="button" class="primary" onclick={openSignIn}>Sign in</button>
		</section>
	{:else if data.cards.length === 0}
		<section class="empty">
			<img src={chilakaEmpty} alt="" class="empty-art" />
			<h1>Nothing to practice yet</h1>
			<p>Add a few flashcards and they'll show up here to quiz yourself on.</p>
			<a href="/" class="primary">Add your first flashcard</a>
		</section>
	{:else if phase === 'done'}
		<section class="celebration">
			<div class="confetti" aria-hidden="true">
				{#each Array(14) as _, i (i)}
					<span
						class="confetti-piece"
						style="--start-x: {((i * 7) % 100) - 5}vw; --drift: {(i % 2 === 0 ? 1 : -1) *
							(20 + (i % 5) * 10)}px; --delay: {(i % 6) * 0.12}s; --duration: {2.4 +
							(i % 4) * 0.3}s; --tilt: {(i % 3) * 360 + 360}deg;"
					></span>
				{/each}
			</div>
			<img src={parrot} alt="Chilaka" class="celebration-mascot" />
			<h1>Great job!</h1>
			<div class="score-card">
				<div class="score-row correct">
					<span class="score-num">{firstTryCorrect.size}</span>
					<span class="score-label">correct on first try</span>
				</div>
				<div class="score-row missed">
					<span class="score-num">{everWrong.size}</span>
					<span class="score-label">missed at least once</span>
				</div>
			</div>
			<button type="button" class="primary" onclick={playAgain}>Play again</button>
			<a href="/" class="secondary">Back to flashcards</a>
		</section>
	{:else}
		<header class="quiz-header">
			<h1 class="page-title">Quiz</h1>
			<div class="progress" aria-label="Quiz progress">
				<div
					class="progress-bar"
					style="width: {initialSize === 0 ? 0 : (completedCount / initialSize) * 100}%"
				></div>
			</div>
			<p class="progress-text">
				{Math.min(completedCount + 1, initialSize)} of {initialSize}
			</p>
		</header>

		<section class="stack-wrap" aria-live="polite">
			<div class="stack">
				{#each visibleItems as item, idx (item.key)}
					<div
						class="card"
						class:leaving={idx === 0 && phase === 'leaving'}
						class:wrong={idx === 0 && phase === 'wrong'}
						style="--stack-idx: {idx};"
					>
						{#if idx === 0}
							<button
								type="button"
								class="play"
								class:playing={playingIds.has(`quiz-${item.key}`)}
								onclick={() => playPronunciation(item.card.teluguScript, `quiz-${item.key}`)}
								disabled={playingIds.has(`quiz-${item.key}`)}
								aria-label="Play pronunciation"
							>
								<Volume2 size={18} strokeWidth={2} aria-hidden="true" />
							</button>
						{/if}

						<div class="card-body">
							<div class="telugu">{item.card.teluguScript}</div>
							<div class="roman">{item.card.teluguRoman}</div>
						</div>

						{#if idx === 0 && showWrongOverlay}
							<div class="wrong-overlay" in:fly={{ y: 12, duration: 220 }}>
								<p class="wrong-label">Not quite — the answer is</p>
								<p class="wrong-answer">{item.card.english}</p>
								<button type="button" class="primary small" onclick={dismissWrong}>
									Got it
								</button>
							</div>
						{/if}
					</div>
				{/each}
			</div>
		</section>

		<form
			class="answer"
			onsubmit={(event) => {
				event.preventDefault();
				submit();
			}}
		>
			<input
				bind:this={inputEl}
				bind:value={guess}
				type="text"
				placeholder="Type the English translation"
				autocomplete="off"
				autocapitalize="off"
				autocorrect="off"
				spellcheck="false"
				disabled={phase !== 'idle'}
			/>
			<button
				type="submit"
				class="primary"
				disabled={phase !== 'idle' || !guess.trim()}
				aria-busy={phase === 'leaving'}
			>
				<span class="btn-label">Check</span>
				{#if phase === 'leaving'}
					<span class="btn-spinner" aria-hidden="true">
						<LoaderCircle size={16} strokeWidth={2.25} />
					</span>
				{/if}
			</button>
		</form>

		{#if error}
			<p class="error" role="alert">{error}</p>
		{/if}
	{/if}
</main>

<style>
	main {
		max-width: 520px;
		margin: 0 auto;
		padding: var(--space-lg) var(--space-lg) var(--space-xl);
		color: var(--color-text);
		font-family: inherit;
	}

	/* ---------- Empty / signed-out state ---------- */
	.empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		padding: 2rem 1rem;
		gap: 0.5rem;
	}

	.empty-art {
		width: min(260px, 60vw);
		height: auto;
		margin-bottom: 0.5rem;
	}

	.empty h1 {
		font-size: 1.4rem;
		font-weight: 600;
		margin: 0;
		color: var(--color-text);
	}

	.empty p {
		color: var(--color-text-muted);
		margin: 0 0 1rem;
		max-width: 32ch;
	}

	/* ---------- Quiz header ---------- */
	.quiz-header {
		margin-bottom: 1.5rem;
	}

	.page-title {
		font-size: var(--text-lg);
		font-weight: 600;
		margin: 0 0 0.75rem;
		color: var(--color-text-muted);
		letter-spacing: -0.01em;
	}

	.progress {
		height: 8px;
		background: var(--color-border);
		border-radius: var(--radius-full);
		overflow: hidden;
	}

	.progress-bar {
		height: 100%;
		background: var(--color-primary);
		border-radius: var(--radius-full);
		transition: width 320ms ease;
	}

	.progress-text {
		margin: 0.4rem 0 0;
		font-size: 0.8rem;
		color: var(--color-text-muted);
	}

	/* ---------- Card stack ---------- */
	.stack-wrap {
		display: flex;
		justify-content: center;
		margin-bottom: 1.5rem;
	}

	.stack {
		position: relative;
		width: 100%;
		max-width: 360px;
		height: 360px;
	}

	.card {
		position: absolute;
		inset: 0;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		box-shadow: 0 8px 24px rgba(30, 10, 4, 0.08);
		display: flex;
		flex-direction: column;
		padding: 1.5rem;
		transform: translateY(calc(var(--stack-idx) * 14px)) scale(calc(1 - var(--stack-idx) * 0.04));
		opacity: calc(1 - var(--stack-idx) * 0.25);
		z-index: calc(10 - var(--stack-idx));
		transition:
			transform 420ms cubic-bezier(0.2, 0.8, 0.2, 1),
			opacity 320ms ease,
			box-shadow 320ms ease;
	}

	.card.leaving {
		transform: translate(420px, -50px) rotate(10deg) scale(1) !important;
		opacity: 0 !important;
		transition:
			transform 420ms cubic-bezier(0.4, 0, 0.2, 1),
			opacity 380ms ease;
	}

	.card.wrong {
		animation: shake 360ms cubic-bezier(0.36, 0.07, 0.19, 0.97);
		border-color: var(--color-error);
	}

	@keyframes shake {
		10%,
		90% {
			transform: translateX(-3px);
		}
		20%,
		80% {
			transform: translateX(6px);
		}
		30%,
		50%,
		70% {
			transform: translateX(-8px);
		}
		40%,
		60% {
			transform: translateX(8px);
		}
	}

	.card-body {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		text-align: center;
		gap: 0.5rem;
	}

	.telugu {
		font-size: 2.4rem;
		font-weight: 600;
		color: var(--color-text);
		line-height: 1.15;
		word-break: break-word;
	}

	.roman {
		font-size: 1rem;
		font-style: italic;
		color: var(--color-text-muted);
	}

	.play {
		position: absolute;
		top: 0.75rem;
		right: 0.75rem;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 38px;
		height: 38px;
		padding: 0;
		border: 1px solid var(--color-border);
		background: var(--color-surface-raised);
		color: var(--color-primary);
		border-radius: var(--radius-full);
		cursor: pointer;
		transition: transform 120ms ease;
		z-index: 1;
	}

	.play:hover:not(:disabled) {
		background: var(--color-bg);
	}

	.play:active:not(:disabled) {
		transform: scale(0.92);
	}

	.play.playing {
		animation: play-pulse 1.4s ease-out infinite;
	}

	.play.playing :global(svg) {
		animation: play-icon-pulse 1.4s ease-in-out infinite;
	}

	@keyframes play-pulse {
		0% {
			box-shadow: 0 0 0 0 color-mix(in srgb, var(--color-primary) 45%, transparent);
		}
		70% {
			box-shadow: 0 0 0 12px color-mix(in srgb, var(--color-primary) 0%, transparent);
		}
		100% {
			box-shadow: 0 0 0 0 color-mix(in srgb, var(--color-primary) 0%, transparent);
		}
	}

	@keyframes play-icon-pulse {
		0%,
		100% {
			transform: scale(1);
		}
		50% {
			transform: scale(1.12);
		}
	}

	/* ---------- Wrong overlay ---------- */
	.wrong-overlay {
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		padding: 1.1rem 1.25rem 1.25rem;
		background: linear-gradient(180deg, transparent, #fff5f5 18%);
		border-bottom-left-radius: var(--radius-lg);
		border-bottom-right-radius: var(--radius-lg);
		text-align: center;
		z-index: 2;
	}

	.wrong-label {
		font-size: 0.8rem;
		color: var(--color-error);
		margin: 0 0 0.2rem;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		font-weight: 600;
	}

	.wrong-answer {
		font-size: 1.15rem;
		font-weight: 600;
		margin: 0 0 0.75rem;
		color: var(--color-text);
	}

	/* ---------- Answer form ---------- */
	.answer {
		display: flex;
		gap: 0.5rem;
	}

	.answer input {
		flex: 1;
		min-width: 0;
		padding: 0.75rem 0.9rem;
		font-size: 1rem;
		font-family: inherit;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		background: var(--color-surface);
		box-sizing: border-box;
	}

	.answer input:focus {
		outline: none;
		border-color: var(--color-primary);
	}

	.answer input:disabled {
		opacity: 0.6;
	}

	/* ---------- Buttons (shared) ---------- */
	.primary {
		position: relative;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		background: var(--color-accent-green);
		color: var(--color-surface);
		border: 0;
		padding: 0.75rem 1.1rem;
		font-size: 0.95rem;
		font-weight: 600;
		border-radius: var(--radius-md);
		font-family: inherit;
		text-decoration: none;
		cursor: pointer;
		white-space: nowrap;
	}

	.primary:hover:not(:disabled) {
		background: var(--color-accent-green-hover);
	}

	.primary:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.primary.small {
		padding: 0.55rem 1rem;
		font-size: 0.9rem;
	}

	.secondary {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		background: transparent;
		color: var(--color-text-muted);
		border: 1px solid var(--color-border);
		padding: 0.65rem 1rem;
		font-size: 0.9rem;
		border-radius: var(--radius-md);
		font-family: inherit;
		text-decoration: none;
		margin-top: 0.5rem;
	}

	.secondary:hover {
		background: var(--color-surface);
		color: var(--color-text);
	}

	.btn-spinner {
		display: inline-flex;
		align-items: center;
		animation: btn-spin 0.9s linear infinite;
	}

	@keyframes btn-spin {
		to {
			transform: rotate(360deg);
		}
	}

	.error {
		margin: 0.75rem 0 0;
		font-size: 0.9rem;
		color: var(--color-error);
	}

	/* ---------- Celebration ---------- */
	.celebration {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		padding: 1rem;
		gap: 0.4rem;
	}

	.celebration-mascot {
		width: min(220px, 60vw);
		height: auto;
		animation: bounce-in 720ms cubic-bezier(0.2, 1.3, 0.4, 1);
	}

	@keyframes bounce-in {
		0% {
			transform: scale(0.4) rotate(-8deg);
			opacity: 0;
		}
		60% {
			transform: scale(1.12) rotate(4deg);
			opacity: 1;
		}
		100% {
			transform: scale(1) rotate(0deg);
		}
	}

	.celebration h1 {
		font-family: var(--font-display);
		font-size: 2.2rem;
		font-weight: 400;
		color: var(--color-primary);
		margin: 0.25rem 0 0.75rem;
	}

	.score-card {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		padding: 1rem 1.25rem;
		min-width: min(280px, 70vw);
		margin-bottom: 1rem;
	}

	.score-row {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 1rem;
	}

	.score-num {
		font-size: 1.8rem;
		font-weight: 700;
		font-variant-numeric: tabular-nums;
	}

	.score-row.correct .score-num {
		color: var(--color-accent-green);
	}

	.score-row.missed .score-num {
		color: var(--color-primary);
	}

	.score-label {
		font-size: 0.9rem;
		color: var(--color-text-muted);
	}

	/* ---------- Confetti ---------- */
	.confetti {
		position: absolute;
		inset: 0;
		pointer-events: none;
		overflow: hidden;
	}

	.confetti-piece {
		position: absolute;
		top: -20px;
		left: var(--start-x);
		width: 8px;
		height: 14px;
		background: var(--color-primary);
		border-radius: 2px;
		animation: confetti-fall var(--duration) cubic-bezier(0.45, 0, 0.55, 1) forwards;
		animation-delay: var(--delay);
		opacity: 0.9;
	}

	.confetti-piece:nth-child(3n) {
		background: var(--color-accent-green);
		width: 10px;
		height: 10px;
		border-radius: 999px;
	}

	.confetti-piece:nth-child(3n + 1) {
		background: var(--color-accent-chocolate);
	}

	.confetti-piece:nth-child(4n) {
		width: 12px;
		height: 6px;
	}

	@keyframes confetti-fall {
		0% {
			transform: translate(0, -10vh) rotate(0deg);
			opacity: 0;
		}
		10% {
			opacity: 1;
		}
		100% {
			transform: translate(var(--drift), 90vh) rotate(var(--tilt));
			opacity: 0;
		}
	}

	/* ---------- Reduced motion ---------- */
	@media (prefers-reduced-motion: reduce) {
		.card,
		.card.leaving {
			transition: opacity 200ms ease !important;
			transform: translateY(calc(var(--stack-idx) * 8px)) scale(calc(1 - var(--stack-idx) * 0.04)) !important;
		}

		.card.leaving {
			opacity: 0 !important;
		}

		.card.wrong,
		.celebration-mascot,
		.play.playing,
		.confetti-piece {
			animation: none !important;
		}

		.confetti {
			display: none;
		}
	}
</style>
