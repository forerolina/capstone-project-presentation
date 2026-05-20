<script lang="ts">
	import { enhance } from '$app/forms';
	import AppointmentBookingFields from '$lib/components/AppointmentBookingFields.svelte';
	import type { AppointmentRow } from '$lib/components/AppointmentCard.svelte';
	import type { BookingFieldErrors } from '$lib/server/booking/schema';
	import { Button, Modal } from '$lib/ui';

	type CreateFormState = {
		createForm?: boolean;
		message?: string;
		fieldErrors?: BookingFieldErrors;
	} | null;

	let {
		upcomingAppointments,
		services,
		week,
		businessTimezone,
		form = null,
		onClose
	}: {
		upcomingAppointments: AppointmentRow[];
		services: string[];
		week: string;
		businessTimezone: string;
		form?: CreateFormState;
		onClose: () => void;
	} = $props();

	let selectedSlot = $state<Date | null>(null);

	const showFormError = $derived(form?.createForm && form?.message);
	const fieldErrors = $derived(form?.createForm ? (form?.fieldErrors ?? {}) : {});
</script>

<Modal title="Create appointment" titleId="create-modal-title" {onClose}>
	<form
		id="create-modal-form"
		method="post"
		action="?/create"
		class="create-modal__form"
		use:enhance={() => {
			return async ({ result, update }) => {
				await update();
				if (result.type === 'redirect') onClose();
			};
		}}
	>
		<AppointmentBookingFields
			idPrefix="create"
			{upcomingAppointments}
			{services}
			{businessTimezone}
			{fieldErrors}
			bind:selectedSlot
		/>

		<input type="hidden" name="week" value={week} />
	</form>

	{#snippet footer()}
		{#if showFormError}
			<p class="ui-form-message" role="alert">{form?.message}</p>
		{/if}
		<Button variant="primary" type="submit" form="create-modal-form" disabled={!selectedSlot}>
			Create appointment
		</Button>
		<Button variant="secondary" type="button" onclick={onClose}>Cancel</Button>
	{/snippet}
</Modal>

<style>
	.create-modal__form {
		display: flex;
		flex-direction: column;
		flex: 1;
		min-height: 0;
	}

	:global(.ui-modal__footer .ui-form-message) {
		flex: 1 1 100%;
		margin: 0 0 0.5rem;
		text-align: left;
		font-size: var(--text-label-md-size);
		color: var(--color-on-error-container);
	}
</style>
