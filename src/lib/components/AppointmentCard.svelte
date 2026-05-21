<script lang="ts">
	import {
		getAppointmentDisplayStatus,
		getDisplayStatusAccentColor
	} from '$lib/appointment/display-status';
	import { formatDurationMinutes } from '$lib/booking/service-catalog';
	import { Button, StatusPill } from '$lib/ui';

	export type AppointmentRow = {
		id: string;
		clientName: string;
		clientEmail: string;
		clientPhone: string | null;
		startsAt: Date | string;
		serviceName: string;
		durationMinutes: number;
		isConfirmed: boolean;
		status: string;
		reminderSentAt: Date | string | null;
	};

	let {
		appointment: a,
		cardStyle = '',
		onManage
	}: {
		appointment: AppointmentRow;
		cardStyle?: string;
		onManage: () => void;
	} = $props();

	const pill = $derived(getAppointmentDisplayStatus(a));
	const accentColor = $derived(getDisplayStatusAccentColor(pill.variant));
	const isCancelled = $derived(a.status === 'cancelled');
	const isCompact = $derived(a.durationMinutes <= 30);
	const isVeryCompact = $derived(a.durationMinutes <= 15);
	const cardLabel = $derived(
		`${a.clientName}, ${a.serviceName}, ${formatDurationMinutes(a.durationMinutes)}, ${pill.label}`
	);
</script>

<li
	class="calendar-event-card"
	class:calendar-event-card--cancelled={isCancelled}
	class:calendar-event-card--compact={isCompact}
	class:calendar-event-card--compact-15={isVeryCompact}
	style="{cardStyle}; --event-accent: {accentColor};"
	aria-label={cardLabel}
	title={isCompact ? cardLabel : undefined}
>
	<div class="calendar-event-header">
		<p class="calendar-event-name">{a.clientName}</p>
		<StatusPill label={pill.label} variant={pill.variant} />
	</div>

	<div class="calendar-event-body">
		<p class="calendar-event-service text-muted">
			<span class="calendar-event-service-name">{a.serviceName}</span>
			<span class="calendar-event-service-meta">
				{' · '}{formatDurationMinutes(a.durationMinutes)}
			</span>
		</p>
		<Button variant="tertiary" type="button" class="calendar-event-manage" onclick={onManage}>
			Manage
		</Button>
	</div>
</li>

<style>
	.calendar-event-card {
		position: absolute;
		left: 4px;
		right: 4px;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		padding: 8px 0;
		box-sizing: border-box;
		border-radius: var(--radius-xs);
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
		padding: 0 6px;
		flex-shrink: 0;
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

	.calendar-event-body {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 4px;
		padding: 0 6px;
		min-width: 0;
		flex-shrink: 0;
	}

	.calendar-event-service {
		margin: 0;
		font-size: 0.6875rem;
		line-height: 1.2;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		flex: 1;
		min-width: 0;
	}

	.calendar-event-card :global(.calendar-event-manage) {
		flex-shrink: 0;
		padding: 0;
		font-size: 0.6875rem;
		font-weight: 600;
		line-height: 1.2;
		letter-spacing: 0.02em;
	}

	/* 15–30 min only: service + manage; status via accent border + tint */
	.calendar-event-card--compact {
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
		gap: 4px;
		padding: 2px 0;
		border-left-width: 4px;
		background: color-mix(in srgb, var(--event-accent) 14%, var(--glass-bg));
	}

	.calendar-event-card--compact.calendar-event-card--cancelled {
		background: color-mix(in srgb, var(--event-accent) 10%, var(--color-surface-container));
	}

	.calendar-event-card--compact .calendar-event-header {
		display: none;
	}

	.calendar-event-card--compact .calendar-event-body {
		flex: 1;
		min-height: 0;
		padding: 0 6px;
	}

	.calendar-event-card--compact .calendar-event-service {
		font-weight: 600;
		color: var(--color-on-surface);
	}

	.calendar-event-card--compact .calendar-event-service-meta {
		display: none;
	}

	.calendar-event-card--compact :global(.calendar-event-manage) {
		font-size: 0.625rem;
	}

	.calendar-event-card--compact-15 {
		padding: 0;
		border-left-width: 3px;
	}

	.calendar-event-card--compact-15 .calendar-event-body {
		padding: 0 4px;
		gap: 2px;
	}

	.calendar-event-card--compact-15 .calendar-event-service {
		font-size: 0.5625rem;
		line-height: 1;
	}

	.calendar-event-card--compact-15 :global(.calendar-event-manage) {
		font-size: 0.5625rem;
		line-height: 1;
	}
</style>
