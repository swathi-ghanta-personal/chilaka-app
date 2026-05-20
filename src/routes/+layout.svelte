<script lang="ts">
	import '../app.css';
	import parrot from '$lib/assets/parrot.png';
	import SiteNav from '$lib/components/SiteNav.svelte';
	import Toast from '$lib/components/Toast.svelte';
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
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=Pacifico&family=Nunito:wght@400;500;600;700&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<div class="app-shell">
	<SiteNav user={data.user} isAnonymous={data.isAnonymous} {authMessage} />
	<div class="app-main">
		{@render children()}
	</div>
</div>

<Toast />

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
