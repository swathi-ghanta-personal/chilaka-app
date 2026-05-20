<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { Mic, Square, Trash2, Volume2 } from '@lucide/svelte';
	import type { PageData } from './$types';

	type SourceLang = 'te' | 'en';

	interface TranslatedCard {
		english: string;
		teluguScript: string;
		teluguRoman: string;
		sourceLang: SourceLang;
		sourceInput: string;
	}

	let { data }: { data: PageData } = $props();

	let textInput = $state('');
	let card = $state<TranslatedCard | null>(null);

	let translating = $state(false);
	let recording = $state(false);
	let error = $state<string | null>(null);

	let mediaRecorder: MediaRecorder | null = null;
	let recordedChunks: Blob[] = [];
	let activeStream: MediaStream | null = null;

	const playingIds = $state(new Set<string>());

	async function translateText() {
		const text = textInput.trim();
		if (!text || translating) return;

		translating = true;
		error = null;
		card = null;

		try {
			const res = await fetch('/api/translate', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ text })
			});

			if (!res.ok) {
				const body = await res.json().catch(() => ({}));
				throw new Error(body?.message ?? 'Translation failed');
			}

			card = (await res.json()) as TranslatedCard;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Translation failed';
		} finally {
			translating = false;
		}
	}

	async function startRecording() {
		if (recording || translating) return;
		error = null;
		card = null;

		try {
			activeStream = await navigator.mediaDevices.getUserMedia({ audio: true });
		} catch {
			error = 'Microphone permission denied.';
			return;
		}

		recordedChunks = [];
		mediaRecorder = new MediaRecorder(activeStream);

		mediaRecorder.addEventListener('dataavailable', (event) => {
			if (event.data.size > 0) recordedChunks.push(event.data);
		});

		mediaRecorder.addEventListener('stop', async () => {
			activeStream?.getTracks().forEach((track) => track.stop());
			activeStream = null;

			const blob = new Blob(recordedChunks, {
				type: mediaRecorder?.mimeType || 'audio/webm'
			});
			recordedChunks = [];

			await sendAudio(blob);
		});

		mediaRecorder.start();
		recording = true;
	}

	function stopRecording() {
		if (!recording) return;
		mediaRecorder?.stop();
		recording = false;
	}

	async function sendAudio(blob: Blob) {
		translating = true;
		try {
			const form = new FormData();
			const ext = (mediaRecorder?.mimeType || 'audio/webm').includes('mp4') ? 'mp4' : 'webm';
			form.append('audio', new File([blob], `voice.${ext}`, { type: blob.type }));

			const res = await fetch('/api/translate', { method: 'POST', body: form });

			if (!res.ok) {
				const body = await res.json().catch(() => ({}));
				throw new Error(body?.message ?? 'Translation failed');
			}

			card = (await res.json()) as TranslatedCard;
			textInput = card.sourceInput;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Translation failed';
		} finally {
			translating = false;
		}
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

	function clearCard() {
		card = null;
		textInput = '';
		error = null;
	}
</script>

<svelte:head>
	<title>Chilaka — Flashcards</title>
</svelte:head>

<main>
	<header>
		<h1 class="page-title">Telugu vocabulary</h1>
		<p class="tagline">Add a flashcard by voice or text.</p>
	</header>

	<section class="input">
		<form
			onsubmit={(event) => {
				event.preventDefault();
				translateText();
			}}
		>
			<div class="input-wrap">
				<input
					type="text"
					bind:value={textInput}
					placeholder="Telugu or English word"
					disabled={translating || recording}
					autocomplete="off"
					autocapitalize="off"
				/>
				<button
					type="button"
					class="mic-btn"
					class:recording
					disabled={translating && !recording}
					onclick={recording ? stopRecording : startRecording}
					aria-label={recording ? 'Stop recording' : 'Record audio'}
				>
					{#if recording}
						<Square size={18} strokeWidth={2} aria-hidden="true" />
					{:else}
						<Mic size={18} strokeWidth={2} aria-hidden="true" />
					{/if}
				</button>
			</div>
			<button
				type="submit"
				class="primary"
				disabled={translating || recording || !textInput.trim()}
			>
				Translate
			</button>
		</form>
	</section>

	{#if translating}
		<p class="status">Translating…</p>
	{/if}

	{#if error}
		<p class="error" role="alert">{error}</p>
	{/if}

	{#if card}
		<section class="result-card">
			<div class="result-row telugu">
				<span class="text">{card.teluguScript}</span>
				<button
					type="button"
					class="play"
					onclick={() => playPronunciation(card!.teluguScript, 'result')}
					disabled={playingIds.has('result')}
					aria-label="Play pronunciation"
				>
					<Volume2 size={16} strokeWidth={2} aria-hidden="true" />
				</button>
			</div>
			<div class="result-row roman">{card.teluguRoman}</div>
			<div class="result-row english">{card.english}</div>

			<form
				method="post"
				action="?/save"
				use:enhance={() =>
					async ({ result, update }) => {
						await update({ reset: false });
						if (result.type === 'success') {
							clearCard();
							await invalidateAll();
						}
					}}
			>
				<input type="hidden" name="english" value={card.english} />
				<input type="hidden" name="teluguScript" value={card.teluguScript} />
				<input type="hidden" name="teluguRoman" value={card.teluguRoman} />
				<input type="hidden" name="sourceLang" value={card.sourceLang} />
				<input type="hidden" name="sourceInput" value={card.sourceInput} />
				<button type="submit" class="primary">Save flashcard</button>
				<button type="button" class="secondary" onclick={clearCard}>Discard</button>
			</form>
		</section>
	{/if}

	<section class="saved">
		<h2>Saved ({data.cards.length})</h2>
		{#if data.cards.length === 0}
			<p class="empty">No flashcards yet. Add one above.</p>
		{:else}
			<ul>
				{#each data.cards as item (item.id)}
					<li>
						<div class="saved-text">
							<span class="telugu">{item.teluguScript}</span>
							<span class="roman">{item.teluguRoman}</span>
							<span class="english">{item.english}</span>
						</div>
						<div class="saved-actions">
							<button
								type="button"
								class="play small"
								onclick={() => playPronunciation(item.teluguScript, `saved-${item.id}`)}
								disabled={playingIds.has(`saved-${item.id}`)}
								aria-label="Play pronunciation"
							>
								<Volume2 size={14} strokeWidth={2} aria-hidden="true" />
							</button>
							<form
								method="post"
								action="?/delete"
								use:enhance={() =>
									async ({ result, update }) => {
										await update({ reset: false });
										if (result.type === 'success') {
											await invalidateAll();
										}
									}}
							>
								<input type="hidden" name="id" value={item.id} />
								<button type="submit" class="delete-btn" aria-label="Delete flashcard">
									<Trash2 size={14} strokeWidth={2} aria-hidden="true" />
								</button>
							</form>
						</div>
					</li>
				{/each}
			</ul>
		{/if}
	</section>
</main>

<style>
	main {
		max-width: 560px;
		margin: 0 auto;
		padding: var(--space-lg) var(--space-lg) var(--space-xl);
		font-family: inherit;
		color: var(--color-text);
	}

	header {
		margin-bottom: 1.75rem;
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

	.input form {
		display: flex;
		gap: 0.5rem;
	}

	.input-wrap {
		position: relative;
		flex: 1;
		min-width: 0;
	}

	.input-wrap input[type='text'] {
		width: 100%;
		box-sizing: border-box;
		padding: 0.75rem 2.75rem 0.75rem 0.9rem;
		font-size: 1rem;
		border: 1px solid #ddd;
		border-radius: 10px;
		background: #fff;
	}

	.input-wrap input[type='text']:focus {
		outline: none;
		border-color: #888;
	}

	.mic-btn {
		position: absolute;
		right: 0.35rem;
		top: 50%;
		transform: translateY(-50%);
		display: flex;
		align-items: center;
		justify-content: center;
		width: 34px;
		height: 34px;
		padding: 0;
		border: none;
		background: transparent;
		color: #555;
		border-radius: 8px;
		cursor: pointer;
	}

	.mic-btn:hover:not(:disabled) {
		background: #f0f0f0;
		color: #1a1a1a;
	}

	.mic-btn.recording {
		background: #d24545;
		color: #fff;
	}

	.mic-btn.recording:hover:not(:disabled) {
		background: #b83838;
		color: #fff;
	}

	.mic-btn:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.input {
		margin-bottom: 1rem;
	}

	button {
		font-family: inherit;
		cursor: pointer;
	}

	.primary {
		background: #1a1a1a;
		color: #fff;
		border: 0;
		padding: 0.7rem 1rem;
		font-size: 0.95rem;
		border-radius: 10px;
		font-weight: 500;
		white-space: nowrap;
	}

	.primary:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.secondary {
		background: transparent;
		color: #666;
		border: 1px solid #ddd;
		padding: 0.7rem 1rem;
		font-size: 0.95rem;
		border-radius: 10px;
		margin-left: 0.5rem;
	}

	.status,
	.error {
		font-size: 0.9rem;
		margin: 0.5rem 0 1rem;
	}

	.error {
		color: #c0392b;
	}

	.result-card {
		background: #fafafa;
		border: 1px solid #eee;
		border-radius: 14px;
		padding: 1.25rem;
		margin-bottom: 2rem;
	}

	.result-row {
		margin-bottom: 0.4rem;
	}

	.result-row.telugu {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		font-size: 1.6rem;
		font-weight: 500;
		margin-bottom: 0.6rem;
	}

	.result-row.roman {
		color: #777;
		font-size: 0.95rem;
		font-style: italic;
	}

	.result-row.english {
		color: #1a1a1a;
		font-size: 1.05rem;
		margin-bottom: 1rem;
	}

	.play {
		background: #fff;
		border: 1px solid #ddd;
		border-radius: 999px;
		width: 36px;
		height: 36px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0;
		color: #1a1a1a;
	}

	.play:hover:not(:disabled) {
		background: #f5f5f5;
	}

	.play:disabled {
		opacity: 0.6;
	}

	.play.small {
		width: 30px;
		height: 30px;
	}

	.saved h2 {
		font-size: 1rem;
		font-weight: 600;
		color: #555;
		margin: 0 0 0.75rem;
	}

	.empty {
		color: #999;
		font-size: 0.9rem;
		margin: 0;
	}

	.saved ul {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.saved li {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.75rem 0;
		border-top: 1px solid #eee;
		gap: 0.75rem;
	}

	.saved-text {
		display: flex;
		flex-direction: column;
		gap: 0.1rem;
		min-width: 0;
	}

	.saved-text .telugu {
		font-size: 1.1rem;
		font-weight: 500;
	}

	.saved-text .roman {
		font-size: 0.85rem;
		color: #888;
		font-style: italic;
	}

	.saved-text .english {
		font-size: 0.95rem;
		color: #333;
	}

	.saved-actions {
		display: flex;
		align-items: center;
		gap: 0.35rem;
		flex-shrink: 0;
	}

	.delete-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 30px;
		height: 30px;
		padding: 0;
		border: 1px solid #ddd;
		border-radius: 999px;
		background: #fff;
		color: #888;
	}

	.delete-btn:hover {
		background: #fff5f5;
		border-color: #fecaca;
		color: #c0392b;
	}
</style>
