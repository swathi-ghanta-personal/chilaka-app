<script lang="ts">
	import { Volume2 } from '@lucide/svelte';

	type State = 'idle' | 'fetching' | 'playing';

	let {
		state = 'idle',
		size = 16
	}: {
		state?: State;
		size?: number;
	} = $props();
</script>

{#if state === 'fetching'}
	<span class="indicator dots" aria-hidden="true" style="width: {size}px; height: {size}px;">
		<span class="dot"></span>
		<span class="dot"></span>
		<span class="dot"></span>
	</span>
{:else if state === 'playing'}
	<span class="indicator bars" aria-hidden="true" style="width: {size}px; height: {size}px;">
		<span class="bar"></span>
		<span class="bar"></span>
		<span class="bar"></span>
		<span class="bar"></span>
	</span>
{:else}
	<Volume2 {size} strokeWidth={2} aria-hidden="true" />
{/if}

<style>
	.indicator {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 14%;
	}

	.dot {
		width: 24%;
		height: 24%;
		background: currentColor;
		border-radius: 50%;
		animation: dot-bounce 1s ease-in-out infinite;
	}

	.dot:nth-child(1) {
		animation-delay: 0s;
	}
	.dot:nth-child(2) {
		animation-delay: 0.16s;
	}
	.dot:nth-child(3) {
		animation-delay: 0.32s;
	}

	@keyframes dot-bounce {
		0%,
		70%,
		100% {
			transform: translateY(15%) scale(0.85);
			opacity: 0.55;
		}
		35% {
			transform: translateY(-15%) scale(1);
			opacity: 1;
		}
	}

	.bar {
		width: 18%;
		height: 100%;
		background: currentColor;
		border-radius: 999px;
		transform: scaleY(0.35);
		transform-origin: 50% 50%;
		animation: bar-equalize 0.9s ease-in-out infinite;
	}

	.bar:nth-child(1) {
		animation-delay: 0s;
	}
	.bar:nth-child(2) {
		animation-delay: 0.18s;
	}
	.bar:nth-child(3) {
		animation-delay: 0.36s;
	}
	.bar:nth-child(4) {
		animation-delay: 0.12s;
	}

	@keyframes bar-equalize {
		0%,
		100% {
			transform: scaleY(0.3);
		}
		50% {
			transform: scaleY(1);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.dot,
		.bar {
			animation: none;
		}
		.bar {
			transform: scaleY(0.7);
		}
	}
</style>
