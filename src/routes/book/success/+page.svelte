<script lang="ts">
	import { resolve } from '$app/paths';
	import { formatDateTimeInZone } from '$lib/calendar/datetime';
	import { Button, Card, PageHeader } from '$lib/ui';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	function formatWhen(value: Date | string) {
		const d = value instanceof Date ? value : new Date(value);
		return formatDateTimeInZone(d, data.businessTimezone);
	}
</script>

<PageHeader title="Booking confirmed" borderless>
	{#snippet actions()}
		{#if data.isOwner}
			<Button variant="secondary" href={resolve('/dashboard')}>Dashboard</Button>
		{:else}
			<Button variant="secondary" href={resolve('/login')}>admin login</Button>
		{/if}
	{/snippet}
	<p class="book-tagline">Your appointment is booked.</p>
</PageHeader>

<div class="book-success">
	<Card>
		<div class="book-success__body">
			{#if data.appointment}
				<div class="book-success__details">
					<p>
						You're set for <strong>{formatWhen(data.appointment.startsAt)}</strong>.
					</p>
					<p>
						A confirmation email was sent to <strong>{data.appointment.clientEmail}</strong>.
					</p>
					<p>
						The day before your appointment, you'll receive a reminder email with a link to
						confirm your attendance.
					</p>
					<p>We look forward to seeing you.</p>
				</div>
			{:else}
				<p>Thank you for booking with us. Check your email for confirmation details.</p>
			{/if}
			<footer class="book-success__footer">
				<Button variant="secondary" href={resolve('/book')}>Book another appointment</Button>
			</footer>
		</div>
	</Card>
</div>

<style>
	.book-success {
		max-width: min(960px, 100%);
		margin: 0 auto;
	}

	.book-success__body {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 1.25rem;
		padding: 1.25rem;
	}

	.book-success__details {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		margin: 0;
		font-size: var(--text-body-md-size);
		line-height: 1.5;
	}

	.book-success__details p {
		margin: 0;
	}

	.book-success__footer {
		display: flex;
		width: 100%;
		justify-content: flex-end;
		padding-top: 0.25rem;
	}
</style>
