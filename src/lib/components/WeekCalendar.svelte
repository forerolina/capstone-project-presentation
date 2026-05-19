<script lang="ts">
	import AppointmentCard, { type AppointmentRow } from '$lib/components/AppointmentCard.svelte';
	import ManageAppointmentModal from '$lib/components/ManageAppointmentModal.svelte';
	import { isSameLocalDay } from '$lib/calendar/week';

	type FormState = {
		message?: string;
		appointmentId?: string | null;
	} | null;

	let {
		weekDays,
		appointments,
		upcomingAppointments,
		week,
		form = null
	}: {
		weekDays: string[];
		appointments: AppointmentRow[];
		upcomingAppointments: AppointmentRow[];
		week: string;
		form?: FormState;
	} = $props();

	const HOUR_HEIGHT = 64;
	const CALENDAR_START = 8;
	const CALENDAR_END = 20;
	const HOURS = Array.from({ length: CALENDAR_END - CALENDAR_START }, (_, i) => CALENDAR_START + i);

	let managingAppointment = $state<AppointmentRow | null>(null);

	$effect(() => {
		if (!form?.appointmentId) return;
		const match =
			appointments.find((a) => a.id === form.appointmentId) ??
			upcomingAppointments.find((a) => a.id === form.appointmentId);
		if (match) managingAppointment = match;
	});

	function asDate(value: Date | string): Date {
		return value instanceof Date ? value : new Date(value);
	}

	function appointmentsForDay(dayIso: string): AppointmentRow[] {
		const day = asDate(dayIso);
		return appointments
			.filter((a) => isSameLocalDay(asDate(a.startsAt), day))
			.sort((a, b) => asDate(a.startsAt).getTime() - asDate(b.startsAt).getTime());
	}

	function cardStyle(startsAt: Date | string): string {
		const d = asDate(startsAt);
		const top = (d.getHours() + d.getMinutes() / 60 - CALENDAR_START) * HOUR_HEIGHT;
		return `top: ${top}px; height: ${HOUR_HEIGHT}px;`;
	}

	function formatHourLabel(hour: number): string {
		if (hour === 12) return '12 PM';
		return hour > 12 ? `${hour - 12} PM` : `${hour} AM`;
	}

	const weekdayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
	const workDays = $derived(weekDays.slice(0, 5));
</script>

<div class="calendar">
	<div class="calendar-header">
		<div class="calendar-header-cell calendar-header-cell--gutter" aria-hidden="true"></div>
		{#each workDays as dayIso, i (dayIso)}
			{@const day = asDate(dayIso)}
			<div class="calendar-header-cell" role="columnheader">
				<span class="calendar-weekday">{weekdayLabels[i]}</span>
				<span class="calendar-date">{day.getDate()}</span>
			</div>
		{/each}
	</div>

	<div class="calendar-body" role="grid">
		<div class="calendar-time-gutter" aria-hidden="true">
			{#each HOURS as hour}
				<div class="calendar-time-label" style="top: {(hour - CALENDAR_START) * HOUR_HEIGHT}px">
					{formatHourLabel(hour)}
				</div>
			{/each}
		</div>

		{#each workDays as dayIso (dayIso)}
			{@const dayAppointments = appointmentsForDay(dayIso)}
			<div
				class="calendar-day"
				role="gridcell"
				aria-label={asDate(dayIso).toLocaleDateString()}
				style="height: {(CALENDAR_END - CALENDAR_START) * HOUR_HEIGHT}px"
			>
				<div class="calendar-grid-lines" aria-hidden="true">
					{#each HOURS as _}
						<div class="calendar-grid-line" style="height: {HOUR_HEIGHT}px"></div>
					{/each}
				</div>

				<ul class="calendar-day-appts">
					{#each dayAppointments as a (a.id)}
						<AppointmentCard
							appointment={a}
							cardStyle={cardStyle(a.startsAt)}
							onManage={() => (managingAppointment = a)}
						/>
					{/each}
				</ul>
			</div>
		{/each}
	</div>
</div>

{#if managingAppointment}
	{#key managingAppointment.id}
		<ManageAppointmentModal
			appointment={managingAppointment}
			{upcomingAppointments}
			{week}
			{form}
			onClose={() => (managingAppointment = null)}
		/>
	{/key}
{/if}
