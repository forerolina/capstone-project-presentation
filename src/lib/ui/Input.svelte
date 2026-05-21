<script lang="ts">
	import type { HTMLInputAttributes, HTMLSelectAttributes } from 'svelte/elements';

	type ControlType = 'input' | 'select';

	let {
		type = 'input',
		id,
		name,
		inputType = 'text',
		required = false,
		autocomplete,
		value = $bindable(''),
		invalid = false,
		describedBy,
		selectProps,
		children
	}: {
		type?: ControlType;
		id: string;
		name?: string;
		inputType?: HTMLInputAttributes['type'];
		required?: boolean;
		autocomplete?: HTMLInputAttributes['autocomplete'];
		value?: string | undefined;
		invalid?: boolean;
		describedBy?: string;
		selectProps?: HTMLSelectAttributes;
		children?: import('svelte').Snippet;
	} = $props();
</script>

<div class="ui-input-wrap" class:ui-input-wrap--invalid={invalid}>
	{#if type === 'select'}
		<select
			{id}
			{name}
			{required}
			bind:value
			aria-invalid={invalid ? 'true' : undefined}
			aria-describedby={describedBy}
			{...selectProps}
		>
			{@render children?.()}
		</select>
	{:else}
		<input
			{id}
			{name}
			type={inputType}
			{required}
			{autocomplete}
			bind:value
			aria-invalid={invalid ? 'true' : undefined}
			aria-describedby={describedBy}
		/>
	{/if}
</div>

<style>
	.ui-input-wrap {
		width: 100%;
	}

	.ui-input-wrap input,
	.ui-input-wrap select {
		width: 100%;
		padding: 0.625rem 1rem;
		font: inherit;
		font-size: var(--text-body-md-size);
		color: var(--color-on-surface);
		border: var(--ghost-border);
		border-radius: var(--radius-full);
		transition:
			box-shadow 0.15s ease,
			border-color 0.15s ease,
			background 0.15s ease;
	}

	.ui-input-wrap input {
		background: var(--glass-bg);
		backdrop-filter: blur(var(--glass-blur-sm));
	}

	.ui-input-wrap select {
		appearance: none;
		-webkit-appearance: none;
		padding-right: 2.75rem;
		cursor: pointer;
		background-color: var(--glass-bg);
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236c797f' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
		background-repeat: no-repeat;
		background-position: right 1.125rem center;
		background-size: 0.75rem;
		backdrop-filter: blur(var(--glass-blur-sm));
	}

	.ui-input-wrap input:focus {
		outline: none;
		box-shadow: var(--focus-ring);
		border-color: rgba(0, 103, 127, 0.35);
		background: var(--glass-bg-hover);
	}

	.ui-input-wrap select:focus {
		outline: none;
		box-shadow: var(--focus-ring);
		border-color: rgba(0, 103, 127, 0.35);
		background-color: var(--glass-bg-hover);
	}

	.ui-input-wrap--invalid input,
	.ui-input-wrap--invalid select {
		border-color: var(--color-error);
	}
</style>
