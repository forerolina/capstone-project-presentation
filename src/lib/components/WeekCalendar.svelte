<script lang="ts">
	import AppointmentCard, { type AppointmentRow } from '$lib/components/AppointmentCard.svelte';
	import { isSameLocalDay } from '$lib/calendar/week';

	type FormState = {
		message?: string;
		appointmentId?: string | null;
	} | null;

	let {
		weekDays,
		appointments,
		week,
		form = null
	}: {
		weekDays: string[];
		appointments: AppointmentRow[];
		week: string;
		form?: FormState;
	} = $props();

	const HOUR_HEIGHT = 64;
	const CALENDAR_START = 8;
	const CALENDAR_END = 20;
	const HOURS = Array.from({ length: CALENDAR_END - CALENDAR_START }, (_, i) => CALENDAR_START + i);

	let editingId = $state<string | null>(null);
	let cancelConfirmId = $state<string | null>(null);

	$effect(() => {
		if (form?.appointmentId) {
			editingId = form.appointmentId;
			cancelConfirmId = null;
		}
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

	function startEdit(id: string) {
		editingId = id;
		cancelConfirmId = null;
	}

	function startCancel(id: string) {
		cancelConfirmId = id;
		editingId = null;
	}

	function discard() {
		editingId = null;
		cancelConfirmId = null;
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
							{week}
							{form}
							editing={editingId === a.id}
							cancelConfirming={cancelConfirmId === a.id}
							cardStyle={cardStyle(a.startsAt)}
							onEdit={() => startEdit(a.id)}
							onCancel={() => startCancel(a.id)}
							onDiscard={discard}
						/>
					{/each}
				</ul>
			</div>
		{/each}
	</div>
</div>
