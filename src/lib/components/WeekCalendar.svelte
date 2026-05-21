<script lang="ts">
	import AppointmentCard, { type AppointmentRow } from '$lib/components/AppointmentCard.svelte';
	import ManageAppointmentModal from '$lib/components/ManageAppointmentModal.svelte';
	import { wallClockHour, wallClockMinute, wallClockToDate } from '$lib/calendar/datetime';
	import { dayOfMonthFromDateKey, isSameDateKey, type DateKey } from '$lib/calendar/week';

	type FormState = {
		message?: string;
		appointmentId?: string | null;
	} | null;

	let {
		weekDays,
		appointments,
		upcomingAppointments,
		week,
		businessTimezone,
		form = null
	}: {
		weekDays: DateKey[];
		appointments: AppointmentRow[];
		upcomingAppointments: AppointmentRow[];
		week: string;
		businessTimezone: string;
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

	function appointmentsForDay(dayKey: DateKey): AppointmentRow[] {
		return appointments
			.filter((a) => isSameDateKey(asDate(a.startsAt), dayKey, businessTimezone))
			.sort((a, b) => asDate(a.startsAt).getTime() - asDate(b.startsAt).getTime());
	}

	function cardStyle(startsAt: Date | string, durationMinutes: number): string {
		const d = asDate(startsAt);
		const hour = wallClockHour(d, businessTimezone) + wallClockMinute(d, businessTimezone) / 60;
		const top = (hour - CALENDAR_START) * HOUR_HEIGHT;
		const height = (durationMinutes / 60) * HOUR_HEIGHT;
		return `top: ${top}px; height: ${height}px;`;
	}

	function formatHourLabel(hour: number): string {
		if (hour === 12) return '12 PM';
		return hour > 12 ? `${hour - 12} PM` : `${hour} AM`;
	}

	function formatDayAriaLabel(dayKey: DateKey): string {
		return new Intl.DateTimeFormat(undefined, {
			timeZone: businessTimezone,
			weekday: 'long',
			month: 'long',
			day: 'numeric',
			year: 'numeric'
		}).format(wallClockToDate(dayKey, '12:00', businessTimezone));
	}

	const weekdayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
	const workDays = $derived(weekDays.slice(0, 5));
</script>

<div class="week-calendar">
	<div class="week-calendar__header">
		<div class="week-calendar__header-gutter" aria-hidden="true"></div>
		{#each workDays as dayKey, i (dayKey)}
			<div class="week-calendar__header-cell" role="columnheader">
				<span class="week-calendar__weekday">{weekdayLabels[i]}</span>
				<span class="week-calendar__date">{dayOfMonthFromDateKey(dayKey)}</span>
			</div>
		{/each}
	</div>

	<div class="week-calendar__body" role="grid">
		<div class="week-calendar__time-gutter" aria-hidden="true">
			{#each HOURS as hour}
				<div
					class="week-calendar__time-label"
					style="top: {(hour - CALENDAR_START) * HOUR_HEIGHT}px"
				>
					{formatHourLabel(hour)}
				</div>
			{/each}
		</div>

		{#each workDays as dayKey (dayKey)}
			{@const dayAppointments = appointmentsForDay(dayKey)}
			<div
				class="week-calendar__day"
				role="gridcell"
				aria-label={formatDayAriaLabel(dayKey)}
				style="height: {(CALENDAR_END - CALENDAR_START) * HOUR_HEIGHT}px"
			>
				<div class="week-calendar__grid-lines" aria-hidden="true">
					{#each HOURS as _}
						<div class="week-calendar__grid-line" style="height: {HOUR_HEIGHT}px"></div>
					{/each}
				</div>

				<ul class="week-calendar__appts">
					{#each dayAppointments as a (a.id)}
						<AppointmentCard
							appointment={a}
							cardStyle={cardStyle(a.startsAt, a.durationMinutes)}
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
			{businessTimezone}
			{form}
			onClose={() => (managingAppointment = null)}
		/>
	{/key}
{/if}

<style>
	.week-calendar {
		border: var(--ghost-border);
		border-radius: var(--radius-xs);
		overflow: hidden;
		font-size: 0.8125rem;
		background: var(--glass-bg);
		backdrop-filter: blur(var(--glass-blur));
	}

	.week-calendar__header {
		display: grid;
		grid-template-columns: 48px repeat(5, minmax(0, 1fr));
		border-bottom: var(--ghost-border-strong);
	}

	.week-calendar__header-cell {
		padding: 0.5rem 0.4rem;
		text-align: center;
		border-right: var(--ghost-border);
	}

	.week-calendar__header-cell:last-child {
		border-right: none;
	}

	.week-calendar__header-gutter {
		border-right: var(--ghost-border);
	}

	.week-calendar__weekday {
		display: block;
		font-size: 0.6875rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--color-on-surface-variant);
	}

	.week-calendar__date {
		display: block;
		font-size: 1rem;
		font-weight: 700;
		line-height: 1.2;
	}

	.week-calendar__body {
		display: flex;
		overflow-y: auto;
		max-height: 640px;
	}

	.week-calendar__time-gutter {
		flex-shrink: 0;
		width: 48px;
		position: relative;
		border-right: var(--ghost-border);
	}

	.week-calendar__time-label {
		position: absolute;
		right: 6px;
		font-size: 0.625rem;
		color: var(--color-outline);
		transform: translateY(-50%);
		white-space: nowrap;
		user-select: none;
	}

	.week-calendar__day {
		flex: 1;
		position: relative;
		border-right: var(--ghost-border);
		min-width: 0;
	}

	.week-calendar__day:last-child {
		border-right: none;
	}

	.week-calendar__grid-lines {
		position: absolute;
		inset: 0;
		pointer-events: none;
	}

	.week-calendar__grid-line {
		border-top: 1px solid var(--color-surface-container);
		box-sizing: border-box;
	}

	.week-calendar__appts {
		position: absolute;
		inset: 0;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	@media (max-width: 640px) {
		.week-calendar__header {
			grid-template-columns: 1fr;
		}

		.week-calendar__header-gutter {
			display: none;
		}

		.week-calendar__body {
			flex-direction: column;
		}

		.week-calendar__day {
			border-right: none;
			border-bottom: var(--ghost-border);
		}
	}
</style>
