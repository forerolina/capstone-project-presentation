<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		padding = true,
		class: className = '',
		children
	}: {
		padding?: boolean;
		class?: string;
		children: Snippet;
	} = $props();
</script>

<div class="ui-card {className}" class:ui-card--flat={!padding}>
	{@render children()}
</div>

<style>
	.ui-card {
		background: var(--glass-bg);
		backdrop-filter: blur(var(--glass-blur));
		border: var(--ghost-border);
		border-radius: var(--radius-lg);
		box-shadow: 0 8px 32px rgba(0, 103, 127, 0.08);
		overflow: hidden;
	}

	.ui-card--flat {
		padding: 0;
	}
</style>
