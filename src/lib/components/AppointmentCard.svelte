<script lang="ts">
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
		cardStyle = '',
		onManage
	}: {
		appointment: AppointmentRow;
		cardStyle?: string;
		onManage: () => void;
	} = $props();

	function asDate(value: Date | string): Date {
		return value instanceof Date ? value : new Date(value);
	}

	function formatTime(value: Date | string) {
		return asDate(value).toLocaleTimeString(undefined, { timeStyle: 'short' });
	}

	function getPill(): { label: string; variant: PillVariant } {
		if (a.status === 'cancelled') return { label: 'Cancelled', variant: 'cancelled' };
		if (a.reminderSentAt) return { label: 'Pending confirmation', variant: 'pending' };
		if (a.isConfirmed) return { label: 'Confirmed', variant: 'confirmed' };
		return { label: 'Needs reminder', variant: 'reminder' };
	}

	function getAccentColor(): string {
		if (isCancelled) return '#9ca3af';
		if (a.reminderSentAt) return '#3b82f6';
		if (a.isConfirmed) return '#10b981';
		return '#f59e0b';
	}

	const startsAt = $derived(asDate(a.startsAt));
	const isCancelled = $derived(a.status === 'cancelled');
	const pill = $derived(getPill());
</script>

<li
	class="calendar-event-card"
	class:calendar-event-card--cancelled={isCancelled}
	style="{cardStyle}; border-left-color: {getAccentColor()};"
>
	<div class="calendar-event-header">
		<p class="calendar-event-name">{a.clientName}</p>
		<span class="status-pill status-pill--{pill.variant}">{pill.label}</span>
	</div>

	<p class="calendar-event-meta">{a.serviceName} · {formatTime(startsAt)}</p>

	{#if !isCancelled}
		<div class="calendar-event-footer">
			<button type="button" class="btn-manage" onclick={onManage}>Manage</button>
		</div>
	{/if}
</li>
