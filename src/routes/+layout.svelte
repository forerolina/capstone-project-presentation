<script lang="ts">
	import '../app.css';
	import { page } from '$app/state';
	import favicon from '$lib/assets/favicon.svg';
	import AppBackground from '$lib/ui/AppBackground.svelte';
	import BookShaderBackground from '$lib/ui/BookShaderBackground.svelte';

	let { children } = $props();

	const isBookPage = $derived(
		page.url.pathname === '/book' || page.url.pathname.startsWith('/book/')
	);
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:ital,wght@0,300;0,400;0,600;0,800;1,400&display=swap"
		rel="stylesheet"
	/>
	<title>Appointment booking</title>
</svelte:head>

<div class="app-shell" class:app-shell--book={isBookPage}>
	{#if isBookPage}
		<BookShaderBackground />
	{:else}
		<AppBackground />
	{/if}
	<div class="app-shell__content">
		{@render children()}
	</div>
</div>
