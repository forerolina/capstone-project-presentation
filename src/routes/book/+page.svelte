<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<main class="page">
	<header class="page-header">
		<h1>Book an appointment</h1>
		<p>Choose a service and time. No account needed — you'll get a confirmation by email.</p>
	</header>

	<form method="post" use:enhance class="stack">
		<div class="field">
			<label for="clientName">Name</label>
			<input id="clientName" name="clientName" required autocomplete="name" />
			{#if form?.fieldErrors?.clientName}
				<p class="field-error" role="alert">{form.fieldErrors.clientName.join(', ')}</p>
			{/if}
		</div>

		<div class="field">
			<label for="clientEmail">Email</label>
			<input
				id="clientEmail"
				type="email"
				name="clientEmail"
				required
				autocomplete="email"
			/>
			{#if form?.fieldErrors?.clientEmail}
				<p class="field-error" role="alert">{form.fieldErrors.clientEmail.join(', ')}</p>
			{/if}
		</div>

		<div class="field">
			<label for="clientPhone">Phone <span class="meta">(optional)</span></label>
			<input id="clientPhone" type="tel" name="clientPhone" autocomplete="tel" />
			{#if form?.fieldErrors?.clientPhone}
				<p class="field-error" role="alert">{form.fieldErrors.clientPhone.join(', ')}</p>
			{/if}
		</div>

		<div class="field">
			<label for="serviceName">Service</label>
			<select id="serviceName" name="serviceName" required>
				<option value="" disabled selected>Select…</option>
				{#each data.services as service (service)}
					<option value={service}>{service}</option>
				{/each}
			</select>
			{#if form?.fieldErrors?.serviceName}
				<p class="field-error" role="alert">{form.fieldErrors.serviceName.join(', ')}</p>
			{/if}
		</div>

		<div class="field">
			<label for="startsAt">Date and time</label>
			<input id="startsAt" type="datetime-local" name="startsAt" required />
			{#if form?.fieldErrors?.startsAt}
				<p class="field-error" role="alert">{form.fieldErrors.startsAt.join(', ')}</p>
			{/if}
		</div>

		<div class="actions">
			<button type="submit">Book appointment</button>
		</div>

		{#if form?.message}
			<p class="form-message" role="alert">{form.message}</p>
		{/if}
	</form>
</main>
