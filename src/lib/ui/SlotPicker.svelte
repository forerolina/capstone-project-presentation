<script lang="ts">
	import { formatTimeInZone } from '$lib/calendar/datetime';
	import { groupSlotsByPeriod, type SlotPeriod } from '$lib/booking/slots-ui';

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

	const periodLabels: Record<SlotPeriod, string> = {
		morning: 'Morning',
		afternoon: 'Afternoon',
		evening: 'Evening'
	};

	const groupedSlots = $derived(groupSlotsByPeriod(slots, businessTimezone));

	const visiblePeriods = $derived(
		(['morning', 'afternoon', 'evening'] as const).filter(
			(period) => groupedSlots[period].length > 0
		)
	);

	function selectSlot(slot: Date) {
		selectedSlot = slot;
	}

	const errorText = $derived(
		timeError ? (Array.isArray(timeError) ? timeError.join(', ') : timeError) : undefined
	);
</script>

<section class="slot-picker" aria-label="Available times">
	<h3 class="slot-picker__title text-label-md">{dayLabel}</h3>

	{#if slots.length === 0}
		<p class="slot-picker__empty text-muted">No open times on this day.</p>
	{:else}
		<div class="slot-picker__periods">
			{#each visiblePeriods as period (period)}
				{@const periodSlots = groupedSlots[period]}
				{@const periodId = `slot-picker-${period}`}
				<section class="slot-picker__period" aria-labelledby={periodId}>
					<h4 id={periodId} class="slot-picker__period-title">{periodLabels[period]}</h4>
					<ul class="slot-picker__list" aria-labelledby={periodId}>
						{#each periodSlots as slot (slot.getTime())}
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
						{/each}
					</ul>
				</section>
			{/each}
		</div>
	{/if}

	{#if errorText}
		<p class="slot-picker__error" role="alert">{errorText}</p>
	{/if}
</section>

<style>
	.slot-picker {
		container-type: inline-size;
	}

	.slot-picker__title {
		margin: 0 0 0.75rem;
		color: var(--color-primary);
	}

	.slot-picker__periods {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		min-height: 8rem;
		max-height: min(420px, 50vh);
		overflow-y: auto;
	}

	.slot-picker__period-title {
		margin: 0 0 0.5rem;
		font-size: var(--text-label-md-size);
		font-weight: 600;
		color: var(--color-primary);
	}

	.slot-picker__list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 0.375rem;
	}

	@container (min-width: 240px) {
		.slot-picker__list {
			grid-template-columns: repeat(3, minmax(0, 1fr));
		}
	}

	@container (min-width: 320px) {
		.slot-picker__list {
			grid-template-columns: repeat(4, minmax(0, 1fr));
		}
	}

	@container (min-width: 400px) {
		.slot-picker__list {
			grid-template-columns: repeat(5, minmax(0, 1fr));
		}
	}

	.slot-picker__empty {
		margin: 0;
		font-size: 0.8125rem;
	}

	.slot-picker__btn {
		display: block;
		width: 100%;
		padding: 0.375rem 0.25rem;
		border: var(--ghost-border);
		border-radius: var(--radius-full);
		background: var(--glass-bg);
		backdrop-filter: blur(var(--glass-blur-sm));
		color: var(--color-primary);
		font: inherit;
		font-size: 0.75rem;
		line-height: 1.2;
		white-space: normal;
		min-height: 2.75rem;
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

	@container (min-width: 320px) {
		.slot-picker__btn {
			font-size: var(--text-body-md-size);
			padding: 0.5rem 0.375rem;
		}
	}
</style>
