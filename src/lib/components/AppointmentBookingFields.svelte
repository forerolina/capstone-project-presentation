<script lang="ts">
	import {
		addDaysToDateKey,
		dateKeyFromDate,
		formatTimeInZone,
		toDateInputValue,
		toTimeInputValue,
		wallClockToDate,
		type DateKey
	} from '$lib/calendar/datetime';
	import { weekdayFromDateKey } from '$lib/calendar/week';
	import type { AppointmentRow } from '$lib/components/AppointmentCard.svelte';
	import type { BookingFieldErrors } from '$lib/server/booking/schema';

	const MS_PER_HOUR = 60 * 60 * 1000;
	const CALENDAR_START = 8;
	const CALENDAR_END = 20;

	let {
		idPrefix,
		upcomingAppointments,
		services,
		businessTimezone,
		fieldErrors = {},
		selectedSlot = $bindable(null)
	}: {
		idPrefix: string;
		upcomingAppointments: AppointmentRow[];
		services: string[];
		businessTimezone: string;
		fieldErrors?: BookingFieldErrors;
		selectedSlot?: Date | null;
	} = $props();

	const initialDayKey = dateKeyFromDate(new Date(), businessTimezone);
	let viewMonthKey = $state(monthStartKey(initialDayKey));
	let selectedDateKey = $state(initialDayKey);

	const todayKey = $derived(dateKeyFromDate(new Date(), businessTimezone));

	const monthLabel = $derived(
		wallClockToDate(viewMonthKey, '12:00', businessTimezone).toLocaleDateString(undefined, {
			timeZone: businessTimezone,
			month: 'long',
			year: 'numeric'
		})
	);
	const monthGridDayKeys = $derived(getMonthGridDayKeys(viewMonthKey));
	const availableSlots = $derived(getAvailableSlots(selectedDateKey, upcomingAppointments));

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

	function monthStartKey(dateKey: DateKey): DateKey {
		return `${dateKey.slice(0, 7)}-01`;
	}

	function asDate(value: Date | string): Date {
		return value instanceof Date ? value : new Date(value);
	}

	function getMonthGridDayKeys(monthKey: DateKey): DateKey[] {
		const firstWeekday = weekdayFromDateKey(monthKey);
		const gridStart = addDaysToDateKey(monthKey, -firstWeekday);
		return Array.from({ length: 42 }, (_, i) => addDaysToDateKey(gridStart, i));
	}

	function getAvailableSlots(dayKey: DateKey, appointments: AppointmentRow[]): Date[] {
		const now = new Date();
		const slots: Date[] = [];

		for (let hour = CALENDAR_START; hour < CALENDAR_END; hour++) {
			const time = `${String(hour).padStart(2, '0')}:00`;
			const slot = wallClockToDate(dayKey, time, businessTimezone);
			if (slot <= now) continue;

			const slotEnd = new Date(slot.getTime() + MS_PER_HOUR);
			const hasConflict = appointments.some((appt) => {
				if (appt.status !== 'upcoming') return false;
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

<div class="manage-modal__columns">
	<section
		class="manage-modal__column manage-modal__column--client"
		aria-labelledby="{idPrefix}-client-heading"
	>
		<h3 id="{idPrefix}-client-heading" class="manage-modal__column-title">Client</h3>

		<div class="field">
			<label for="{idPrefix}-clientName">Name</label>
			<input id="{idPrefix}-clientName" name="clientName" required autocomplete="name" />
			{#if fieldErrors.clientName}
				<p class="field-error" role="alert">{fieldErrors.clientName.join(', ')}</p>
			{/if}
		</div>

		<div class="field">
			<label for="{idPrefix}-clientEmail">Email</label>
			<input
				id="{idPrefix}-clientEmail"
				type="email"
				name="clientEmail"
				required
				autocomplete="email"
			/>
			{#if fieldErrors.clientEmail}
				<p class="field-error" role="alert">{fieldErrors.clientEmail.join(', ')}</p>
			{/if}
		</div>

		<div class="field">
			<label for="{idPrefix}-clientPhone">Phone <span class="meta">(optional)</span></label>
			<input id="{idPrefix}-clientPhone" type="tel" name="clientPhone" autocomplete="tel" />
			{#if fieldErrors.clientPhone}
				<p class="field-error" role="alert">{fieldErrors.clientPhone.join(', ')}</p>
			{/if}
		</div>

		<div class="field">
			<label for="{idPrefix}-serviceName">Service</label>
			<select id="{idPrefix}-serviceName" name="serviceName" required>
				<option value="" disabled selected>Select…</option>
				{#each services as service (service)}
					<option value={service}>{service}</option>
				{/each}
			</select>
			{#if fieldErrors.serviceName}
				<p class="field-error" role="alert">{fieldErrors.serviceName.join(', ')}</p>
			{/if}
		</div>
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
			<button type="button" class="month-nav__btn" aria-label="Next month" onclick={() => shiftViewMonth(1)}>
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
		{#if fieldErrors.appointmentDate}
			<p class="field-error" role="alert">{fieldErrors.appointmentDate.join(', ')}</p>
		{/if}
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
		{#if fieldErrors.appointmentTime}
			<p class="field-error" role="alert">{fieldErrors.appointmentTime.join(', ')}</p>
		{/if}
	</section>
</div>

{#if selectedSlot}
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
{/if}
