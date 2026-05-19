<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import AppointmentBookingFields from '$lib/components/AppointmentBookingFields.svelte';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let selectedSlot = $state<Date | null>(null);
	const fieldErrors = $derived(form?.fieldErrors ?? {});
</script>

<main class="page page--wide booking-page">
	<header class="page-header page-header--booking">
		<div class="booking-page__top-bar">
			<div class="booking-page__intro">
				<h1>Book an appointment</h1>
				<p class="page-header-tagline">
					Choose a service and time. No account needed — you'll get a confirmation by email.
				</p>
			</div>
			{#if data.isOwner}
				<a href={resolve('/dashboard')} class="secondary booking-page__owner-link">Dashboard</a>
			{:else}
				<a href={resolve('/login')} class="secondary booking-page__owner-link">admin login</a>
			{/if}
		</div>
	</header>

	<form method="post" class="create-modal__form booking-page__form" use:enhance>
		<div class="booking-page__card manage-modal__inner">
			<AppointmentBookingFields
				idPrefix="book"
				upcomingAppointments={data.upcomingAppointments}
				services={data.services}
				businessTimezone={data.businessTimezone}
				{fieldErrors}
				bind:selectedSlot
			/>

			<footer class="manage-modal__footer">
				{#if form?.message}
					<p class="field-error" role="alert">{form.message}</p>
				{/if}
				<div class="manage-modal__save">
					<button type="submit" class="button" disabled={!selectedSlot}>Book appointment</button>
				</div>
			</footer>
		</div>
	</form>
</main>
