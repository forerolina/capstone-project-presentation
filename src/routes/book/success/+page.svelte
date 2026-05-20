<script lang="ts">
	import { formatDateTimeInZone } from '$lib/calendar/datetime';
	import { PageHeader } from '$lib/ui';
	import type { PageData } from './$types';
	import { resolve } from '$app/paths';

	let { data }: { data: PageData } = $props();

	function formatWhen(value: Date | string) {
		const d = value instanceof Date ? value : new Date(value);
		return formatDateTimeInZone(d, data.businessTimezone);
	}
</script>

<main class="page">
	<PageHeader title="Booking confirmed" borderless>
		{#if data.appointment}
			<p class="text-muted">
				You're set for {formatWhen(data.appointment.startsAt)}. A confirmation email was sent to
				{data.appointment.clientEmail}.
			</p>
		{:else}
			<p class="text-muted">
				Your appointment is booked. Check your email for confirmation details.
			</p>
		{/if}
	</PageHeader>

	<p class="footer-links">
		<a href={resolve('/book')}>Book another appointment</a>
	</p>
</main>
