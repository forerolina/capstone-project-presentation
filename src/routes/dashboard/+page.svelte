<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import CreateAppointmentModal from '$lib/components/CreateAppointmentModal.svelte';
	import WeekCalendar from '$lib/components/WeekCalendar.svelte';
	import { formatWeekLabel } from '$lib/calendar/week';
	import { Button, HeaderAddButton, PageHeader } from '$lib/ui';
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
			<HeaderAddButton label="New appointment" onclick={() => (showCreateModal = true)} />
		{/snippet}

		{#snippet actions()}
			<div class="dashboard-header-actions dashboard-header-actions--wide">
				<Button
					variant="secondary"
					href={resolve('/dashboard/services')}
					class="dashboard-header-services">Services</Button
				>
				<form method="post" action="?/signOut" use:enhance class="dashboard-sign-out">
					<Button variant="secondary" type="submit" class="dashboard-header-sign-out"
						>Sign out</Button
					>
				</form>
			</div>
			<form method="post" action="?/signOut" use:enhance class="dashboard-sign-out dashboard-header-actions--narrow">
				<Button variant="secondary" type="submit" class="dashboard-header-sign-out"
					>Sign out</Button
				>
			</form>
		{/snippet}

		<div class="dashboard-toolbar">
			<div class="dashboard-toolbar__meta">
				<div class="dashboard-toolbar__intro">
					<p class="dashboard-toolbar__tagline text-muted">Manage upcoming bookings</p>
					<nav class="breadcrumb dashboard-toolbar__breadcrumb" aria-label="Breadcrumb">
						<ol>
							<li><a href={resolve('/book')}>Book</a></li>
							<li><span aria-current="page">Dashboard</span></li>
						</ol>
					</nav>
				</div>
				<div class="dashboard-toolbar__services-slot">
					<Button
						variant="secondary"
						href={resolve('/dashboard/services')}
						class="dashboard-toolbar__services">Services</Button
					>
				</div>
			</div>

			<div class="dashboard-toolbar__week">
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
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 0.5rem 1rem;
	}

	:global(.page--wide .ui-page-header__text) {
		flex: 1 1 auto;
		min-width: 0;
	}

	:global(.page--wide .ui-page-header__actions) {
		flex: 0 0 auto;
		margin-left: auto;
	}

	.dashboard-header-actions {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		justify-content: flex-end;
		gap: 0.5rem;
	}

	.dashboard-header-actions--wide {
		display: none;
	}

	.dashboard-header-actions--narrow {
		display: block;
	}

	.dashboard-sign-out {
		margin: 0;
	}

	:global(.dashboard-header-sign-out),
	:global(.dashboard-header-services) {
		white-space: nowrap;
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
		flex-direction: column;
		gap: 0.75rem;
		width: 100%;
		margin-top: 0.5rem;
	}

	.dashboard-toolbar__meta {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 1rem;
	}

	.dashboard-toolbar__services-slot {
		flex-shrink: 0;
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

	.dashboard-toolbar__week {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		flex-wrap: wrap;
		gap: 1rem 1.5rem;
	}

	:global(.dashboard-week-today--current) {
		opacity: 0.45;
		pointer-events: none;
	}

	@media (min-width: 48rem) {
		:global(.page--wide .ui-page-header) {
			display: grid;
			grid-template-columns: 1fr auto;
			grid-template-rows: auto auto;
			align-items: start;
			column-gap: 1.5rem;
			row-gap: 0.75rem;
		}

		:global(.page--wide .ui-page-header__main) {
			grid-column: 1 / -1;
			grid-row: 1;
		}

		.dashboard-header-actions--wide {
			display: flex;
		}

		.dashboard-header-actions--narrow {
			display: none;
		}

		.dashboard-toolbar__services-slot {
			display: none;
		}

		.dashboard-toolbar {
			grid-column: 1 / -1;
			grid-row: 2;
			flex-direction: row;
			align-items: center;
			justify-content: space-between;
			flex-wrap: nowrap;
			gap: 1rem 2rem;
			margin-top: 0;
		}

		.dashboard-toolbar__meta {
			flex: 0 1 auto;
			justify-content: flex-start;
		}

		.dashboard-toolbar__week {
			justify-content: flex-end;
			flex: 0 0 auto;
			margin-left: auto;
		}
	}
</style>
