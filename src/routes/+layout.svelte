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

<SiteNav user={data.user} isAnonymous={data.isAnonymous} {authMessage} />

{@render children()}
