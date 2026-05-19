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

	let {
		appointment: a,
		week,
		form = null,
		editing = false,
		cancelConfirming = false,
		stacked = false,
		onEdit,
		onCancel,
		onDiscard
	}: {
		appointment: AppointmentRow;
		week: string;
		form?: FormState;
		editing?: boolean;
		cancelConfirming?: boolean;
		stacked?: boolean;
		onEdit: () => void;
		onCancel: () => void;
		onDiscard: () => void;
	} = $props();

	function asDate(value: Date | string): Date {
		return value instanceof Date ? value : new Date(value);
	}

	function formatTime(value: Date | string) {
		return asDate(value).toLocaleTimeString(undefined, { timeStyle: 'short' });
	}

	function formatReminderSent(value: Date | string) {
		return asDate(value).toLocaleDateString(undefined, {
			month: 'short',
			day: 'numeric',
			hour: 'numeric',
			minute: '2-digit'
		});
	}

	function statusLine(): string {
		const confirmation = a.isConfirmed ? 'Confirmed' : 'Not confirmed';
		if (a.status === 'cancelled') {
			return `${confirmation} · Cancelled`;
		}
		return `${confirmation} · Upcoming`;
	}

	const startsAt = $derived(asDate(a.startsAt));
	const isCancelled = $derived(a.status === 'cancelled');
</script>

<li
	class="calendar-event"
	class:calendar-event--cancelled={isCancelled}
	class:calendar-event--stacked={stacked}
>
	<div class="calendar-event-time-rail">
		<p class="calendar-event-time">{formatTime(startsAt)}</p>
	</div>

	<div class="calendar-event-body">
		<p class="calendar-event-service">{a.serviceName}</p>
		<p class="calendar-event-client">{a.clientName}</p>
		<p class="calendar-event-status-line">{statusLine()}</p>

		<details class="calendar-event-details">
			<summary>Details</summary>
			<p class="calendar-event-contact">{a.clientEmail}</p>
			<p class="calendar-event-contact">{a.clientPhone ?? '—'}</p>
			<p class="calendar-event-reminder">
				{#if a.reminderSentAt}
					Reminder sent · {formatReminderSent(a.reminderSentAt)}
				{:else}
					Reminder not sent
				{/if}
			</p>
		</details>

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
			{:else}
				<p class="calendar-event-actions-link">
					<button type="button" class="link-button" onclick={onEdit}>Reschedule</button>
					<span aria-hidden="true"> · </span>
					<button type="button" class="link-button" onclick={onCancel}>Cancel</button>
				</p>
			{/if}
		{/if}
	</div>
</li>
