<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
</script>

<h1>Owner login</h1>
<form method="post" action="?/signInEmail" use:enhance>
	<label>
		Email
		<input type="email" name="email" autocomplete="username" />
	</label>
	<label>
		Password
		<input type="password" name="password" autocomplete="current-password" />
	</label>
	<label>
		Name (for registration)
		<input name="name" autocomplete="name" />
	</label>
	<button type="submit">Sign in</button>
	<button type="submit" formaction="?/signUpEmail">Register</button>
</form>
<p style="color: red">{form?.message ?? ''}</p>
<p><a href={resolve('/book')}>Book as a client</a></p>
