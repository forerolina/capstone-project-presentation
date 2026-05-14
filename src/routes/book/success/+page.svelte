<script lang="ts">
	import type { PageData } from './$types';
	import { resolve } from '$app/paths';

	let { data }: { data: PageData } = $props();
</script>

<h1>Payment submitted</h1>
<p>Thanks — if payment succeeded, you will receive a confirmation email shortly.</p>
{#if data.sessionId}
	<p style="font-size: small; color: #555">Reference: {data.sessionId}</p>
{/if}
<p><a href={resolve('/book')}>Book another</a> · <a href={resolve('/')}>Home</a></p>
