<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
</script>

<h1>Book an appointment</h1>
<p>One service type. Pay to confirm.</p>

<form method="post" use:enhance>
	<label>
		Name
		<input name="clientName" required autocomplete="name" />
	</label>
	{#if form?.fieldErrors?.clientName}
		<p style="color: red">{form.fieldErrors.clientName.join(', ')}</p>
	{/if}

	<label>
		Email
		<input type="email" name="clientEmail" required autocomplete="email" />
	</label>
	{#if form?.fieldErrors?.clientEmail}
		<p style="color: red">{form.fieldErrors.clientEmail.join(', ')}</p>
	{/if}

	<label>
		Phone (optional)
		<input type="tel" name="clientPhone" autocomplete="tel" />
	</label>
	{#if form?.fieldErrors?.clientPhone}
		<p style="color: red">{form.fieldErrors.clientPhone.join(', ')}</p>
	{/if}

	<label>
		Date and time
		<input type="datetime-local" name="startsAt" required />
	</label>
	{#if form?.fieldErrors?.startsAt}
		<p style="color: red">{form.fieldErrors.startsAt.join(', ')}</p>
	{/if}

	<button type="submit">Continue to payment</button>
</form>

{#if form?.message}
	<p style="color: red">{form.message}</p>
{/if}
