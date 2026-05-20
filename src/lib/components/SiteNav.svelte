<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { page } from '$app/state';
	import type { ActionResult } from '@sveltejs/kit';
	import parrot from '$lib/assets/parrot.png';
	import {
		BookOpen,
		BookA,
		ChevronsLeft,
		ChevronsRight,
		GraduationCap,
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
	let sidebarCollapsed = $state(false);

	const pageLinks = [
		{ href: '/', label: 'Flashcards', icon: BookOpen },
		{ href: '/verbs', label: 'Verbs', icon: BookA },
		{ href: '/quiz', label: 'Quiz', icon: GraduationCap }
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

	function toggleCollapse() {
		sidebarCollapsed = !sidebarCollapsed;
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

<aside class="sidebar" class:collapsed={sidebarCollapsed} aria-label="Site navigation">
	<div class="sidebar-top">
		<a href="/" class="brand" onclick={closeMobileMenu}>
			<img src={parrot} class="brand-icon" alt="Chilaka" width="48" height="48" />
			<span class="brand-name">Chilaka</span>
		</a>

		<button
			type="button"
			class="collapse-toggle"
			onclick={toggleCollapse}
			aria-label={sidebarCollapsed ? 'Expand navigation' : 'Collapse navigation'}
		>
			{#if sidebarCollapsed}
				<ChevronsRight size={18} strokeWidth={2} aria-hidden="true" />
			{:else}
				<ChevronsLeft size={18} strokeWidth={2} aria-hidden="true" />
			{/if}
		</button>

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
				title={sidebarCollapsed ? link.label : undefined}
			>
				<Icon size={20} strokeWidth={2} aria-hidden="true" />
				<span class="link-label">{link.label}</span>
			</a>
			{/each}
		</nav>

		<div class="auth-block">
			{#if user && !isAnonymous}
				<span class="email link-label" title={user.email}>{user.email}</span>
				<form method="post" action="/?/signOut" use:enhance={() => afterAuthEnhanceSubmit}>
					<button type="submit" class="nav-btn" title={sidebarCollapsed ? 'Sign out' : undefined}>
						<LogOut size={18} strokeWidth={2} aria-hidden="true" />
						<span class="link-label">Sign out</span>
					</button>
				</form>
			{:else}
				<button type="button" class="nav-btn" onclick={() => openModal('signin')} title={sidebarCollapsed ? 'Sign in' : undefined}>
					<LogIn size={18} strokeWidth={2} aria-hidden="true" />
					<span class="link-label">Sign in</span>
				</button>
				<button type="button" class="nav-btn primary" onclick={() => openModal('signup')} title={sidebarCollapsed ? 'Create account' : undefined}>
					<UserPlus size={18} strokeWidth={2} aria-hidden="true" />
					<span class="link-label">Create account</span>
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
		flex-shrink: 0;
		background: var(--color-surface-raised);
		border-right: 1px solid var(--color-border);
	}

	.sidebar-top {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.85rem 1rem;
		gap: 0.5rem;
	}

	.brand {
		display: flex;
		align-items: center;
		gap: 0.15rem;
		text-decoration: none;
		min-width: 0;
		flex: 1;
	}

	.brand-icon {
		flex-shrink: 0;
		display: block;
		border-radius: var(--radius-sm);
		width: 48px;
		height: 48px;
	}

	.brand-name {
		font-family: 'Pacifico', cursive;
		font-size: 1.8rem;
		font-weight: 400;
		color: var(--color-primary);
		letter-spacing: 0.01em;
		line-height: 1;
		white-space: nowrap;
		overflow: hidden;
	}

	.collapse-toggle {
		display: none;
		flex-shrink: 0;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		padding: 0;
		border: none;
		background: transparent;
		color: var(--color-text-muted);
		border-radius: var(--radius-md);
		cursor: pointer;
	}

	.collapse-toggle:hover {
		background: var(--color-surface);
		color: var(--color-text);
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
		color: var(--color-text);
		border-radius: var(--radius-md);
		cursor: pointer;
	}

	.menu-toggle:hover {
		background: var(--color-surface);
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
		color: var(--color-text-muted);
		text-decoration: none;
		border-radius: var(--radius-md);
		border-left: 3px solid transparent;
		transition:
			color 120ms ease,
			background 120ms ease,
			border-color 120ms ease;
	}

	.nav-link:hover {
		color: var(--color-text);
		background: var(--color-surface);
	}

	.nav-link.active {
		color: var(--color-text);
		background: var(--color-surface);
		border-left-color: var(--color-active);
	}

	.auth-block {
		margin-top: auto;
		padding: 1rem 0.65rem 1.25rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		border-top: 1px solid var(--color-border);
		flex-shrink: 0;
	}

	.email {
		font-size: 0.78rem;
		color: var(--color-text-muted);
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
		border-radius: var(--radius-md);
		padding: 0.6rem 0.85rem;
		border: 1px solid var(--color-border);
		background: var(--color-surface);
		color: var(--color-text);
		font-weight: 500;
		text-align: left;
	}

	.nav-btn:hover {
		background: var(--color-surface-raised);
	}

	.nav-btn.primary {
		background: var(--color-accent-green);
		color: var(--color-surface);
		border-color: var(--color-accent-green);
	}

	.nav-btn.primary:hover {
		background: var(--color-accent-green-hover);
		border-color: var(--color-accent-green-hover);
	}

	/* Desktop: left rail */
	@media (min-width: 768px) {
		.sidebar {
			width: 220px;
			height: 100vh;
			position: sticky;
			top: 0;
			display: flex;
			flex-direction: column;
			overflow: hidden;
			transition: width 200ms ease;
		}

		.sidebar-top {
			padding: 1.25rem 1rem 0.75rem;
			flex-shrink: 0;
		}

		.sidebar-body {
			display: flex;
			flex-direction: column;
			flex: 1;
			min-height: 0;
			overflow-y: auto;
		}

		.collapse-toggle {
			display: flex;
		}

		.backdrop {
			display: none;
		}

		/* Collapsed state */
		.sidebar.collapsed {
			width: 64px;
		}

		.sidebar.collapsed .brand {
			flex: 0 0 auto;
		}

		.sidebar.collapsed .brand-name {
			display: none;
		}

		.sidebar.collapsed .sidebar-top {
			padding: 1rem 0;
			justify-content: center;
			flex-direction: column;
			align-items: center;
			gap: 0.25rem;
		}

		.sidebar.collapsed .collapse-toggle {
			width: 36px;
			height: 36px;
		}

		.sidebar.collapsed .nav-link {
			justify-content: center;
			padding: 0.65rem;
		}

		.sidebar.collapsed .link-label {
			display: none;
		}

		.sidebar.collapsed .nav-btn {
			justify-content: center;
			padding: 0.6rem;
			width: auto;
			align-self: center;
		}

		.sidebar.collapsed .auth-block {
			align-items: center;
			padding: 1rem 0 1.25rem;
		}
	}

	/* Mobile: top bar + drawer */
	@media (max-width: 767px) {
		.sidebar {
			position: sticky;
			top: 0;
			z-index: 100;
			width: 100%;
			background: var(--color-surface-raised);
			border-bottom: 1px solid var(--color-border);
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
			background: var(--color-surface-raised);
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
		border-radius: var(--radius-lg);
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
		color: var(--color-text-muted);
		cursor: pointer;
		padding: 0.25rem;
		border-radius: var(--radius-sm);
	}

	.close-btn:hover {
		color: var(--color-text);
		background: var(--color-surface);
	}

	.tabs {
		display: flex;
		gap: 0;
		border-bottom: 2px solid var(--color-border);
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
		color: var(--color-text-muted);
		cursor: pointer;
	}

	.tab.active {
		color: var(--color-text);
		border-bottom-color: var(--color-primary);
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
		color: var(--color-text-muted);
	}

	.stack input {
		padding: 0.65rem 0.8rem;
		font-size: 1rem;
		border-radius: var(--radius-md);
		border: 1px solid var(--color-border);
		font-family: inherit;
		width: 100%;
		box-sizing: border-box;
	}

	.stack input:focus {
		outline: none;
		border-color: var(--color-primary);
	}

	.submit-btn {
		margin-top: 0.5rem;
		width: 100%;
		background: var(--color-accent-green);
		color: var(--color-surface);
		border: none;
		border-radius: var(--radius-md);
		padding: 0.75rem;
		font-size: 1rem;
		font-weight: 500;
		font-family: inherit;
		cursor: pointer;
	}

	.submit-btn:hover {
		background: var(--color-accent-green-hover);
	}

	.auth-msg {
		margin: 0 0 1rem;
		font-size: 0.875rem;
		color: var(--color-error);
		background: #fff5f5;
		border: 1px solid #fecaca;
		border-radius: var(--radius-md);
		padding: 0.6rem 0.8rem;
	}
</style>
