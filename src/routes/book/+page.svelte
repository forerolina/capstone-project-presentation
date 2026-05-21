<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import AppointmentBookingFields from '$lib/components/AppointmentBookingFields.svelte';
	import { Button, Card, PageHeader } from '$lib/ui';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let selectedServiceId = $state('');
	let selectedSlot = $state<Date | null>(null);
	let clientName = $state('');
	let clientEmail = $state('');
	const fieldErrors = $derived(form?.fieldErrors ?? {});
	const canSubmit = $derived(
		Boolean(
			data.services.length > 0 &&
				clientName.trim() &&
				clientEmail.trim() &&
				selectedServiceId &&
				selectedSlot
		)
	);
</script>

<PageHeader title="Book an appointment" borderless>
	{#snippet actions()}
		{#if data.isOwner}
			<Button variant="secondary" href={resolve('/dashboard')}>Dashboard</Button>
		{:else}
			<Button variant="secondary" href={resolve('/login')}>admin login</Button>
		{/if}
	{/snippet}
	<p class="book-tagline">Choose a service and time. No account needed — you'll get a confirmation by email.</p>
</PageHeader>

{#if data.services.length === 0}
	<Card>
		<p class="book-empty text-muted">Online booking is not available yet. Please contact the business.</p>
	</Card>
{:else}
	<form method="post" class="book-form" use:enhance>
		<Card>
			<AppointmentBookingFields
				idPrefix="book"
				upcomingAppointments={data.upcomingAppointments}
				services={data.services}
				businessTimezone={data.businessTimezone}
				{fieldErrors}
				bind:selectedServiceId
				bind:selectedSlot
				bind:clientName
				bind:clientEmail
			/>

			<footer class="book-form__footer">
				{#if form?.message}
					<p class="ui-form-message" role="alert">{form.message}</p>
				{/if}
				<Button variant="primary" type="submit" disabled={!canSubmit}>Book appointment</Button>
			</footer>
		</Card>
	</form>
{/if}

<style>
	.book-form {
		max-width: min(960px, 100%);
		margin: 0 auto;
	}

	:global(.book-form .ui-card) {
		display: flex;
		flex-direction: column;
		max-height: none;
	}

	.book-form__footer {
		display: flex;
		flex-shrink: 0;
		flex-wrap: wrap;
		align-items: center;
		justify-content: flex-end;
		gap: 0.5rem;
		padding: 1rem 1.25rem;
		border-top: var(--ghost-border);
	}

	.book-form__footer .ui-form-message {
		flex: 1 1 100%;
		margin: 0 0 0.5rem;
		text-align: left;
		font-size: var(--text-label-md-size);
		color: var(--color-on-error-container);
	}
</style>
