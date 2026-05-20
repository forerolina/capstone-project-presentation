<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import { Button, Field, PageHeader } from '$lib/ui';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
</script>

<main class="page">
	<PageHeader
		title="Owner login"
		tagline="Sign in to view and manage upcoming appointments."
		borderless
	/>

	<form method="post" action="?/signInEmail" use:enhance class="stack">
		<Field
			label="Email"
			id="email"
			name="email"
			inputType="email"
			autocomplete="username"
			required
		/>
		<Field
			label="Password"
			id="password"
			name="password"
			inputType="password"
			autocomplete="current-password"
			required
		/>
		<Field label="Name" id="name" name="name" optional autocomplete="name" />

		<div class="login-actions">
			<Button variant="primary" type="submit">Sign in</Button>
			<Button variant="secondary" type="submit" formaction="?/signUpEmail">Register</Button>
		</div>

		{#if form?.message}
			<p class="ui-form-message" role="alert">{form.message}</p>
		{/if}
	</form>

	<p class="footer-links"><a href={resolve('/book')}>Book as a client</a></p>
</main>

<style>
	.login-actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		margin-top: 0.5rem;
	}

	.ui-form-message {
		margin: 0;
		padding: 0.75rem 1rem;
		font-size: var(--text-label-md-size);
		font-weight: 500;
		color: var(--color-on-error-container);
		background: var(--color-error-container);
		border-radius: var(--radius-default);
		border: 1px solid var(--color-error);
	}
</style>
