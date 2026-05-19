<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
</script>

<main class="page">
	<header class="page-header">
		<h1>Owner login</h1>
		<p>Sign in to view and manage upcoming appointments.</p>
	</header>

	<form method="post" action="?/signInEmail" use:enhance class="stack">
		<div class="field">
			<label for="email">Email</label>
			<input id="email" type="email" name="email" autocomplete="username" />
		</div>
		<div class="field">
			<label for="password">Password</label>
			<input id="password" type="password" name="password" autocomplete="current-password" />
		</div>
		<div class="field">
			<label for="name">Name <span class="meta">(for registration)</span></label>
			<input id="name" name="name" autocomplete="name" />
		</div>
		<div class="actions">
			<button type="submit">Sign in</button>
			<button type="submit" class="secondary" formaction="?/signUpEmail">Register</button>
		</div>
		{#if form?.message}
			<p class="form-message" role="alert">{form.message}</p>
		{/if}
	</form>

	<p class="footer-links"><a href={resolve('/book')}>Book as a client</a></p>
</main>
