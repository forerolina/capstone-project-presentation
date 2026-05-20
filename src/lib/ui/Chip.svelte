<script lang="ts">
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();
</script>

<span class="ui-chip">
	{@render children()}
</span>

<style>
	.ui-chip {
		display: inline-flex;
		align-items: center;
		padding: 0.25rem 0.75rem;
		font-size: 0.75rem;
		font-weight: 600;
		letter-spacing: 0.04em;
		color: var(--color-on-surface);
		background: var(--glass-bg);
		backdrop-filter: blur(var(--glass-blur-sm));
		border: var(--ghost-border);
		border-radius: var(--radius-full);
	}
</style>
