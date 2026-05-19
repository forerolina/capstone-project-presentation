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

	const weekdayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
</script>

<div class="calendar" role="grid">
	<div class="calendar-header">
		{#each weekDays as dayIso, i (dayIso)}
			{@const day = asDate(dayIso)}
			<div class="calendar-header-cell" role="columnheader">
				<span class="calendar-weekday">{weekdayLabels[i]}</span>
				<span class="calendar-date">{day.getDate()}</span>
			</div>
		{/each}
	</div>

	<div class="calendar-body">
		{#each weekDays as dayIso (dayIso)}
			{@const dayAppointments = appointmentsForDay(dayIso)}
			<div class="calendar-day" role="gridcell" aria-label={asDate(dayIso).toLocaleDateString()}>
				{#if dayAppointments.length > 1}
					<p class="calendar-day-meta">
						{dayAppointments.length} appointments
					</p>
				{/if}
				{#if dayAppointments.length === 0}
					<p class="calendar-day-empty">—</p>
				{:else}
					<ul class="calendar-day-list">
						{#each dayAppointments as a, index (a.id)}
							<AppointmentCard
								appointment={a}
								{week}
								{form}
								editing={editingId === a.id}
								cancelConfirming={cancelConfirmId === a.id}
								stacked={index < dayAppointments.length - 1}
								onEdit={() => startEdit(a.id)}
								onCancel={() => startCancel(a.id)}
								onDiscard={discard}
							/>
						{/each}
					</ul>
				{/if}
			</div>
		{/each}
	</div>
</div>
