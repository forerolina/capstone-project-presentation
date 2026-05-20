<script lang="ts">
	import Input from './Input.svelte';
	import type { Snippet } from 'svelte';

	let {
		label,
		id,
		name,
		inputType = 'text',
		required = false,
		optional = false,
		autocomplete,
		error,
		control = 'input',
		children
	}: {
		label: string;
		id: string;
		name?: string;
		inputType?: string;
		required?: boolean;
		optional?: boolean;
		autocomplete?: import('svelte/elements').HTMLInputAttributes['autocomplete'];
		error?: string | string[];
		control?: 'input' | 'select';
		children?: Snippet;
	} = $props();

	const errorId = $derived(`${id}-error`);
	const errorText = $derived(error ? (Array.isArray(error) ? error.join(', ') : error) : undefined);
	const hasError = $derived(Boolean(errorText));
</script>

<div class="ui-field">
	<label class="text-label-md" for={id}>
		{label}
		{#if optional}
			<span class="ui-field__optional text-muted">(optional)</span>
		{/if}
	</label>

	{#if control === 'select'}
		<Input
			type="select"
			{id}
			{name}
			{required}
			invalid={hasError}
			describedBy={hasError ? errorId : undefined}
		>
			{@render children?.()}
		</Input>
	{:else}
		<Input
			{id}
			{name}
			inputType={inputType as 'text'}
			{required}
			{autocomplete}
			invalid={hasError}
			describedBy={hasError ? errorId : undefined}
		/>
	{/if}

	{#if errorText}
		<p id={errorId} class="ui-field__error" role="alert">{errorText}</p>
	{/if}
</div>

<style>
	.ui-field {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
	}

	.ui-field__optional {
		font-weight: 400;
	}

	.ui-field__error {
		margin: 0;
		padding-left: 0.75rem;
		font-size: var(--text-label-md-size);
		font-weight: 500;
		color: var(--color-on-error-container);
		border-left: 2px solid var(--color-error);
	}
</style>
