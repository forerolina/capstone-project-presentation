<script lang="ts">
	import type { Snippet } from 'svelte';
	import Button from './Button.svelte';
	import Card from './Card.svelte';

	let {
		open = true,
		title,
		titleId,
		onClose,
		children,
		footer
	}: {
		open?: boolean;
		title: string;
		titleId: string;
		onClose: () => void;
		children: Snippet;
		footer?: Snippet;
	} = $props();

	let dialogEl = $state<HTMLDialogElement | null>(null);

	$effect(() => {
		const el = dialogEl;
		if (!el || !open) return;
		if (!el.open) el.showModal();
		return () => {
			if (el.open) el.close();
		};
	});

	function handleDialogClick(event: MouseEvent) {
		if (event.target === dialogEl) onClose();
	}
</script>

<dialog
	bind:this={dialogEl}
	class="ui-modal"
	aria-labelledby={titleId}
	onclick={handleDialogClick}
	onclose={onClose}
	oncancel={(e) => {
		e.preventDefault();
		onClose();
	}}
>
	<Card padding={false}>
		<header class="ui-modal__header">
			<h2 id={titleId} class="text-body-lg">{title}</h2>
			<Button variant="secondary" type="button" ariaLabel="Close" onclick={onClose}>×</Button>
		</header>

		<div class="ui-modal__body">
			{@render children()}
		</div>

		{#if footer}
			<footer class="ui-modal__footer">
				{@render footer()}
			</footer>
		{/if}
	</Card>
</dialog>

<style>
	.ui-modal {
		max-width: min(960px, calc(100vw - 2rem));
		width: 100%;
		padding: 0;
		border: none;
		background: transparent;
	}

	.ui-modal::backdrop {
		background: var(--backdrop-modal);
	}

	:global(.ui-modal > .ui-card) {
		display: flex;
		flex-direction: column;
		max-height: min(90vh, 720px);
		background: var(--color-surface-container-lowest);
		box-shadow: var(--shadow-modal);
	}

	.ui-modal__header {
		display: flex;
		flex-shrink: 0;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding: 1rem 1.25rem;
		border-bottom: var(--ghost-border);
	}

	.ui-modal__header h2 {
		margin: 0;
		font-weight: 600;
	}

	.ui-modal__body {
		display: flex;
		flex-direction: column;
		flex: 1;
		min-height: 0;
		overflow: hidden;
	}

	.ui-modal__footer {
		display: flex;
		flex-shrink: 0;
		flex-wrap: wrap;
		align-items: center;
		justify-content: flex-end;
		gap: 0.5rem;
		padding: 1rem 1.25rem;
		border-top: var(--ghost-border);
		background: var(--color-surface-container-low);
	}

	@media (max-width: 768px) {
		.ui-modal__body {
			overflow-y: auto;
		}
	}
</style>
