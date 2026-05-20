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
		}

		:global(.booking-panel__col) {
			border-right: none;
			border-bottom: var(--ghost-border);
			max-height: 240px;
		}

		:global(.booking-panel__col:last-child) {
			border-bottom: none;
			max-height: none;
		}
	}
</style>
