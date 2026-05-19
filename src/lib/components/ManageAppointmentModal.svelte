<script lang="ts">
	import { enhance } from '$app/forms';
	import { toDateInputValue, toTimeInputValue } from '$lib/calendar/datetime';
	import { isSameLocalDay } from '$lib/calendar/week';
	import type { AppointmentRow } from '$lib/components/AppointmentCard.svelte';

	const MS_PER_DAY = 24 * 60 * 60 * 1000;
	const MS_PER_HOUR = 60 * 60 * 1000;
	const CALENDAR_START = 8;
	const CALENDAR_END = 20;

	type FormState = {
		message?: string;
		appointmentId?: string | null;
	} | null;

	type PillVariant = 'confirmed' | 'pending' | 'reminder' | 'cancelled';

	let {
		appointment,
		upcomingAppointments,
		week,
		form = null,
		onClose
	}: {
		appointment: AppointmentRow;
		upcomingAppointments: AppointmentRow[];
		week: string;
		form?: FormState;
		onClose: () => void;
	} = $props();

	let dialogEl = $state<HTMLDialogElement | null>(null);
	let cancelConfirming = $state(false);

	function asDate(value: Date | string): Date {
		return value instanceof Date ? value : new Date(value);
	}

	function initialModalState(appt: AppointmentRow) {
		const start = asDate(appt.startsAt);
		return {
			viewMonth: startOfMonth(start),
			selectedDate: startOfDay(start),
			selectedSlot: start as Date | null
		};
	}

	const initial = initialModalState(appointment);
	let viewMonth = $state(initial.viewMonth);
	let selectedDate = $state(initial.selectedDate);
	let selectedSlot = $state<Date | null>(initial.selectedSlot);

	const startsAt = $derived(asDate(appointment.startsAt));
	const isCancelled = $derived(appointment.status === 'cancelled');

	$effect(() => {
		const el = dialogEl;
		if (!el) return;
		if (!el.open) el.showModal();
		return () => {
			if (el.open) el.close();
		};
	});

	const todayStart = $derived(startOfDay(new Date()));
	const monthLabel = $derived(
		viewMonth.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
	);
	const monthGridDays = $derived(getMonthGridDays(viewMonth));
	const availableSlots = $derived(
		getAvailableSlots(selectedDate, upcomingAppointments, appointment.id)
	);
	const pill = $derived(getPill(appointment));
	const hasChanges = $derived(
		selectedSlot !== null &&
			(!isSameLocalDay(selectedSlot, startsAt) ||
				selectedSlot.getHours() !== startsAt.getHours() ||
				selectedSlot.getMinutes() !== startsAt.getMinutes())
	);
	const canSendReminder = $derived(!isCancelled && !appointment.reminderSentAt);

	$effect(() => {
		selectedDate;
		if (
			selectedSlot &&
			availableSlots.some((s) => s.getTime() === selectedSlot!.getTime())
		) {
			return;
		}
		selectedSlot = availableSlots[0] ?? null;
	});

	function startOfDay(date: Date): Date {
		return new Date(date.getFullYear(), date.getMonth(), date.getDate());
	}

	function startOfMonth(date: Date): Date {
		return new Date(date.getFullYear(), date.getMonth(), 1);
	}

	function addMonths(date: Date, months: number): Date {
		return new Date(date.getFullYear(), date.getMonth() + months, 1);
	}

	function getMonthGridDays(monthStart: Date): Date[] {
		const first = startOfMonth(monthStart);
		const gridStart = new Date(first.getTime() - first.getDay() * MS_PER_DAY);
		return Array.from({ length: 42 }, (_, i) => new Date(gridStart.getTime() + i * MS_PER_DAY));
	}

	function getAvailableSlots(
		day: Date,
		appointments: AppointmentRow[],
		excludeId: string
	): Date[] {
		const slots: Date[] = [];
		const dayStart = startOfDay(day);

		for (let hour = CALENDAR_START; hour < CALENDAR_END; hour++) {
			const slot = new Date(dayStart.getTime() + hour * MS_PER_HOUR);
			const slotEnd = new Date(slot.getTime() + MS_PER_HOUR);
			const hasConflict = appointments.some((appt) => {
				if (appt.id === excludeId || appt.status !== 'upcoming') return false;
				const apptStart = asDate(appt.startsAt);
				const apptEnd = new Date(apptStart.getTime() + MS_PER_HOUR);
				return apptStart < slotEnd && apptEnd > slot;
			});
			if (!hasConflict) slots.push(slot);
		}

		return slots;
	}

	function getPill(appt: AppointmentRow): { label: string; variant: PillVariant } {
		if (appt.status === 'cancelled') return { label: 'Cancelled', variant: 'cancelled' };
		if (appt.reminderSentAt) return { label: 'Pending confirmation', variant: 'pending' };
		if (appt.isConfirmed) return { label: 'Confirmed', variant: 'confirmed' };
		return { label: 'Needs reminder', variant: 'reminder' };
	}

	function formatSlotTime(slot: Date): string {
		return slot.toLocaleTimeString(undefined, { timeStyle: 'short' });
	}

	function formatSchedule(value: Date): string {
		return value.toLocaleString(undefined, { dateStyle: 'full', timeStyle: 'short' });
	}

	function isPastDay(day: Date): boolean {
		return startOfDay(day).getTime() < todayStart.getTime();
	}

	function isCurrentMonth(day: Date): boolean {
		return day.getMonth() === viewMonth.getMonth();
	}

	function selectDay(day: Date) {
		if (isPastDay(day)) return;
		selectedDate = startOfDay(day);
	}

	function selectSlot(slot: Date) {
		selectedSlot = slot;
	}

	function close() {
		onClose();
	}

	function handleDialogClick(event: MouseEvent) {
		if (event.target === dialogEl) close();
	}
</script>

<dialog
	bind:this={dialogEl}
	class="manage-modal"
	aria-labelledby="manage-modal-title"
	onclick={handleDialogClick}
	onclose={close}
	oncancel={(e) => {
		e.preventDefault();
		close();
	}}
>
	<div class="manage-modal__inner">
		<header class="manage-modal__header">
			<h2 id="manage-modal-title">Manage appointment</h2>
			<button type="button" class="manage-modal__close secondary" onclick={close} aria-label="Close">
				×
			</button>
		</header>

		<div class="manage-modal__columns">
			<section class="manage-modal__column manage-modal__column--client" aria-label="Client details">
				<h3 class="manage-modal__column-title">{appointment.clientName}</h3>
				<p class="manage-client-service">{appointment.serviceName}</p>

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
						<dd>{formatSchedule(startsAt)}</dd>
					</div>
				</dl>

				<p class="manage-client-status">
					<span class="status-pill status-pill--{pill.variant}">{pill.label}</span>
				</p>

				{#if !isCancelled}
					<form method="post" action="?/sendReminder" use:enhance class="manage-client-actions">
						<input type="hidden" name="appointmentId" value={appointment.id} />
						<input type="hidden" name="week" value={week} />
						<button type="submit" class="button" disabled={!canSendReminder}>
							{appointment.reminderSentAt ? 'Reminder sent' : 'Send reminder'}
						</button>
					</form>

					{#if cancelConfirming}
						<div class="manage-cancel-confirm" role="alert">
							<p>Cancel this appointment? This cannot be undone.</p>
							<form method="post" action="?/cancel" use:enhance class="manage-cancel-confirm-actions">
								<input type="hidden" name="appointmentId" value={appointment.id} />
								<input type="hidden" name="week" value={week} />
								<button type="submit">Yes, cancel</button>
								<button type="button" class="secondary" onclick={() => (cancelConfirming = false)}>
									Keep appointment
								</button>
							</form>
						</div>
					{:else}
						<button
							type="button"
							class="secondary manage-cancel-trigger"
							onclick={() => (cancelConfirming = true)}
						>
							Cancel appointment
						</button>
					{/if}
				{/if}
			</section>

			<section class="manage-modal__column manage-modal__column--calendar" aria-label="Select date">
				<h3 class="manage-modal__column-title">Select a date</h3>
				<div class="month-nav">
					<button
						type="button"
						class="month-nav__btn"
						aria-label="Previous month"
						onclick={() => (viewMonth = addMonths(viewMonth, -1))}
					>
						&lt;
					</button>
					<p class="month-nav__label">{monthLabel}</p>
					<button
						type="button"
						class="month-nav__btn"
						aria-label="Next month"
						onclick={() => (viewMonth = addMonths(viewMonth, 1))}
					>
						&gt;
					</button>
				</div>
				<div class="month-weekdays" aria-hidden="true">
					{#each ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as label}
						<span class="month-weekday">{label}</span>
					{/each}
				</div>
				<div class="month-grid" role="grid">
					{#each monthGridDays as day (day.getTime())}
						{@const inMonth = isCurrentMonth(day)}
						{@const past = isPastDay(day)}
						{@const selected = isSameLocalDay(day, selectedDate)}
						{@const today = isSameLocalDay(day, new Date())}
						<button
							type="button"
							role="gridcell"
							class="month-day"
							class:month-day--outside={!inMonth}
							class:month-day--past={past}
							class:month-day--selected={selected}
							class:month-day--today={today}
							disabled={past}
							aria-label={day.toLocaleDateString()}
							aria-selected={selected}
							onclick={() => selectDay(day)}
						>
							{day.getDate()}
						</button>
					{/each}
				</div>
			</section>

			<section class="manage-modal__column manage-modal__column--slots" aria-label="Available times">
				<h3 class="manage-modal__column-title">
					{selectedDate.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
				</h3>
				<ul class="slot-list">
					{#each availableSlots as slot (slot.getTime())}
						<li>
							<button
								type="button"
								class="slot-button"
								class:slot-button--selected={selectedSlot?.getTime() === slot.getTime()}
								onclick={() => selectSlot(slot)}
							>
								{formatSlotTime(slot)}
							</button>
						</li>
					{:else}
						<li class="slot-list__empty">No open times on this day.</li>
					{/each}
				</ul>
			</section>
		</div>

		{#if !isCancelled && hasChanges && selectedSlot}
			<footer class="manage-modal__footer">
				{#if form?.appointmentId === appointment.id && form?.message}
					<p class="field-error" role="alert">{form.message}</p>
				{/if}
				<form
					method="post"
					action="?/reschedule"
					class="manage-modal__save"
					use:enhance={() => {
						return async ({ result, update }) => {
							await update();
							if (result.type === 'redirect') close();
						};
					}}
				>
					<input type="hidden" name="appointmentId" value={appointment.id} />
					<input type="hidden" name="week" value={week} />
					<input type="hidden" name="appointmentDate" value={toDateInputValue(selectedSlot)} />
					<input type="hidden" name="appointmentTime" value={toTimeInputValue(selectedSlot)} />
					<button type="submit" class="button">Save changes</button>
				</form>
				<button type="button" class="secondary manage-modal__discard" onclick={close}>Discard</button>
			</footer>
		{/if}
	</div>
</dialog>
