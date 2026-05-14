<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	function asDate(value: Date | string): Date {
		return value instanceof Date ? value : new Date(value);
	}

	function formatWhen(value: Date | string) {
		return asDate(value).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
	}

	function formatMoney(cents: number, currency: string) {
		return new Intl.NumberFormat(undefined, {
			style: 'currency',
			currency: currency.toUpperCase()
		}).format(cents / 100);
	}
</script>

<h1>Appointments</h1>
<p>Signed in. <a href={resolve('/')}>Home</a></p>

{#if data.appointments.length === 0}
	<p>No confirmed appointments yet.</p>
{:else}
	<table border="1" cellpadding="6" cellspacing="0">
		<thead>
			<tr>
				<th>When</th>
				<th>Client</th>
				<th>Email</th>
				<th>Phone</th>
				<th>Amount</th>
			</tr>
		</thead>
		<tbody>
			{#each data.appointments as a (a.id)}
				<tr>
					<td>{formatWhen(a.startsAt)}</td>
					<td>{a.clientName}</td>
					<td>{a.clientEmail}</td>
					<td>{a.clientPhone ?? '—'}</td>
					<td>{formatMoney(a.amountCents, a.currency)}</td>
				</tr>
			{/each}
		</tbody>
	</table>
{/if}

<form method="post" action="?/signOut" use:enhance>
	<button type="submit">Sign out</button>
</form>
