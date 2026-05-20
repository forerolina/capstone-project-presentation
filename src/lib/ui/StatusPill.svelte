<script lang="ts">
	import type { DisplayStatusVariant } from '$lib/appointment/display-status';

	let {
		label,
		variant,
		size = 'sm'
	}: {
		label: string;
		variant: DisplayStatusVariant;
		size?: 'sm' | 'md';
	} = $props();
</script>

<span class="ui-status ui-status--{variant} ui-status--{size}">
	{label}
</span>

<style>
	.ui-status {
		display: inline-flex;
		align-items: center;
		flex-shrink: 0;
		padding: 1px 6px;
		border-radius: var(--radius-full);
		font-size: 0.5625rem;
		font-weight: 600;
		white-space: nowrap;
		line-height: 1.4;
	}

	.ui-status--md {
		font-size: 0.8125rem;
		padding: 0.2rem 0.625rem;
		line-height: 1.35;
	}

	.ui-status--scheduled {
		background: var(--color-surface-container);
		color: var(--color-on-surface-variant);
	}

	.ui-status--confirmed {
		background: var(--color-tertiary-fixed);
		color: var(--color-on-tertiary-container);
	}

	.ui-status--pending {
		background: var(--color-primary-fixed);
		color: var(--color-on-primary-container);
	}

	.ui-status--reminder {
		background: var(--color-secondary-fixed);
		color: var(--color-on-secondary-container);
	}

	.ui-status--cancelled {
		background: var(--color-surface-container-high);
		color: var(--color-outline);
	}
</style>
