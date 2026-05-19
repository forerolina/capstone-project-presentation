<script lang="ts">
	import { enhance } from '$app/forms';
	import AppointmentBookingFields from '$lib/components/AppointmentBookingFields.svelte';
	import type { AppointmentRow } from '$lib/components/AppointmentCard.svelte';
	import type { BookingFieldErrors } from '$lib/server/booking/schema';

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

	let dialogEl = $state<HTMLDialogElement | null>(null);
	let selectedSlot = $state<Date | null>(null);

	$effect(() => {
		const el = dialogEl;
		if (!el) return;
		if (!el.open) el.showModal();
		return () => {
			if (el.open) el.close();
		};
	});

	function close() {
		onClose();
	}

	function handleDialogClick(event: MouseEvent) {
		if (event.target === dialogEl) close();
	}

	const showFormError = $derived(form?.createForm && form?.message);
	const fieldErrors = $derived(form?.createForm ? (form?.fieldErrors ?? {}) : {});
</script>

<dialog
	bind:this={dialogEl}
	class="manage-modal"
	aria-labelledby="create-modal-title"
	onclick={handleDialogClick}
	onclose={close}
	oncancel={(e) => {
		e.preventDefault();
		close();
	}}
>
	<div class="manage-modal__inner">
		<header class="manage-modal__header">
			<h2 id="create-modal-title">Create appointment</h2>
			<button type="button" class="manage-modal__close secondary" onclick={close} aria-label="Close">
				×
			</button>
		</header>

		<form
			method="post"
			action="?/create"
			class="create-modal__form"
			use:enhance={() => {
				return async ({ result, update }) => {
					await update();
					if (result.type === 'redirect') close();
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

			<footer class="manage-modal__footer">
				{#if showFormError}
					<p class="field-error" role="alert">{form?.message}</p>
				{/if}
				<div class="manage-modal__save">
					<button type="submit" class="button" disabled={!selectedSlot}>Create appointment</button>
					<button type="button" class="secondary manage-modal__discard" onclick={close}>
						Cancel
					</button>
				</div>
			</footer>
		</form>
	</div>
</dialog>
