<script lang="ts">
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();
</script>

<div class="booking-panel">
	{@render children()}
</div>

<style>
	.booking-panel {
		display: grid;
		grid-template-columns: minmax(140px, 1fr) minmax(220px, 1.2fr) minmax(200px, 1fr);
		flex: 1;
		min-height: 0;
		overflow: hidden;
	}

	:global(.booking-panel__col) {
		min-height: 0;
		padding: 1rem 1.25rem;
		overflow-y: auto;
		border-right: var(--ghost-border);
	}

	:global(.booking-panel__col:last-child) {
		border-right: none;
	}

	:global(.booking-panel__col-title) {
		margin: 0 0 0.75rem;
		font-size: var(--text-label-md-size);
		font-weight: 700;
		color: var(--color-primary);
	}

	@media (max-width: 768px) {
		.booking-panel {
			grid-template-columns: 1fr;
			overflow: visible;
		}

		:global(.booking-panel__col) {
			border-right: none;
			border-bottom: var(--ghost-border);
			overflow-y: visible;
			min-height: auto;
		}

		:global(.booking-panel__col:last-child) {
			border-bottom: none;
		}
	}
</style>
