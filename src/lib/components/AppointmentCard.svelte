<script lang="ts">
	import {
		getAppointmentDisplayStatus,
		getDisplayStatusAccentColor
	} from '$lib/appointment/display-status';
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

	const startsAt = $derived(asDate(a.startsAt));
	const pill = $derived(getAppointmentDisplayStatus(a));
	const accentColor = $derived(getDisplayStatusAccentColor(pill.variant));
</script>

<li
	class="calendar-event-card"
	style="{cardStyle}; border-left-color: {accentColor};"
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
