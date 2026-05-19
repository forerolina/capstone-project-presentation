<script lang="ts">
	import { enhance } from '$app/forms';
	import { formatDateTimeInZone } from '$lib/calendar/datetime';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	function formatWhen(value: Date | string) {
		const d = value instanceof Date ? value : new Date(value);
		return formatDateTimeInZone(d, data.businessTimezone);
	}

	const showSuccess = $derived(
		form && 'confirmed' in form && form.confirmed === true
	);
</script>

<main class="page">
	<header class="page-header">
		{#if showSuccess}
			<h1>You're all set</h1>
			{#if form && 'alreadyConfirmed' in form && form.alreadyConfirmed}
				<p>Your attendance was already confirmed. We look forward to seeing you.</p>
			{:else}
				<p>Thanks for confirming. We look forward to seeing you.</p>
			{/if}
		{:else if data.error === 'invalid'}
			<h1>Link not valid</h1>
			<p>This confirmation link is not valid. Please use the link from your reminder email.</p>
		{:else if data.error === 'cancelled'}
			<h1>Appointment cancelled</h1>
			<p>This appointment has been cancelled. Contact the business if you have questions.</p>
		{:else if data.error === 'not_ready'}
			<h1>Not ready yet</h1>
			<p>Confirmation will be available once you receive a reminder for this appointment.</p>
		{:else if data.appointment?.isConfirmed}
			<h1>You're all set</h1>
			<p>
				Your attendance for {formatWhen(data.appointment.startsAt)} is already confirmed. We look
				forward to seeing you.
			</p>
		{:else if data.appointment}
			<h1>Confirm attendance</h1>
			<p>
				Hi {data.appointment.clientName}, please confirm you can still make your appointment on
				<strong>{formatWhen(data.appointment.startsAt)}</strong>.
			</p>

			{#if form && 'message' in form && form.message}
				<p class="field-error" role="alert">{form.message}</p>
			{/if}

			<form method="post" action="?/confirm" use:enhance class="stack">
				<input type="hidden" name="token" value={data.token} />
				<button type="submit" class="button">Confirm attendance</button>
			</form>
		{:else}
			<h1>Appointment not found</h1>
			<p>We could not find this appointment. Please use the link from your reminder email.</p>
		{/if}
	</header>
</main>
