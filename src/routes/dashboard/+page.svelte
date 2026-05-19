<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import WeekCalendar from '$lib/components/WeekCalendar.svelte';
	import { formatWeekLabel } from '$lib/calendar/week';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	const weekMonday = $derived(new Date(data.weekStart));
	const weekLabel = $derived(formatWeekLabel(weekMonday));
</script>

<main class="page page--wide">
	<header class="page-header">
		<h1>Dashboard</h1>
		<p>Week view · <a href={resolve('/')}>Back to home</a></p>
	</header>

	<nav class="calendar-nav" aria-label="Week navigation">
		<a href="{resolve('/dashboard')}?week={data.prevWeek}">← Previous week</a>
		<span class="calendar-nav-label">{weekLabel}</span>
		<a href="{resolve('/dashboard')}?week={data.nextWeek}">Next week →</a>
		<a href="{resolve('/dashboard')}?week={data.currentWeek}" class="calendar-nav-today">Today</a>
	</nav>

	<section class="section" aria-labelledby="calendar-heading">
		<h2 id="calendar-heading" class="section-title">Appointments</h2>
		<WeekCalendar
			weekDays={data.weekDays}
			appointments={data.appointments}
			week={data.weekParam}
			{form}
		/>
	</section>

	<form method="post" action="?/signOut" use:enhance>
		<button type="submit">Sign out</button>
	</form>
</main>
