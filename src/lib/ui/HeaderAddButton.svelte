<script lang="ts">
	let {
		label,
		onclick
	}: {
		label: string;
		onclick: () => void;
	} = $props();
</script>

<button type="button" class="ui-header-add" aria-label={label} {onclick}>
	<span class="ui-header-add__icon" aria-hidden="true">+</span>
	<span class="ui-header-add__label">{label}</span>
</button>

<style>
	.ui-header-add {
		position: relative;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		width: 2.25rem;
		height: 2.25rem;
		padding: 0;
		border: none;
		border-radius: var(--radius-full);
		background: var(--gradient-primary);
		color: var(--color-on-primary);
		font: inherit;
		cursor: pointer;
		box-shadow: 0 2px 12px rgba(0, 103, 127, 0.25);
	}

	.ui-header-add:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
	}

	.ui-header-add:hover {
		filter: brightness(1.05);
	}

	.ui-header-add__icon {
		font-size: 1.375rem;
		font-weight: 300;
		line-height: 1;
	}

	.ui-header-add__label {
		position: absolute;
		top: calc(100% + 0.4rem);
		left: 50%;
		z-index: 1;
		padding: 0.35rem 0.55rem;
		border-radius: var(--radius-sm);
		background: var(--color-inverse-surface);
		color: var(--color-inverse-on-surface);
		font-size: 0.8125rem;
		font-weight: 500;
		line-height: 1.2;
		white-space: nowrap;
		pointer-events: none;
		opacity: 0;
		transform: translateX(-50%) translateY(-2px);
		transition:
			opacity 0.15s ease,
			transform 0.15s ease;
	}

	.ui-header-add:hover .ui-header-add__label,
	.ui-header-add:focus-visible .ui-header-add__label {
		opacity: 1;
		transform: translateX(-50%) translateY(0);
	}

	@media (max-width: 48rem) {
		.ui-header-add__label {
			display: none;
		}
	}
</style>
