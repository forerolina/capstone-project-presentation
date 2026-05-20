<script lang="ts">
	import { enhance } from '$app/forms';
	import { formatDateTimeInZone } from '$lib/calendar/datetime';
	import { Button, PageHeader } from '$lib/ui';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	function formatWhen(value: Date | string) {
		const d = value instanceof Date ? value : new Date(value);
		return formatDateTimeInZone(d, data.businessTimezone);
	}

	const showSuccess = $derived(form && 'confirmed' in form && form.confirmed === true);
</script>

<main class="page">
	{#if showSuccess}
		<PageHeader title="You're all set" borderless>
			{#if form && 'alreadyConfirmed' in form && form.alreadyConfirmed}
				<p class="text-muted">
					Your attendance was already confirmed. We look forward to seeing you.
				</p>
			{:else}
				<p class="text-muted">Thanks for confirming. We look forward to seeing you.</p>
			{/if}
		</PageHeader>
	{:else if data.error === 'invalid'}
		<PageHeader
			title="Link not valid"
			tagline="This confirmation link is not valid. Please use the link from your reminder email."
			borderless
		/>
	{:else if data.error === 'cancelled'}
		<PageHeader
			title="Appointment cancelled"
			tagline="This appointment has been cancelled. Contact the business if you have questions."
			borderless
		/>
	{:else if data.error === 'not_ready'}
		<PageHeader
			title="Not ready yet"
			tagline="Confirmation will be available once you receive a reminder for this appointment."
			borderless
		/>
	{:else if data.appointment?.isConfirmed}
		<PageHeader title="You're all set" borderless>
			<p class="text-muted">
				Your attendance for {formatWhen(data.appointment.startsAt)} is already confirmed. We look forward
				to seeing you.
			</p>
		</PageHeader>
	{:else if data.appointment}
		<PageHeader title="Confirm attendance" borderless>
			<p class="text-muted">
				Hi {data.appointment.clientName}, please confirm you can still make your appointment on
				<strong>{formatWhen(data.appointment.startsAt)}</strong>.
			</p>

			{#if form && 'message' in form && form.message}
				<p class="ui-form-message" role="alert">{form.message}</p>
			{/if}

			<form method="post" action="?/confirm" use:enhance class="stack">
				<input type="hidden" name="token" value={data.token} />
				<Button variant="primary" type="submit">Confirm attendance</Button>
			</form>
		</PageHeader>
	{:else}
		<PageHeader
			title="Appointment not found"
			tagline="We could not find this appointment. Please use the link from your reminder email."
			borderless
		/>
	{/if}
</main>

<style>
	.ui-form-message {
		margin: 1rem 0 0;
		padding: 0.75rem 1rem;
		font-size: var(--text-label-md-size);
		color: var(--color-on-error-container);
		background: var(--color-error-container);
		border-radius: var(--radius-default);
	}
</style>
