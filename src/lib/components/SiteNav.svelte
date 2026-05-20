<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { page } from '$app/state';
	import type { ActionResult } from '@sveltejs/kit';
	import {
		BookOpen,
		BookA,
		LogIn,
		LogOut,
		Menu,
		UserPlus,
		X
	} from '@lucide/svelte';

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
	let mobileMenuOpen = $state(false);

	const pageLinks = [
		{ href: '/', label: 'Flashcards', icon: BookOpen },
		{ href: '/verbs', label: 'Verbs', icon: BookA }
	] as const;

	function isActive(href: string): boolean {
		const path = page.url.pathname;
		if (href === '/') return path === '/';
		return path === href || path.startsWith(href + '/');
	}

	function openModal(tab: 'signin' | 'signup' = 'signin') {
		activeTab = tab;
		closeMobileMenu();
		dialog?.showModal();
	}

	function closeModal() {
		dialog?.close();
	}

	function closeMobileMenu() {
		mobileMenuOpen = false;
	}

	function toggleMobileMenu() {
		mobileMenuOpen = !mobileMenuOpen;
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && mobileMenuOpen) {
			closeMobileMenu();
		}
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
			closeMobileMenu();
			await invalidateAll();
		}
	};
</script>

<svelte:window onkeydown={handleKeydown} />

<aside class="sidebar" aria-label="Site navigation">
	<div class="sidebar-top">
		<a href="/" class="brand" onclick={closeMobileMenu}>Chilaka</a>

		<button
			type="button"
			class="menu-toggle"
			onclick={toggleMobileMenu}
			aria-expanded={mobileMenuOpen}
			aria-controls="mobile-nav-panel"
			aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
		>
			{#if mobileMenuOpen}
				<X size={22} strokeWidth={2} aria-hidden="true" />
			{:else}
				<Menu size={22} strokeWidth={2} aria-hidden="true" />
			{/if}
		</button>
	</div>

	{#if mobileMenuOpen}
		<button
			type="button"
			class="backdrop"
			aria-label="Close menu"
			onclick={closeMobileMenu}
		></button>
	{/if}

	<div id="mobile-nav-panel" class="sidebar-body" class:open={mobileMenuOpen}>
		<nav class="page-nav" aria-label="Primary">
			{#each pageLinks as link (link.href)}
				{@const Icon = link.icon}
				<a
					href={link.href}
					class="nav-link"
					class:active={isActive(link.href)}
					aria-current={isActive(link.href) ? 'page' : undefined}
					onclick={closeMobileMenu}
				>
					<Icon size={20} strokeWidth={2} aria-hidden="true" />
					<span>{link.label}</span>
				</a>
			{/each}
		</nav>

		<div class="auth-block">
			{#if user && !isAnonymous}
				<span class="email" title={user.email}>{user.email}</span>
				<form method="post" action="/?/signOut" use:enhance={() => afterAuthEnhanceSubmit}>
					<button type="submit" class="nav-btn">
						<LogOut size={18} strokeWidth={2} aria-hidden="true" />
						<span>Sign out</span>
					</button>
				</form>
			{:else}
				<button type="button" class="nav-btn" onclick={() => openModal('signin')}>
					<LogIn size={18} strokeWidth={2} aria-hidden="true" />
					<span>Sign in</span>
				</button>
				<button type="button" class="nav-btn primary" onclick={() => openModal('signup')}>
					<UserPlus size={18} strokeWidth={2} aria-hidden="true" />
					<span>Create account</span>
				</button>
			{/if}
		</div>
	</div>
</aside>

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
		<button type="button" class="close-btn" onclick={closeModal} aria-label="Close">
			<X size={18} strokeWidth={2} aria-hidden="true" />
		</button>

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
	.sidebar {
		font-family:
			ui-sans-serif,
			system-ui,
			-apple-system,
			'Segoe UI',
			Roboto,
			sans-serif;
		flex-shrink: 0;
	}

	.sidebar-top {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.85rem 1rem;
	}

	.brand {
		font-weight: 600;
		font-size: 1.05rem;
		color: #1a1a1a;
		letter-spacing: -0.01em;
		text-decoration: none;
	}

	.brand:hover {
		color: #333;
	}

	.menu-toggle {
		display: none;
		align-items: center;
		justify-content: center;
		width: 40px;
		height: 40px;
		padding: 0;
		border: none;
		background: transparent;
		color: #1a1a1a;
		border-radius: 8px;
		cursor: pointer;
	}

	.menu-toggle:hover {
		background: #f3f3f3;
	}

	.backdrop {
		display: none;
	}

	.sidebar-body {
		display: flex;
		flex-direction: column;
		flex: 1;
		min-height: 0;
	}

	.page-nav {
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
		padding: 0 0.65rem;
	}

	.nav-link {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.65rem 0.85rem;
		font-size: 0.9rem;
		font-weight: 600;
		color: #777;
		text-decoration: none;
		border-radius: 10px;
		border-left: 3px solid transparent;
		transition:
			color 120ms ease,
			background 120ms ease,
			border-color 120ms ease;
	}

	.nav-link:hover {
		color: #1a1a1a;
		background: #f7f7f7;
	}

	.nav-link.active {
		color: #1a1a1a;
		background: #eef4ff;
		border-left-color: #3b82f6;
	}

	.auth-block {
		margin-top: auto;
		padding: 1rem 0.65rem 1.25rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		border-top: 1px solid #eee;
	}

	.email {
		font-size: 0.78rem;
		color: #666;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		padding: 0 0.85rem;
	}

	.nav-btn {
		display: flex;
		align-items: center;
		gap: 0.65rem;
		width: 100%;
		font-family: inherit;
		cursor: pointer;
		font-size: 0.88rem;
		border-radius: 10px;
		padding: 0.6rem 0.85rem;
		border: 1px solid #ddd;
		background: #fff;
		color: #222;
		font-weight: 500;
		text-align: left;
	}

	.nav-btn:hover {
		background: #f7f7f7;
	}

	.nav-btn.primary {
		background: #1a1a1a;
		color: #fff;
		border-color: #1a1a1a;
	}

	.nav-btn.primary:hover {
		background: #333;
	}

	/* Desktop: left rail */
	@media (min-width: 768px) {
		.sidebar {
			width: 220px;
			min-height: 100vh;
			border-right: 1px solid #eee;
			display: flex;
			flex-direction: column;
		}

		.sidebar-top {
			padding: 1.25rem 1rem 0.75rem;
		}

		.sidebar-body {
			display: flex;
			flex-direction: column;
			flex: 1;
		}

		.backdrop {
			display: none;
		}
	}

	/* Mobile: top bar + drawer */
	@media (max-width: 767px) {
		.sidebar {
			position: sticky;
			top: 0;
			z-index: 100;
			width: 100%;
			background: #fff;
			border-bottom: 1px solid #eee;
		}

		.menu-toggle {
			display: flex;
		}

		.backdrop {
			display: block;
			position: fixed;
			inset: 0;
			top: 57px;
			background: rgba(0, 0, 0, 0.35);
			border: none;
			cursor: pointer;
			z-index: 99;
		}

		.sidebar-body {
			display: none;
			position: fixed;
			top: 57px;
			left: 0;
			right: 0;
			bottom: 0;
			z-index: 100;
			background: #fff;
			overflow-y: auto;
			padding-top: 0.5rem;
		}

		.sidebar-body.open {
			display: flex;
		}
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
		font-family: inherit;
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
		display: flex;
		align-items: center;
		justify-content: center;
		background: none;
		border: none;
		color: #999;
		cursor: pointer;
		padding: 0.25rem;
		border-radius: 6px;
	}

	.close-btn:hover {
		color: #333;
		background: #f3f3f3;
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
