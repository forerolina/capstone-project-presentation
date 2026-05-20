<script lang="ts">
	import { formatTimeInZone } from '$lib/calendar/datetime';

	let {
		slots,
		selectedSlot = $bindable(null as Date | null),
		businessTimezone,
		dayLabel,
		timeError
	}: {
		slots: Date[];
		selectedSlot?: Date | null;
		businessTimezone: string;
		dayLabel: string;
		timeError?: string | string[];
	} = $props();

	function selectSlot(slot: Date) {
		selectedSlot = slot;
	}

	const errorText = $derived(
		timeError ? (Array.isArray(timeError) ? timeError.join(', ') : timeError) : undefined
	);
</script>

<section class="slot-picker" aria-label="Available times">
	<h3 class="slot-picker__title text-label-md">{dayLabel}</h3>
	<ul class="slot-picker__list">
		{#each slots as slot (slot.getTime())}
			{@const pressed = selectedSlot?.getTime() === slot.getTime()}
			<li>
				<button
					type="button"
					class="slot-picker__btn"
					class:slot-picker__btn--selected={pressed}
					aria-pressed={pressed}
					onclick={() => selectSlot(slot)}
				>
					{formatTimeInZone(slot, businessTimezone)}
				</button>
			</li>
		{:else}
			<li class="slot-picker__empty text-muted">No open times on this day.</li>
		{/each}
	</ul>
	{#if errorText}
		<p class="slot-picker__error" role="alert">{errorText}</p>
	{/if}
</section>

<style>
	.slot-picker__title {
		margin: 0 0 0.75rem;
		color: var(--color-primary);
	}

	.slot-picker__list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.slot-picker__empty {
		font-size: 0.8125rem;
		list-style: none;
	}

	.slot-picker__btn {
		display: block;
		width: 100%;
		padding: 0.5rem 0.75rem;
		border: var(--ghost-border);
		border-radius: var(--radius-full);
		background: var(--glass-bg);
		backdrop-filter: blur(var(--glass-blur-sm));
		color: var(--color-primary);
		font: inherit;
		font-size: var(--text-body-md-size);
		cursor: pointer;
		text-align: center;
		transition:
			background 0.12s ease,
			color 0.12s ease,
			border-color 0.12s ease;
	}

	.slot-picker__btn:hover:not(.slot-picker__btn--selected) {
		background: var(--color-primary-fixed);
		color: var(--color-on-primary-container);
		border-color: rgba(0, 103, 127, 0.35);
		box-shadow: 0 0 0 2px rgba(76, 214, 255, 0.25);
	}

	.slot-picker__btn:focus-visible {
		outline: none;
		border-color: rgba(0, 103, 127, 0.35);
		box-shadow: var(--focus-ring);
	}

	.slot-picker__btn--selected {
		background: var(--color-primary);
		border-color: var(--color-primary);
		color: var(--color-on-primary);
	}

	.slot-picker__btn--selected:hover {
		filter: brightness(1.08);
		box-shadow: 0 2px 12px rgba(0, 103, 127, 0.35);
	}

	.slot-picker__btn:active:not(.slot-picker__btn--selected) {
		background: var(--color-primary-fixed-dim);
		transform: scale(0.98);
	}

	.slot-picker__error {
		margin: 0.5rem 0 0;
		font-size: var(--text-label-md-size);
		color: var(--color-on-error-container);
	}
</style>
