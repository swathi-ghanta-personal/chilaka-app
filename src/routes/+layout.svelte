<script lang="ts">
	import '../app.css';
	import parrot from '$lib/assets/parrot.png';
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
	<link rel="icon" href={parrot} />
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
