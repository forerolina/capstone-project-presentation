<script lang="ts">
	import { enhance } from '$app/forms';
	import {
		dateKeyFromDate,
		dateToWallClock,
		formatDateTimeInZone,
		toDateInputValue,
		toTimeInputValue,
		wallClockToDate,
		type DateKey
	} from '$lib/calendar/datetime';
	import { getAppointmentDisplayStatus } from '$lib/appointment/display-status';
	import {
		asDate,
		getAvailableSlots,
		getMonthGridDayKeys,
		monthStartKey,
		shiftMonthKey,
		todayKeyInZone
	} from '$lib/booking/slots-ui';
	import type { AppointmentRow } from '$lib/components/AppointmentCard.svelte';
	import { BookingPanel, Button, Modal, MonthPicker, SlotPicker, StatusPill } from '$lib/ui';

	type FormState = {
		message?: string;
		appointmentId?: string | null;
	} | null;

	let {
		appointment,
		upcomingAppointments,
		week,
		businessTimezone,
		form = null,
		onClose
	}: {
		appointment: AppointmentRow;
		upcomingAppointments: AppointmentRow[];
		week: string;
		businessTimezone: string;
		form?: FormState;
		onClose: () => void;
	} = $props();

	let cancelConfirming = $state(false);

	function initialModalState(appt: AppointmentRow) {
		const start = asDate(appt.startsAt);
		const selectedDateKey = dateKeyFromDate(start, businessTimezone);
		return {
			viewMonthKey: monthStartKey(selectedDateKey),
			selectedDateKey,
			selectedSlot: start as Date | null
		};
	}

	const initial = initialModalState(appointment);
	let viewMonthKey = $state(initial.viewMonthKey);
	let selectedDateKey = $state(initial.selectedDateKey);
	let selectedSlot = $state<Date | null>(initial.selectedSlot);

	const startsAt = $derived(asDate(appointment.startsAt));
	const isCancelled = $derived(appointment.status === 'cancelled');
	const todayKey = $derived(todayKeyInZone(businessTimezone));

	const monthLabel = $derived(
		wallClockToDate(viewMonthKey, '12:00', businessTimezone).toLocaleDateString(undefined, {
			timeZone: businessTimezone,
			month: 'long',
			year: 'numeric'
		})
	);
	const monthGridDayKeys = $derived(getMonthGridDayKeys(viewMonthKey));
	const availableSlots = $derived(
		getAvailableSlots(selectedDateKey, upcomingAppointments, businessTimezone, appointment.id)
	);
	const pill = $derived(getAppointmentDisplayStatus(appointment));
	const hasChanges = $derived(
		selectedSlot !== null &&
			(() => {
				const current = dateToWallClock(startsAt, businessTimezone);
				const next = dateToWallClock(selectedSlot!, businessTimezone);
				return current.date !== next.date || current.time !== next.time;
			})()
	);
	const canSendReminder = $derived(pill.variant === 'reminder');

	const selectedDayLabel = $derived(
		wallClockToDate(selectedDateKey, '12:00', businessTimezone).toLocaleDateString(undefined, {
			timeZone: businessTimezone,
			weekday: 'long',
			month: 'short',
			day: 'numeric'
		})
	);

	$effect(() => {
		selectedDateKey;
		if (selectedSlot && availableSlots.some((s) => s.getTime() === selectedSlot!.getTime())) {
			return;
		}
		selectedSlot = availableSlots[0] ?? null;
	});

	function discardChanges() {
		if (!hasChanges) {
			onClose();
			return;
		}
		const reset = initialModalState(appointment);
		viewMonthKey = reset.viewMonthKey;
		selectedDateKey = reset.selectedDateKey;
		selectedSlot = reset.selectedSlot;
	}

	const formMessage = $derived(
		form?.appointmentId === appointment.id && form?.message ? form.message : undefined
	);
</script>

<Modal title="Manage appointment" titleId="manage-modal-title" {onClose}>
	<BookingPanel>
		<section class="booking-panel__col" aria-label="Client details">
			<h3 class="booking-panel__col-title">{appointment.clientName}</h3>
			<p class="manage-client-service text-muted">{appointment.serviceName}</p>

			<dl class="manage-client-details">
				<div>
					<dt>Email</dt>
					<dd><a href="mailto:{appointment.clientEmail}">{appointment.clientEmail}</a></dd>
				</div>
				{#if appointment.clientPhone}
					<div>
						<dt>Phone</dt>
						<dd><a href="tel:{appointment.clientPhone}">{appointment.clientPhone}</a></dd>
					</div>
				{/if}
				<div>
					<dt>Scheduled</dt>
					<dd>{formatDateTimeInZone(startsAt, businessTimezone)}</dd>
				</div>
				<div>
					<dt>Status</dt>
					<dd>
						<StatusPill label={pill.label} variant={pill.variant} size="md" />
					</dd>
				</div>
			</dl>

			{#if !isCancelled}
				<div class="manage-client-actions">
					{#if canSendReminder}
						<form method="post" action="?/sendReminder" use:enhance>
							<input type="hidden" name="appointmentId" value={appointment.id} />
							<input type="hidden" name="week" value={week} />
							<Button variant="primary" type="submit">Send reminder</Button>
						</form>
					{:else}
						<Button variant="secondary" type="button" disabled>
							{pill.variant === 'scheduled' ? 'Send reminder' : 'Reminder sent'}
						</Button>
					{/if}

					{#if cancelConfirming}
						<div class="manage-cancel-confirm" role="alert">
							<p>Cancel this appointment? This cannot be undone.</p>
							<div class="manage-cancel-confirm-actions">
								<form method="post" action="?/cancel" use:enhance>
									<input type="hidden" name="appointmentId" value={appointment.id} />
									<input type="hidden" name="week" value={week} />
									<Button variant="primary" type="submit">Yes, cancel</Button>
								</form>
								<Button variant="secondary" type="button" onclick={() => (cancelConfirming = false)}>
									Keep appointment
								</Button>
							</div>
						</div>
					{:else}
						<Button
							variant="secondary"
							type="button"
							onclick={() => (cancelConfirming = true)}
						>
							Cancel appointment
						</Button>
					{/if}
				</div>
			{/if}
		</section>

		<section class="booking-panel__col" aria-label="Select date">
			<h3 class="booking-panel__col-title">Select a date</h3>
			<MonthPicker
				bind:viewMonthKey
				bind:selectedDateKey
				{businessTimezone}
				{todayKey}
				{monthGridDayKeys}
				{monthLabel}
				onShiftMonth={(m) => (viewMonthKey = shiftMonthKey(viewMonthKey, m))}
			/>
		</section>

		<section class="booking-panel__col" aria-label="Available times">
			<SlotPicker
				slots={availableSlots}
				bind:selectedSlot
				{businessTimezone}
				dayLabel={selectedDayLabel}
			/>
		</section>
	</BookingPanel>

	{#snippet footer()}
		{#if formMessage}
			<p class="ui-form-message" role="alert">{formMessage}</p>
		{/if}
		{#if selectedSlot}
			<form
				method="post"
				action="?/reschedule"
				class="manage-modal__save"
				use:enhance={() => {
					return async ({ result, update }) => {
						await update();
						if (result.type === 'redirect') onClose();
					};
				}}
			>
				<input type="hidden" name="appointmentId" value={appointment.id} />
				<input type="hidden" name="week" value={week} />
				<input
					type="hidden"
					name="appointmentDate"
					value={toDateInputValue(selectedSlot, businessTimezone)}
				/>
				<input
					type="hidden"
					name="appointmentTime"
					value={toTimeInputValue(selectedSlot, businessTimezone)}
				/>
				<Button variant="primary" type="submit" disabled={!hasChanges}>Save changes</Button>
			</form>
		{/if}
		<Button variant="secondary" type="button" onclick={discardChanges}>Discard</Button>
	{/snippet}
</Modal>

<style>
	.manage-client-service {
		margin: 0 0 1rem;
		font-size: var(--text-body-md-size);
	}

	.manage-client-details {
		margin: 0 0 1rem;
		font-size: 0.8125rem;
	}

	.manage-client-details div {
		margin-bottom: 0.5rem;
	}

	.manage-client-details dt {
		font-weight: 600;
		color: var(--color-on-surface-variant);
		font-size: 0.6875rem;
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	.manage-client-details dd {
		margin: 0.15rem 0 0;
	}

	.manage-client-actions {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		margin-top: 1rem;
	}

	.manage-client-actions :global(form),
	.manage-client-actions :global(.ui-btn) {
		width: 100%;
	}

	.manage-cancel-confirm {
		padding: 0.75rem;
		border: var(--ghost-border);
		border-radius: var(--radius-default);
		font-size: 0.8125rem;
		background: var(--color-error-container);
	}

	.manage-cancel-confirm p {
		margin: 0 0 0.5rem;
		color: var(--color-on-error-container);
	}

	.manage-cancel-confirm-actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.manage-modal__save {
		display: inline-flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		align-items: center;
		margin: 0;
	}

	:global(.ui-modal__footer .ui-form-message) {
		flex: 1 1 100%;
		margin: 0 0 0.5rem;
		text-align: left;
		font-size: var(--text-label-md-size);
		color: var(--color-on-error-container);
	}
</style>
