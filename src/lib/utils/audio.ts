import type { SvelteMap } from 'svelte/reactivity';

export type PlayState = 'fetching' | 'playing';

/**
 * Fetches TTS audio and plays it back, tracking lifecycle state.
 *
 * `states` must be a `SvelteMap` (from `svelte/reactivity`) so that
 * `.set()` / `.delete()` calls from this helper trigger UI updates.
 * A plain `Map` wrapped in `$state(...)` is NOT reactive in Svelte 5.
 */
export async function playPronunciation(
	teluguScript: string,
	id: string,
	states: SvelteMap<string, PlayState>,
	onError?: (message: string) => void
): Promise<void> {
	if (states.has(id)) return;
	states.set(id, 'fetching');

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

		const cleanup = () => {
			URL.revokeObjectURL(url);
			states.delete(id);
		};

		// Flip to the equalizer state as soon as the browser actually starts
		// playing, rather than waiting for the (already-resolved) `play()` promise.
		audio.addEventListener('playing', () => {
			states.set(id, 'playing');
		});
		audio.addEventListener('ended', cleanup);
		audio.addEventListener('error', cleanup);

		await audio.play();
	} catch (err) {
		states.delete(id);
		onError?.(err instanceof Error ? err.message : 'Audio failed');
	}
}
