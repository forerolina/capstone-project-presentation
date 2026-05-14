<script lang="ts">
	import { resolve } from '$app/paths';
</script>

<h1>Appointment booking</h1>
<p>Clients book and pay online. Owners manage confirmed appointments after signing in.</p>
<ul>
	<li><a href={resolve('/book')}>Book an appointment</a></li>
	<li><a href={resolve('/login')}>Owner login</a></li>
	<li><a href={resolve('/dashboard')}>Owner dashboard</a></li>
</ul>
