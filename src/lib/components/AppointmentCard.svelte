<script lang="ts">
	import { formatTimeInZone } from '$lib/calendar/datetime';

	export type AppointmentRow = {
		id: string;
		clientName: string;
		clientEmail: string;
		clientPhone: string | null;
		startsAt: Date | string;
		serviceName: string;
		isConfirmed: boolean;
		status: string;
		reminderSentAt: Date | string | null;
	};

	type PillVariant = 'confirmed' | 'pending' | 'reminder' | 'cancelled';

	let {
		appointment: a,
		businessTimezone,
		cardStyle = '',
		onManage
	}: {
		appointment: AppointmentRow;
		businessTimezone: string;
		cardStyle?: string;
		onManage: () => void;
	} = $props();

	function asDate(value: Date | string): Date {
		return value instanceof Date ? value : new Date(value);
	}

	function formatTime(value: Date | string) {
		return formatTimeInZone(asDate(value), businessTimezone);
	}

	function getPill(): { label: string; variant: PillVariant } {
		if (a.reminderSentAt) return { label: 'Pending confirmation', variant: 'pending' };
		if (a.isConfirmed) return { label: 'Confirmed', variant: 'confirmed' };
		return { label: 'Needs reminder', variant: 'reminder' };
	}

	function getAccentColor(): string {
		if (a.reminderSentAt) return '#3b82f6';
		if (a.isConfirmed) return '#10b981';
		return '#f59e0b';
	}

	const startsAt = $derived(asDate(a.startsAt));
	const pill = $derived(getPill());
</script>

<li
	class="calendar-event-card"
	style="{cardStyle}; border-left-color: {getAccentColor()};"
>
	<div class="calendar-event-header">
		<p class="calendar-event-name">{a.clientName}</p>
		<span class="status-pill status-pill--{pill.variant}">{pill.label}</span>
	</div>

	<p class="calendar-event-meta">{a.serviceName} · {formatTime(startsAt)}</p>

	<div class="calendar-event-footer">
		<button type="button" class="btn-manage" onclick={onManage}>Manage</button>
	</div>
</li>
