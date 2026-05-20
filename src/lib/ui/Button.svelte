<script lang="ts">
	import type { Snippet } from 'svelte';

	type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'ghost';
	type ButtonType = 'button' | 'submit' | 'reset';

	let {
		variant = 'primary',
		type = 'button',
		disabled = false,
		formaction,
		form,
		class: className = '',
		ariaLabel,
		ariaCurrent,
		href,
		children,
		onclick
	}: {
		variant?: ButtonVariant;
		type?: ButtonType;
		disabled?: boolean;
		formaction?: string;
		form?: string;
		class?: string;
		ariaLabel?: string;
		ariaCurrent?: 'page' | 'step' | 'location' | 'date' | 'time' | true | false;
		href?: string;
		children: Snippet;
		onclick?: (e: MouseEvent) => void;
	} = $props();
</script>

{#if href}
	<a
		{href}
		class="ui-btn ui-btn--{variant} {className}"
		class:ui-btn--disabled={disabled}
		aria-label={ariaLabel}
		aria-current={ariaCurrent}
		aria-disabled={disabled ? 'true' : undefined}
		tabindex={disabled ? -1 : undefined}
	>
		{@render children()}
	</a>
{:else}
	<button
		{type}
		{disabled}
		{formaction}
		{form}
		class="ui-btn ui-btn--{variant} {className}"
		aria-label={ariaLabel}
		aria-current={ariaCurrent}
		{onclick}
	>
		{@render children()}
	</button>
{/if}

<style>
	.ui-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.35rem;
		padding: 0.625rem 1.25rem;
		font: inherit;
		font-size: var(--text-label-md-size);
		font-weight: var(--text-label-md-weight);
		line-height: var(--text-label-md-line);
		letter-spacing: var(--text-label-md-tracking);
		border-radius: var(--radius-full);
		border: var(--ghost-border);
		cursor: pointer;
		text-decoration: none;
		transition:
			background 0.15s ease,
			box-shadow 0.15s ease,
			border-color 0.15s ease,
			opacity 0.15s ease;
	}

	.ui-btn:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
	}

	.ui-btn:disabled,
	.ui-btn--disabled {
		opacity: 0.5;
		cursor: not-allowed;
		pointer-events: none;
	}

	.ui-btn--primary {
		background: var(--gradient-primary);
		border-color: transparent;
		color: var(--color-on-primary);
	}

	.ui-btn--primary:hover:not(:disabled) {
		box-shadow: 0 4px 20px rgba(0, 103, 127, 0.35);
		filter: brightness(1.05);
	}

	.ui-btn--secondary,
	.ui-btn--ghost {
		background: var(--glass-bg);
		backdrop-filter: blur(var(--glass-blur-sm));
		color: var(--color-on-surface);
		border: var(--ghost-border);
	}

	.ui-btn--secondary:hover:not(:disabled),
	.ui-btn--ghost:hover:not(:disabled) {
		background: var(--glass-bg-hover);
		border-color: rgba(25, 28, 30, 0.18);
	}

	.ui-btn--tertiary {
		background: transparent;
		border-color: transparent;
		color: var(--color-on-surface);
		padding-inline: 0.5rem;
		letter-spacing: 0.06em;
		text-decoration: none;
	}

	.ui-btn--tertiary:hover:not(:disabled) {
		text-decoration: underline;
		text-underline-offset: 0.2em;
	}

	.ui-btn--ghost {
		padding: 0.35rem 0.75rem;
		font-size: 0.6875rem;
		font-weight: 600;
	}
</style>
