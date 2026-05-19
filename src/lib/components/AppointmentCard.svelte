<script lang="ts">
	import { enhance } from '$app/forms';
	import { toDateInputValue, toTimeInputValue } from '$lib/calendar/datetime';

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

	type FormState = {
		message?: string;
		appointmentId?: string | null;
	} | null;

	type PillVariant = 'confirmed' | 'pending' | 'reminder' | 'cancelled';

	let {
		appointment: a,
		week,
		form = null,
		editing = false,
		cancelConfirming = false,
		cardStyle = '',
		onEdit,
		onCancel,
		onDiscard
	}: {
		appointment: AppointmentRow;
		week: string;
		form?: FormState;
		editing?: boolean;
		cancelConfirming?: boolean;
		cardStyle?: string;
		onEdit: () => void;
		onCancel: () => void;
		onDiscard: () => void;
	} = $props();

	let manageOpen = $state(false);

	function asDate(value: Date | string): Date {
		return value instanceof Date ? value : new Date(value);
	}

	function formatTime(value: Date | string) {
		return asDate(value).toLocaleTimeString(undefined, { timeStyle: 'short' });
	}

	function getPill(): { label: string; variant: PillVariant } {
		if (a.status === 'cancelled') return { label: 'Cancelled', variant: 'cancelled' };
		if (a.isConfirmed) return { label: 'Confirmed', variant: 'confirmed' };
		if (a.reminderSentAt) return { label: 'Pending Confirmation', variant: 'pending' };
		return { label: 'Send Reminder', variant: 'reminder' };
	}

	function getAccentColor(): string {
		if (isCancelled) return '#9ca3af';
		if (a.isConfirmed) return '#10b981';
		if (a.reminderSentAt) return '#3b82f6';
		return '#f59e0b';
	}

	const startsAt = $derived(asDate(a.startsAt));
	const isCancelled = $derived(a.status === 'cancelled');
	const pill = $derived(getPill());
</script>

<li
	class="calendar-event-card"
	class:calendar-event-card--cancelled={isCancelled}
	class:calendar-event-card--expanded={editing || cancelConfirming}
	style="{cardStyle}; border-left-color: {getAccentColor()};"
>
	<div class="calendar-event-header">
		<p class="calendar-event-name">{a.clientName}</p>
		<span class="status-pill status-pill--{pill.variant}">{pill.label}</span>
	</div>

	<p class="calendar-event-meta">{a.serviceName} · {formatTime(startsAt)}</p>

	{#if !isCancelled}
		{#if cancelConfirming}
			<div class="calendar-event-confirm" role="alert">
				<p>Cancel this appointment? This cannot be undone.</p>
				<form method="post" action="?/cancel" use:enhance class="calendar-event-confirm-actions">
					<input type="hidden" name="appointmentId" value={a.id} />
					<input type="hidden" name="week" value={week} />
					<button type="submit">Yes, cancel</button>
					<button type="button" class="secondary" onclick={onDiscard}>Keep appointment</button>
				</form>
			</div>
		{:else if editing}
			<form method="post" action="?/reschedule" use:enhance class="calendar-event-edit">
				<input type="hidden" name="appointmentId" value={a.id} />
				<input type="hidden" name="week" value={week} />
				{#if form?.appointmentId === a.id && form?.message}
					<p class="field-error" role="alert">{form.message}</p>
				{/if}
				<div class="calendar-event-edit-fields">
					<label>
						<span class="meta">Date</span>
						<input
							type="date"
							name="appointmentDate"
							value={toDateInputValue(startsAt)}
							required
						/>
					</label>
					<label>
						<span class="meta">Time</span>
						<input
							type="time"
							name="appointmentTime"
							value={toTimeInputValue(startsAt)}
							required
						/>
					</label>
				</div>
				<div class="calendar-event-edit-actions">
					<button type="submit">Save</button>
					<button type="button" class="secondary" onclick={onDiscard}>Discard</button>
				</div>
			</form>
		{:else if manageOpen}
			<div class="calendar-event-footer">
				<button type="button" class="link-button" onclick={onEdit}>Reschedule</button>
				<span aria-hidden="true"> · </span>
				<button type="button" class="link-button" onclick={onCancel}>Cancel</button>
			</div>
		{:else}
			<div class="calendar-event-footer">
				<button type="button" class="btn-manage" onclick={() => (manageOpen = true)}>Manage</button>
			</div>
		{/if}
	{/if}
</li>
