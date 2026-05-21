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

<div class="book-page">
	<main class="page page--wide book-page__main">
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
	</main>
</div>

<style>
	.book-page {
		position: relative;
		z-index: 1;
		min-height: 100vh;
	}

	.book-page__main {
		position: relative;
		z-index: 1;
	}

	.book-page :global(.ui-page-header__main) {
		flex-wrap: nowrap;
		align-items: flex-start;
	}

	.book-page :global(.ui-page-header__text) {
		min-width: 0;
	}

	.book-page :global(.ui-page-header__actions) {
		flex-shrink: 0;
		margin-left: auto;
	}

	.book-page :global(.ui-page-header h1) {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		color: #ffffff;
	}

	.book-page :global(.book-tagline) {
		margin: 0;
		font-size: var(--text-body-md-size);
		color: rgba(255, 255, 255, 0.7);
	}

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
