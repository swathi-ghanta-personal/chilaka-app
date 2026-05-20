<script lang="ts">
	import { CircleCheck, CircleAlert, Info, X } from '@lucide/svelte';
	import { fly } from 'svelte/transition';
	import { toastState, dismissToast } from '$lib/stores/toast.svelte';
</script>

<div class="toast-region" role="region" aria-live="polite" aria-label="Notifications">
	{#each toastState.items as item (item.id)}
		<div
			class="toast toast-{item.type}"
			role="status"
			in:fly={{ y: 16, duration: 220 }}
			out:fly={{ y: 16, duration: 180 }}
		>
			<span class="icon" aria-hidden="true">
				{#if item.type === 'success'}
					<CircleCheck size={18} strokeWidth={2.25} />
				{:else if item.type === 'error'}
					<CircleAlert size={18} strokeWidth={2.25} />
				{:else}
					<Info size={18} strokeWidth={2.25} />
				{/if}
			</span>
			<span class="message">{item.message}</span>
			<button
				type="button"
				class="close"
				aria-label="Dismiss notification"
				onclick={() => dismissToast(item.id)}
			>
				<X size={14} strokeWidth={2} aria-hidden="true" />
			</button>
		</div>
	{/each}
</div>

<style>
	.toast-region {
		position: fixed;
		left: 50%;
		bottom: 1.25rem;
		transform: translateX(-50%);
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		z-index: 1000;
		pointer-events: none;
		width: max-content;
		max-width: calc(100vw - 2rem);
	}

	.toast {
		pointer-events: auto;
		display: flex;
		align-items: center;
		gap: 0.6rem;
		padding: 0.65rem 0.6rem 0.65rem 0.85rem;
		background: var(--color-text);
		color: #fff;
		border-radius: var(--radius-md);
		font-size: 0.9rem;
		font-weight: 500;
		box-shadow:
			0 12px 28px rgba(0, 0, 0, 0.18),
			0 2px 6px rgba(0, 0, 0, 0.08);
		min-width: 240px;
	}

	.toast-success .icon {
		color: #6ee7a1;
	}

	.toast-error .icon {
		color: #fca5a5;
	}

	.toast-info .icon {
		color: #93c5fd;
	}

	.icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.message {
		flex: 1;
		line-height: 1.3;
	}

	.close {
		flex-shrink: 0;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 24px;
		height: 24px;
		padding: 0;
		background: transparent;
		border: none;
		color: rgba(255, 255, 255, 0.65);
		border-radius: var(--radius-sm);
		cursor: pointer;
	}

	.close:hover {
		color: #fff;
		background: rgba(255, 255, 255, 0.1);
	}
</style>
