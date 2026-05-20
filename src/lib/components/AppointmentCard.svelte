<script lang="ts">
	import {
		getAppointmentDisplayStatus,
		getDisplayStatusAccentColor
	} from '$lib/appointment/display-status';
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

	<div class="calendar-event-bottom">
		<p class="calendar-event-service text-muted">{a.serviceName}</p>
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

	.calendar-event-bottom {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 4px;
		padding: 0 6px;
		min-width: 0;
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
</style>
