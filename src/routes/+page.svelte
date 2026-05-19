<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
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

	let sourceLang = $state<SourceLang>('te');
	let textInput = $state('');
	let card = $state<TranslatedCard | null>(null);

	let translating = $state(false);
	let recording = $state(false);
	let error = $state<string | null>(null);

	let mediaRecorder: MediaRecorder | null = null;
	let recordedChunks: Blob[] = [];
	let activeStream: MediaStream | null = null;

	const playingIds = $state(new Set<string>());

	function placeholder(lang: SourceLang) {
		return lang === 'te' ? 'Telugu word (in Telugu script or English letters)' : 'English word';
	}

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
				body: JSON.stringify({ text, sourceLang })
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
			form.append('sourceLang', sourceLang);

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

	<section class="lang-toggle" aria-label="Source language">
		<button
			type="button"
			class="toggle"
			class:active={sourceLang === 'te'}
			onclick={() => (sourceLang = 'te')}
		>
			Telugu
		</button>
		<button
			type="button"
			class="toggle"
			class:active={sourceLang === 'en'}
			onclick={() => (sourceLang = 'en')}
		>
			English
		</button>
	</section>

	<section class="input">
		<form
			onsubmit={(event) => {
				event.preventDefault();
				translateText();
			}}
		>
			<input
				type="text"
				bind:value={textInput}
				placeholder={placeholder(sourceLang)}
				disabled={translating || recording}
				autocomplete="off"
				autocapitalize="off"
			/>
			<button
				type="submit"
				class="primary"
				disabled={translating || recording || !textInput.trim()}
			>
				Translate
			</button>
		</form>

		<button
			type="button"
			class="mic"
			class:recording
			disabled={translating && !recording}
			onclick={recording ? stopRecording : startRecording}
			aria-label={recording ? 'Stop recording' : 'Record audio'}
		>
			{recording ? 'Stop' : 'Speak'}
		</button>
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
					{playingIds.has('result') ? '▶︎…' : '▶︎'}
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
						<button
							type="button"
							class="play small"
							onclick={() => playPronunciation(item.teluguScript, `saved-${item.id}`)}
							disabled={playingIds.has(`saved-${item.id}`)}
							aria-label="Play pronunciation"
						>
							{playingIds.has(`saved-${item.id}`) ? '▶︎…' : '▶︎'}
						</button>
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
		margin-bottom: 1.75rem;
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

	.lang-toggle {
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
	}

	.toggle.active {
		background: #fff;
		color: #1a1a1a;
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
	}

	.input {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 1rem;
	}

	.input form {
		display: flex;
		flex: 1;
		gap: 0.5rem;
	}

	input[type='text'] {
		flex: 1;
		padding: 0.75rem 0.9rem;
		font-size: 1rem;
		border: 1px solid #ddd;
		border-radius: 10px;
		background: #fff;
	}

	input[type='text']:focus {
		outline: none;
		border-color: #888;
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

	.mic {
		background: #fff;
		color: #1a1a1a;
		border: 1px solid #ddd;
		padding: 0.7rem 1rem;
		font-size: 0.95rem;
		border-radius: 10px;
		font-weight: 500;
		min-width: 92px;
	}

	.mic.recording {
		background: #d24545;
		color: #fff;
		border-color: #d24545;
	}

	.mic:disabled {
		opacity: 0.4;
		cursor: not-allowed;
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
		font-size: 0.85rem;
		padding: 0;
	}

	.play:disabled {
		opacity: 0.6;
	}

	.play.small {
		width: 30px;
		height: 30px;
		font-size: 0.75rem;
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
</style>
