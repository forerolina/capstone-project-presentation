<script lang="ts">
	import { enhance } from '$app/forms';
	import {
		addDaysToDateKey,
		dateKeyFromDate,
		dateToWallClock,
		formatDateTimeInZone,
		formatTimeInZone,
		toDateInputValue,
		toTimeInputValue,
		wallClockToDate,
		type DateKey
	} from '$lib/calendar/datetime';
	import { weekdayFromDateKey } from '$lib/calendar/week';
	import { getAppointmentDisplayStatus } from '$lib/appointment/display-status';
	import type { AppointmentRow } from '$lib/components/AppointmentCard.svelte';

	const MS_PER_HOUR = 60 * 60 * 1000;
	const CALENDAR_START = 8;
	const CALENDAR_END = 20;

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

	let dialogEl = $state<HTMLDialogElement | null>(null);
	let cancelConfirming = $state(false);

	function asDate(value: Date | string): Date {
		return value instanceof Date ? value : new Date(value);
	}

	function monthStartKey(dateKey: DateKey): DateKey {
		return `${dateKey.slice(0, 7)}-01`;
	}

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
	const todayKey = $derived(dateKeyFromDate(new Date(), businessTimezone));

	$effect(() => {
		const el = dialogEl;
		if (!el) return;
		if (!el.open) el.showModal();
		return () => {
			if (el.open) el.close();
		};
	});

	const monthLabel = $derived(
		wallClockToDate(viewMonthKey, '12:00', businessTimezone).toLocaleDateString(undefined, {
			timeZone: businessTimezone,
			month: 'long',
			year: 'numeric'
		})
	);
	const monthGridDayKeys = $derived(getMonthGridDayKeys(viewMonthKey));
	const availableSlots = $derived(
		getAvailableSlots(selectedDateKey, upcomingAppointments, appointment.id)
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

	$effect(() => {
		selectedDateKey;
		if (
			selectedSlot &&
			availableSlots.some((s) => s.getTime() === selectedSlot!.getTime())
		) {
			return;
		}
		selectedSlot = availableSlots[0] ?? null;
	});

	function getMonthGridDayKeys(monthKey: DateKey): DateKey[] {
		const firstWeekday = weekdayFromDateKey(monthKey);
		const gridStart = addDaysToDateKey(monthKey, -firstWeekday);
		return Array.from({ length: 42 }, (_, i) => addDaysToDateKey(gridStart, i));
	}

	function getAvailableSlots(
		dayKey: DateKey,
		appointments: AppointmentRow[],
		excludeId: string
	): Date[] {
		const now = new Date();
		const slots: Date[] = [];

		for (let hour = CALENDAR_START; hour < CALENDAR_END; hour++) {
			const time = `${String(hour).padStart(2, '0')}:00`;
			const slot = wallClockToDate(dayKey, time, businessTimezone);
			if (slot <= now) continue;

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

	function isPastDay(dayKey: DateKey): boolean {
		return dayKey < todayKey;
	}

	function isCurrentMonth(dayKey: DateKey): boolean {
		return dayKey.slice(0, 7) === viewMonthKey.slice(0, 7);
	}

	function selectDay(dayKey: DateKey) {
		if (isPastDay(dayKey)) return;
		selectedDateKey = dayKey;
	}

	function selectSlot(slot: Date) {
		selectedSlot = slot;
	}

	function close() {
		onClose();
	}

	function discardChanges() {
		if (!hasChanges) {
			close();
			return;
		}
		const reset = initialModalState(appointment);
		viewMonthKey = reset.viewMonthKey;
		selectedDateKey = reset.selectedDateKey;
		selectedSlot = reset.selectedSlot;
	}

	function handleDialogClick(event: MouseEvent) {
		if (event.target === dialogEl) close();
	}

	function formatSelectedDayLabel(dayKey: DateKey): string {
		return wallClockToDate(dayKey, '12:00', businessTimezone).toLocaleDateString(undefined, {
			timeZone: businessTimezone,
			weekday: 'long',
			month: 'short',
			day: 'numeric'
		});
	}

	function shiftViewMonth(months: number) {
		const [year, month] = viewMonthKey.split('-').map(Number);
		const shifted = new Date(Date.UTC(year, month - 1 + months, 1));
		viewMonthKey = `${shifted.getUTCFullYear()}-${String(shifted.getUTCMonth() + 1).padStart(2, '0')}-01`;
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
						<dd>{formatDateTimeInZone(startsAt, businessTimezone)}</dd>
					</div>
					<div>
						<dt>Status</dt>
						<dd>
							<span class="status-pill status-pill--modal status-pill--{pill.variant}"
								>{pill.label}</span
							>
						</dd>
					</div>
				</dl>

				{#if !isCancelled}
					<div class="manage-client-actions">
						{#if canSendReminder}
							<form method="post" action="?/sendReminder" use:enhance>
								<input type="hidden" name="appointmentId" value={appointment.id} />
								<input type="hidden" name="week" value={week} />
								<button type="submit" class="button">Send reminder</button>
							</form>
						{:else}
							<button type="button" class="button" disabled>
								{pill.variant === 'scheduled' ? 'Send reminder' : 'Reminder sent'}
							</button>
						{/if}
					</div>

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
						onclick={() => shiftViewMonth(-1)}
					>
						&lt;
					</button>
					<p class="month-nav__label">{monthLabel}</p>
					<button
						type="button"
						class="month-nav__btn"
						aria-label="Next month"
						onclick={() => shiftViewMonth(1)}
					>
						&gt;
					</button>
				</div>
				<div class="month-calendar" role="grid">
					<div class="month-weekdays" aria-hidden="true">
						{#each ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as label}
							<span class="month-weekday" role="columnheader">{label}</span>
						{/each}
					</div>
					<div class="month-grid">
						{#each monthGridDayKeys as dayKey (dayKey)}
							{@const inMonth = isCurrentMonth(dayKey)}
							{@const past = isPastDay(dayKey)}
							{@const selected = dayKey === selectedDateKey}
							{@const today = dayKey === todayKey}
							<button
								type="button"
								role="gridcell"
								class="month-day"
								class:month-day--outside={!inMonth}
								class:month-day--past={past}
								class:month-day--selected={selected}
								class:month-day--today={today}
								disabled={past}
								aria-label={formatSelectedDayLabel(dayKey)}
								aria-selected={selected}
								onclick={() => selectDay(dayKey)}
							>
								{Number(dayKey.split('-')[2])}
							</button>
						{/each}
					</div>
				</div>
			</section>

			<section class="manage-modal__column manage-modal__column--slots" aria-label="Available times">
				<h3 class="manage-modal__column-title">
					{formatSelectedDayLabel(selectedDateKey)}
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
								{formatTimeInZone(slot, businessTimezone)}
							</button>
						</li>
					{:else}
						<li class="slot-list__empty">No open times on this day.</li>
					{/each}
				</ul>
			</section>
		</div>

			<footer class="manage-modal__footer">
				{#if form?.appointmentId === appointment.id && form?.message}
					<p class="field-error" role="alert">{form.message}</p>
				{/if}
				{#if selectedSlot}
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
						<button type="submit" class="button" disabled={!hasChanges}>
							Save changes
						</button>
					</form>
				{/if}
				<button type="button" class="secondary manage-modal__discard" onclick={discardChanges}>
					Discard
				</button>
			</footer>
	</div>
</dialog>
