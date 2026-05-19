<script lang="ts">
	import { resolve } from '$app/paths';
</script>

<main class="page">
	<header class="page-header">
		<h1>Appointment booking</h1>
		<p>
			For small service businesses: clients schedule without an account. You manage upcoming
			bookings from a secure dashboard.
		</p>
	</header>

	<section class="section" aria-labelledby="nav-heading">
		<h2 id="nav-heading" class="section-title">Get started</h2>
		<ul class="nav-links">
			<li><a href={resolve('/book')}>Book an appointment</a></li>
			<li><a href={resolve('/login')}>Owner login</a></li>
			<li><a href={resolve('/dashboard')}>Owner dashboard</a></li>
		</ul>
	</section>
</main>
