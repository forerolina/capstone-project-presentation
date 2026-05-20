<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		title,
		tagline,
		borderless = false,
		titleAddon,
		actions,
		children
	}: {
		title: string;
		tagline?: string;
		borderless?: boolean;
		titleAddon?: Snippet;
		actions?: Snippet;
		children?: Snippet;
	} = $props();
</script>

<header class="ui-page-header" class:ui-page-header--borderless={borderless}>
	<div class="ui-page-header__main">
		<div class="ui-page-header__text">
			<div class="ui-page-header__title-row">
				<h1 class="text-headline-md">{title}</h1>
				{#if titleAddon}
					<div class="ui-page-header__title-addon">
						{@render titleAddon()}
					</div>
				{/if}
			</div>
			{#if tagline}
				<p class="ui-page-header__tagline text-muted">{tagline}</p>
			{/if}
		</div>
		{#if actions}
			<div class="ui-page-header__actions">
				{@render actions()}
			</div>
		{/if}
	</div>
	{#if children}
		{@render children()}
	{/if}
</header>

<style>
	.ui-page-header {
		margin-bottom: 2rem;
		padding-bottom: 1.25rem;
		border-bottom: var(--ghost-border);
	}

	.ui-page-header--borderless {
		padding-bottom: 0;
		border-bottom: none;
	}

	.ui-page-header__main {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 1rem 1.5rem;
	}

	.ui-page-header__title-row {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.ui-page-header h1 {
		margin: 0;
		font-size: 1.75rem;
		line-height: 1.2;
	}

	.ui-page-header__title-addon {
		display: flex;
		align-items: center;
		flex-shrink: 0;
	}

	.ui-page-header__text:has(.ui-page-header__tagline) .ui-page-header__title-row {
		margin-bottom: 0.35rem;
	}

	@media (min-width: 48rem) {
		.ui-page-header h1 {
			font-size: var(--text-headline-md-size);
			line-height: var(--text-headline-md-line);
		}
	}

	.ui-page-header__tagline {
		margin: 0;
		font-size: var(--text-body-md-size);
	}

	.ui-page-header__actions {
		flex-shrink: 0;
	}
</style>
