<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import WeekCalendar from '$lib/components/WeekCalendar.svelte';
	import { formatWeekLabel } from '$lib/calendar/week';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	const weekMonday = $derived(new Date(data.weekStart));
	const weekLabel = $derived(formatWeekLabel(weekMonday));
	const isCurrentWeek = $derived(data.weekParam === data.currentWeek);
</script>

<main class="page page--wide">
	<header class="page-header page-header--dashboard">
		<div class="dashboard-top-bar">
			<nav class="breadcrumb" aria-label="Breadcrumb">
				<ol>
					<li><a href={resolve('/')}>Home</a></li>
					<li><span aria-current="page">Dashboard</span></li>
				</ol>
			</nav>

			<form method="post" action="?/signOut" class="dashboard-sign-out" use:enhance>
				<button type="submit" class="secondary">Sign out</button>
			</form>
		</div>

		<div class="dashboard-heading">
			<h1>Dashboard</h1>

			<div class="dashboard-week-controls">
				<a
					href="{resolve('/dashboard')}?week={data.currentWeek}"
					class="button dashboard-week-today"
					class:dashboard-week-today--current={isCurrentWeek}
					aria-label="Go to current week"
					aria-current={isCurrentWeek ? 'page' : undefined}
				>
					Today
				</a>

				<nav class="dashboard-week-nav" aria-label="Week navigation">
					<a
						href="{resolve('/dashboard')}?week={data.prevWeek}"
						class="dashboard-week-chevron"
						aria-label="Previous week"
					>
						&lt;
					</a>
					<p class="dashboard-week-context">{weekLabel}</p>
					<a
						href="{resolve('/dashboard')}?week={data.nextWeek}"
						class="dashboard-week-chevron"
						aria-label="Next week"
					>
						&gt;
					</a>
				</nav>
			</div>
		</div>

		<p class="page-header-tagline">Manage upcoming bookings</p>
	</header>

	<section class="section" aria-labelledby="calendar-heading">
		<h2 id="calendar-heading" class="visually-hidden">Appointments</h2>
		<WeekCalendar
			weekDays={data.weekDays}
			appointments={data.appointments}
			upcomingAppointments={data.upcomingAppointments}
			week={data.weekParam}
			{form}
		/>
	</section>
</main>
