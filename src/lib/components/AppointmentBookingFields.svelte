<script lang="ts">
	import {
		formatTimeInZone,
		toDateInputValue,
		toTimeInputValue,
		wallClockToDate,
		type DateKey
	} from '$lib/calendar/datetime';
	import {
		getAvailableSlots,
		getMonthGridDayKeys,
		monthStartKey,
		shiftMonthKey,
		todayKeyInZone
	} from '$lib/booking/slots-ui';
	import type { AppointmentRow } from '$lib/components/AppointmentCard.svelte';
	import type { BookingFieldErrors } from '$lib/server/booking/schema';
	import { BookingPanel, Field, MonthPicker, SlotPicker } from '$lib/ui';

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

	const initialDayKey = todayKeyInZone(businessTimezone);
	let viewMonthKey = $state(monthStartKey(initialDayKey));
	let selectedDateKey = $state(initialDayKey);

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
		getAvailableSlots(selectedDateKey, upcomingAppointments, businessTimezone)
	);

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
</script>

<BookingPanel>
	<section class="booking-panel__col" aria-labelledby="{idPrefix}-client-heading">
		<h3 id="{idPrefix}-client-heading" class="booking-panel__col-title">Client</h3>

		<Field
			label="Name"
			id="{idPrefix}-clientName"
			name="clientName"
			required
			autocomplete="name"
			error={fieldErrors.clientName}
		/>

		<Field
			label="Email"
			id="{idPrefix}-clientEmail"
			name="clientEmail"
			inputType="email"
			required
			autocomplete="email"
			error={fieldErrors.clientEmail}
		/>

		<Field
			label="Phone"
			id="{idPrefix}-clientPhone"
			name="clientPhone"
			inputType="tel"
			optional
			autocomplete="tel"
			error={fieldErrors.clientPhone}
		/>

		<Field
			label="Service"
			id="{idPrefix}-serviceName"
			name="serviceName"
			control="select"
			required
			error={fieldErrors.serviceName}
		>
			<option value="" disabled selected>Select…</option>
			{#each services as service (service)}
				<option value={service}>{service}</option>
			{/each}
		</Field>
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
			dateError={fieldErrors.appointmentDate}
		/>
	</section>

	<div class="booking-panel__col">
		<SlotPicker
			slots={availableSlots}
			bind:selectedSlot
			{businessTimezone}
			dayLabel={selectedDayLabel}
			timeError={fieldErrors.appointmentTime}
		/>
	</div>
</BookingPanel>

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

<style>
	:global(.booking-panel__col .ui-field) {
		margin-bottom: 0.75rem;
	}

	:global(.booking-panel__col .ui-field:last-child) {
		margin-bottom: 0;
	}
</style>
