<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import type { ActionResult } from '@sveltejs/kit';

	type NavUser = {
		id: string;
		email: string;
		isAnonymous?: boolean | null;
	};

	interface Props {
		user: NavUser | null;
		isAnonymous: boolean;
		authMessage?: string | null | undefined;
	}

	let { user, isAnonymous, authMessage = '' }: Props = $props();

	let dialog: HTMLDialogElement | undefined = $state();
	let activeTab = $state<'signin' | 'signup'>('signin');

	function openModal(tab: 'signin' | 'signup' = 'signin') {
		activeTab = tab;
		dialog?.showModal();
	}

	function closeModal() {
		dialog?.close();
	}

	const afterAuthEnhanceSubmit = async ({
		result: actionResult,
		update
	}: {
		result: ActionResult;
		update: (opts?: { reset?: boolean }) => Promise<void>;
	}) => {
		await update({ reset: false });
		if (actionResult.type !== 'failure') {
			closeModal();
			await invalidateAll();
		}
	};
</script>

<nav class="site-nav" aria-label="Account">
	<span class="brand">Chilaka</span>

	{#if user && !isAnonymous}
		<div class="account">
			<span class="email" title={user.email}>{user.email}</span>
			<form method="post" action="/?/signOut" use:enhance={() => afterAuthEnhanceSubmit}>
				<button type="submit" class="nav-btn ghost">Sign out</button>
			</form>
		</div>
	{:else}
		<div class="guest">
			<button type="button" class="nav-btn" onclick={() => openModal('signin')}>Sign in</button>
			<button type="button" class="nav-btn primary" onclick={() => openModal('signup')}
				>Create account</button
			>
		</div>
	{/if}
</nav>

<!-- Auth modal -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<dialog
	bind:this={dialog}
	class="auth-modal"
	onclose={closeModal}
	onclick={(e) => {
		if (e.target === dialog) closeModal();
	}}
>
	<div class="modal-inner">
		<button type="button" class="close-btn" onclick={closeModal} aria-label="Close">✕</button>

		<div class="tabs" role="tablist">
			<button
				role="tab"
				type="button"
				class="tab"
				class:active={activeTab === 'signin'}
				onclick={() => (activeTab = 'signin')}
				aria-selected={activeTab === 'signin'}
			>
				Sign in
			</button>
			<button
				role="tab"
				type="button"
				class="tab"
				class:active={activeTab === 'signup'}
				onclick={() => (activeTab = 'signup')}
				aria-selected={activeTab === 'signup'}
			>
				Create account
			</button>
		</div>

		{#if authMessage}
			<p class="auth-msg" role="alert">{authMessage}</p>
		{/if}

		{#if activeTab === 'signin'}
			<form
				method="post"
				action="/?/signInEmail"
				class="stack"
				use:enhance={() => afterAuthEnhanceSubmit}
			>
				<label>
					<span>Email</span>
					<input type="email" name="email" autocomplete="email" required />
				</label>
				<label>
					<span>Password</span>
					<input type="password" name="password" autocomplete="current-password" required />
				</label>
				<button type="submit" class="submit-btn">Sign in</button>
			</form>
		{:else}
			<form
				method="post"
				action="/?/signUpEmail"
				class="stack"
				use:enhance={() => afterAuthEnhanceSubmit}
			>
				<label>
					<span>Name</span>
					<input name="name" autocomplete="name" />
				</label>
				<label>
					<span>Email</span>
					<input type="email" name="email" autocomplete="email" required />
				</label>
				<label>
					<span>Password</span>
					<input type="password" name="password" autocomplete="new-password" required />
				</label>
				<button type="submit" class="submit-btn">Create account</button>
			</form>
		{/if}
	</div>
</dialog>

<style>
	.site-nav {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		max-width: 560px;
		margin: 0 auto 1.25rem;
		padding: 0 1.25rem;
		font-family:
			ui-sans-serif,
			system-ui,
			-apple-system,
			'Segoe UI',
			Roboto,
			sans-serif;
	}

	.brand {
		font-weight: 600;
		font-size: 1rem;
		color: #1a1a1a;
		letter-spacing: -0.01em;
	}

	.account {
		display: flex;
		align-items: center;
		gap: 0.6rem;
	}

	.email {
		font-size: 0.82rem;
		color: #555;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		max-width: 200px;
	}

	.guest {
		display: flex;
		gap: 0.5rem;
	}

	.nav-btn {
		font-family: inherit;
		cursor: pointer;
		font-size: 0.85rem;
		border-radius: 8px;
		padding: 0.38rem 0.8rem;
		border: 1px solid #ddd;
		background: #fff;
		color: #222;
		font-weight: 500;
	}

	.nav-btn.primary {
		background: #1a1a1a;
		color: #fff;
		border-color: #1a1a1a;
	}

	.nav-btn.ghost {
		background: transparent;
		color: #555;
	}

	/* Modal */
	.auth-modal {
		border: none;
		border-radius: 16px;
		padding: 0;
		width: min(440px, calc(100vw - 2rem));
		box-shadow:
			0 24px 60px rgba(0, 0, 0, 0.16),
			0 4px 16px rgba(0, 0, 0, 0.08);
		font-family:
			ui-sans-serif,
			system-ui,
			-apple-system,
			'Segoe UI',
			Roboto,
			sans-serif;
	}

	.auth-modal::backdrop {
		background: rgba(0, 0, 0, 0.4);
		backdrop-filter: blur(2px);
	}

	.modal-inner {
		padding: 2rem;
		position: relative;
	}

	.close-btn {
		position: absolute;
		top: 1rem;
		right: 1rem;
		background: none;
		border: none;
		font-size: 1rem;
		color: #999;
		cursor: pointer;
		line-height: 1;
		padding: 0.25rem;
	}

	.close-btn:hover {
		color: #333;
	}

	.tabs {
		display: flex;
		gap: 0;
		border-bottom: 2px solid #f0f0f0;
		margin-bottom: 1.5rem;
	}

	.tab {
		font-family: inherit;
		font-size: 0.95rem;
		font-weight: 500;
		padding: 0.5rem 0;
		margin-right: 1.5rem;
		background: none;
		border: none;
		border-bottom: 2px solid transparent;
		margin-bottom: -2px;
		color: #999;
		cursor: pointer;
	}

	.tab.active {
		color: #1a1a1a;
		border-bottom-color: #1a1a1a;
	}

	.stack {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.stack label {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		font-size: 0.85rem;
		font-weight: 500;
		color: #444;
	}

	.stack input {
		padding: 0.65rem 0.8rem;
		font-size: 1rem;
		border-radius: 10px;
		border: 1px solid #ddd;
		font-family: inherit;
		width: 100%;
		box-sizing: border-box;
	}

	.stack input:focus {
		outline: none;
		border-color: #1a1a1a;
	}

	.submit-btn {
		margin-top: 0.5rem;
		width: 100%;
		background: #1a1a1a;
		color: #fff;
		border: none;
		border-radius: 10px;
		padding: 0.75rem;
		font-size: 1rem;
		font-weight: 500;
		font-family: inherit;
		cursor: pointer;
	}

	.submit-btn:hover {
		background: #333;
	}

	.auth-msg {
		margin: 0 0 1rem;
		font-size: 0.875rem;
		color: #c0392b;
		background: #fff5f5;
		border: 1px solid #fecaca;
		border-radius: 8px;
		padding: 0.6rem 0.8rem;
	}
</style>
