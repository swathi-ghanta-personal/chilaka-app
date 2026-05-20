<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import SiteNav from '$lib/components/SiteNav.svelte';
	import type { ActionData, LayoutData } from './$types';

	let {
		data,
		form,
		children
	}: { data: LayoutData; form?: ActionData; children: import('svelte').Snippet } = $props();

	const authMessage = $derived.by(() =>
		form && typeof form === 'object' && 'message' in form ? String(form.message ?? '') : ''
	);
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="app-shell">
	<SiteNav user={data.user} isAnonymous={data.isAnonymous} {authMessage} />
	<div class="app-main">
		{@render children()}
	</div>
</div>

<style>
	.app-shell {
		display: flex;
		min-height: 100vh;
		font-family:
			ui-sans-serif,
			system-ui,
			-apple-system,
			'Segoe UI',
			Roboto,
			sans-serif;
	}

	.app-main {
		flex: 1;
		min-width: 0;
	}

	@media (max-width: 767px) {
		.app-shell {
			flex-direction: column;
		}
	}
</style>
