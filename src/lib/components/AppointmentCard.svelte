<script lang="ts">
	import {
		getAppointmentDisplayStatus,
		getDisplayStatusAccentColor
	} from '$lib/appointment/display-status';
	import { formatTimeInZone } from '$lib/calendar/datetime';
	import { Button, StatusPill } from '$lib/ui';

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
	const isCancelled = $derived(a.status === 'cancelled');
</script>

<li
	class="calendar-event-card"
	class:calendar-event-card--cancelled={isCancelled}
	style="{cardStyle}; --event-accent: {accentColor};"
>
	<div class="calendar-event-header">
		<p class="calendar-event-name">{a.clientName}</p>
		<StatusPill label={pill.label} variant={pill.variant} />
	</div>

	<p class="calendar-event-meta text-muted">{a.serviceName} · {formatTime(startsAt)}</p>

	<div class="calendar-event-footer">
		<Button variant="ghost" type="button" onclick={onManage}>Manage</Button>
	</div>
</li>

<style>
	.calendar-event-card {
		position: absolute;
		left: 4px;
		right: 4px;
		border-radius: var(--radius-default);
		border-left: 3px solid var(--event-accent, var(--color-outline));
		background: var(--glass-bg);
		backdrop-filter: blur(var(--glass-blur-sm));
		overflow: hidden;
		box-shadow: 0 1px 8px rgba(0, 103, 127, 0.08);
		transition: box-shadow 0.15s ease;
	}

	.calendar-event-card:hover {
		box-shadow: 0 4px 16px rgba(0, 103, 127, 0.14);
	}

	.calendar-event-card--cancelled {
		opacity: 0.75;
		background: var(--color-surface-container);
	}

	.calendar-event-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 4px;
		padding: 5px 6px 2px;
	}

	.calendar-event-name {
		margin: 0;
		font-weight: 700;
		font-size: 0.8125rem;
		line-height: 1.2;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		flex: 1;
		min-width: 0;
	}

	.calendar-event-meta {
		margin: 0;
		padding: 0 6px 4px;
		font-size: 0.6875rem;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.calendar-event-footer {
		display: flex;
		justify-content: flex-end;
		padding: 2px 6px 5px;
	}
</style>
