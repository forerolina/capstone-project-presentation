<script lang="ts">
	import { enhance } from '$app/forms';
	import {
		formatDurationMinutes,
		SERVICE_DURATION_PRESETS
	} from '$lib/booking/service-catalog';
	import type { ServiceFieldErrors } from '$lib/server/service/schema';
	import { Button, Field, Modal } from '$lib/ui';

	let {
		mode,
		serviceId = '',
		name = '',
		durationMinutes,
		fieldErrors = {},
		message = null,
		onClose
	}: {
		mode: 'create' | 'edit';
		serviceId?: string;
		name?: string;
		durationMinutes?: number | null;
		fieldErrors?: ServiceFieldErrors;
		message?: string | null;
		onClose: () => void;
	} = $props();

	const isEdit = $derived(mode === 'edit');
	const title = $derived(isEdit ? 'Edit service' : 'Add service');
	const titleId = $derived(isEdit ? 'edit-service-title' : 'create-service-title');
	const formId = $derived(isEdit ? 'edit-service-form' : 'create-service-form');
	const formAction = $derived(isEdit ? '?/updateService' : '?/createService');
	const durationValue = $derived(
		durationMinutes != null && durationMinutes > 0 ? String(durationMinutes) : ''
	);
</script>

<Modal {title} {titleId} {onClose}>
	{#key `${mode}-${serviceId}-${name}-${durationMinutes}`}
		<form
			id={formId}
			method="post"
			action={formAction}
			class="service-modal__form"
			use:enhance={() => {
				return async ({ result, update }) => {
					await update();
					if (result.type === 'success') onClose();
				};
			}}
		>
			{#if isEdit}
				<input type="hidden" name="serviceId" value={serviceId} />
			{/if}

			<Field
				label="Name"
				id="{formId}-name"
				name="name"
				value={name}
				required
				error={fieldErrors.name}
			/>

			<Field
				label="Duration"
				id="{formId}-duration"
				name="durationMinutes"
				control="select"
				value={durationValue}
				required
				error={fieldErrors.durationMinutes}
			>
				{#if !isEdit}
					<option value="" disabled selected={durationValue === ''}>Select…</option>
				{/if}
				{#each SERVICE_DURATION_PRESETS as minutes (minutes)}
					<option value={minutes}>{formatDurationMinutes(minutes)}</option>
				{/each}
			</Field>
		</form>
	{/key}

	{#snippet footer()}
		{#if message}
			<p class="ui-form-message" role="alert">{message}</p>
		{/if}
		<Button variant="primary" type="submit" form={formId}>Save</Button>
		<Button variant="secondary" type="button" onclick={onClose}>Cancel</Button>
	{/snippet}
</Modal>

<style>
	.service-modal__form {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		padding: 1rem 1.25rem;
		overflow-y: auto;
	}

	:global(.ui-modal__footer .ui-form-message) {
		flex: 1 1 100%;
		margin: 0 0 0.5rem;
		text-align: left;
		font-size: var(--text-label-md-size);
		color: var(--color-on-error-container);
	}
</style>
