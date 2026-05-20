<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button, Field, PageHeader } from '$lib/ui';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
</script>

<main class="page">
	<PageHeader title="Login" borderless />

	<form method="post" action="?/signInEmail" use:enhance class="stack">
		<Field label="Email" id="demo-email" name="email" inputType="email" required />
		<Field label="Password" id="demo-password" name="password" inputType="password" required />
		<Field label="Name" id="demo-name" name="name" optional />

		<div class="login-actions">
			<Button variant="primary" type="submit">Login</Button>
			<Button variant="secondary" type="submit" formaction="?/signUpEmail">Register</Button>
		</div>

		{#if form?.message}
			<p class="ui-form-message" role="alert">{form.message}</p>
		{/if}
	</form>
</main>

<style>
	.login-actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
	}

	.ui-form-message {
		margin: 0;
		padding: 0.75rem 1rem;
		color: var(--color-on-error-container);
		background: var(--color-error-container);
		border-radius: var(--radius-default);
	}
</style>
