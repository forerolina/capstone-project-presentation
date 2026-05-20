<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import CreateAppointmentModal from '$lib/components/CreateAppointmentModal.svelte';
	import WeekCalendar from '$lib/components/WeekCalendar.svelte';
	import { formatWeekLabel } from '$lib/calendar/week';
	import { Button, PageHeader } from '$lib/ui';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let showCreateModal = $state(false);

	const weekLabel = $derived(formatWeekLabel(data.weekParam, data.businessTimezone));
	const isCurrentWeek = $derived(data.weekParam === data.currentWeek);

	$effect(() => {
		if (form && 'createForm' in form && form.createForm) {
			showCreateModal = true;
		}
	});
</script>

<main class="page page--wide">
	<PageHeader title="Dashboard" borderless>
		{#snippet titleAddon()}
			<button
				type="button"
				class="dashboard-new-appointment"
				aria-label="New appointment"
				onclick={() => (showCreateModal = true)}
			>
				<span class="dashboard-new-appointment__icon" aria-hidden="true">+</span>
				<span class="dashboard-new-appointment__label">New appointment</span>
			</button>
		{/snippet}

		{#snippet actions()}
			<form method="post" action="?/signOut" use:enhance class="dashboard-sign-out">
				<Button variant="secondary" type="submit">Sign out</Button>
			</form>
		{/snippet}

		<div class="dashboard-toolbar">
			<div class="dashboard-toolbar__intro">
				<p class="dashboard-toolbar__tagline text-muted">Manage upcoming bookings</p>
				<nav class="breadcrumb dashboard-toolbar__breadcrumb" aria-label="Breadcrumb">
					<ol>
						<li><a href={resolve('/book')}>Book</a></li>
						<li><span aria-current="page">Dashboard</span></li>
					</ol>
				</nav>
			</div>

			<div class="dashboard-toolbar__actions">
				<nav class="dashboard-week-nav" aria-label="Week navigation">
					<Button
						variant="tertiary"
						href="{resolve('/dashboard')}?week={data.prevWeek}"
						ariaLabel="Previous week"
					>
						&lt;
					</Button>
					<p class="dashboard-week-context text-label-md">{weekLabel}</p>
					<Button
						variant="tertiary"
						href="{resolve('/dashboard')}?week={data.nextWeek}"
						ariaLabel="Next week"
					>
						&gt;
					</Button>
				</nav>

				<Button
					variant="secondary"
					href="{resolve('/dashboard')}?week={data.currentWeek}"
					ariaLabel="Go to current week"
					ariaCurrent={isCurrentWeek ? 'page' : undefined}
					class={isCurrentWeek ? 'dashboard-week-today--current' : ''}
				>
					Today
				</Button>
			</div>
		</div>
	</PageHeader>

	<section class="section" aria-labelledby="calendar-heading">
		<h2 id="calendar-heading" class="visually-hidden">Appointments</h2>
		<WeekCalendar
			weekDays={data.weekDays}
			appointments={data.appointments}
			upcomingAppointments={data.upcomingAppointments}
			week={data.weekParam}
			businessTimezone={data.businessTimezone}
			{form}
		/>
	</section>
</main>

{#if showCreateModal}
	<CreateAppointmentModal
		upcomingAppointments={data.upcomingAppointments}
		services={data.services}
		week={data.weekParam}
		businessTimezone={data.businessTimezone}
		{form}
		onClose={() => (showCreateModal = false)}
	/>
{/if}

<style>
	:global(.page--wide .ui-page-header__main) {
		align-items: center;
	}

	.dashboard-sign-out {
		margin: 0;
	}

	.dashboard-week-nav {
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}

	.dashboard-week-context {
		margin: 0;
		white-space: nowrap;
	}

	.dashboard-toolbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1.5rem;
		width: 100%;
		margin-top: 0.5rem;
	}

	.dashboard-toolbar__intro {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		min-width: 0;
	}

	.dashboard-toolbar__tagline {
		margin: 0;
		font-size: var(--text-body-md-size);
		line-height: var(--text-body-md-line);
	}

	.dashboard-toolbar__breadcrumb :global(ol) {
		margin: 0;
	}

	.dashboard-toolbar__actions {
		display: flex;
		align-items: center;
		gap: 1rem 1.5rem;
		flex-shrink: 0;
	}

	.dashboard-new-appointment {
		position: relative;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		width: 2.25rem;
		height: 2.25rem;
		padding: 0;
		border: none;
		border-radius: var(--radius-full);
		background: var(--gradient-primary);
		color: var(--color-on-primary);
		font: inherit;
		cursor: pointer;
		box-shadow: 0 2px 12px rgba(0, 103, 127, 0.25);
	}

	.dashboard-new-appointment:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
	}

	.dashboard-new-appointment:hover {
		filter: brightness(1.05);
	}

	.dashboard-new-appointment__icon {
		font-size: 1.375rem;
		font-weight: 300;
		line-height: 1;
	}

	.dashboard-new-appointment__label {
		position: absolute;
		top: calc(100% + 0.4rem);
		left: 50%;
		z-index: 1;
		padding: 0.35rem 0.55rem;
		border-radius: var(--radius-sm);
		background: var(--color-inverse-surface);
		color: var(--color-inverse-on-surface);
		font-size: 0.8125rem;
		font-weight: 500;
		line-height: 1.2;
		white-space: nowrap;
		pointer-events: none;
		opacity: 0;
		transform: translateX(-50%) translateY(-2px);
		transition:
			opacity 0.15s ease,
			transform 0.15s ease;
	}

	.dashboard-new-appointment:hover .dashboard-new-appointment__label,
	.dashboard-new-appointment:focus-visible .dashboard-new-appointment__label {
		opacity: 1;
		transform: translateX(-50%) translateY(0);
	}

	:global(.dashboard-week-today--current) {
		opacity: 0.45;
		pointer-events: none;
	}

	@media (max-width: 48rem) {
		.dashboard-toolbar {
			flex-direction: column;
			align-items: stretch;
		}

		.dashboard-toolbar__actions {
			flex-wrap: wrap;
			justify-content: flex-end;
		}
	}
</style>
