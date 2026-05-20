<script lang="ts">
	import { wallClockToDate, type DateKey } from '$lib/calendar/datetime';
	import { isWorkingDay } from '$lib/calendar/week';
	import Button from './Button.svelte';

	let {
		viewMonthKey = $bindable(),
		selectedDateKey = $bindable(),
		businessTimezone,
		todayKey,
		monthGridDayKeys,
		monthLabel,
		onShiftMonth,
		dateError
	}: {
		viewMonthKey: DateKey;
		selectedDateKey: DateKey;
		businessTimezone: string;
		todayKey: DateKey;
		monthGridDayKeys: DateKey[];
		monthLabel: string;
		onShiftMonth: (months: number) => void;
		dateError?: string | string[];
	} = $props();

	function isPastDay(dayKey: DateKey): boolean {
		return dayKey < todayKey;
	}

	function isUnavailableDay(dayKey: DateKey): boolean {
		return isPastDay(dayKey) || !isWorkingDay(dayKey);
	}

	function isCurrentMonth(dayKey: DateKey): boolean {
		return dayKey.slice(0, 7) === viewMonthKey.slice(0, 7);
	}

	function selectDay(dayKey: DateKey) {
		if (isUnavailableDay(dayKey)) return;
		selectedDateKey = dayKey;
	}

	function formatDayAriaLabel(dayKey: DateKey): string {
		const dateLabel = wallClockToDate(dayKey, '12:00', businessTimezone).toLocaleDateString(
			undefined,
			{
				timeZone: businessTimezone,
				weekday: 'long',
				month: 'short',
				day: 'numeric'
			}
		);
		if (isPastDay(dayKey)) return `${dateLabel}, unavailable`;
		if (!isWorkingDay(dayKey)) return `${dateLabel}, closed`;
		if (!isCurrentMonth(dayKey)) return `${dateLabel}, outside current month`;
		return dateLabel;
	}

	const errorText = $derived(
		dateError ? (Array.isArray(dateError) ? dateError.join(', ') : dateError) : undefined
	);
</script>

<div class="month-picker">
	<div class="month-picker__nav">
		<Button
			variant="tertiary"
			type="button"
			ariaLabel="Previous month"
			onclick={() => onShiftMonth(-1)}
		>
			&lt;
		</Button>
		<p class="month-picker__label text-label-md">{monthLabel}</p>
		<Button variant="tertiary" type="button" ariaLabel="Next month" onclick={() => onShiftMonth(1)}>
			&gt;
		</Button>
	</div>

	<div class="month-picker__grid" role="grid" aria-label="Calendar">
		<div class="month-picker__weekdays" aria-hidden="true">
			{#each ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as label}
				<span class="month-picker__weekday" role="columnheader">{label}</span>
			{/each}
		</div>
		<div class="month-picker__days">
			{#each monthGridDayKeys as dayKey (dayKey)}
				{@const inMonth = isCurrentMonth(dayKey)}
				{@const past = isPastDay(dayKey)}
				{@const closed = !isWorkingDay(dayKey)}
				{@const unavailable = past || closed}
				{@const selected = dayKey === selectedDateKey}
				{@const today = dayKey === todayKey}
				<button
					type="button"
					role="gridcell"
					class="month-picker__day"
					class:month-picker__day--outside={!inMonth}
					class:month-picker__day--past={unavailable}
					class:month-picker__day--selected={selected}
					class:month-picker__day--today={today}
					disabled={unavailable}
					aria-disabled={unavailable ? 'true' : undefined}
					aria-label={formatDayAriaLabel(dayKey)}
					aria-selected={selected}
					aria-current={today ? 'date' : undefined}
					onclick={() => selectDay(dayKey)}
				>
					{Number(dayKey.split('-')[2])}
				</button>
			{/each}
		</div>
	</div>

	{#if errorText}
		<p class="month-picker__error" role="alert">{errorText}</p>
	{/if}
</div>

<style>
	.month-picker__nav {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 0.75rem;
	}

	.month-picker__label {
		margin: 0;
	}

	.month-picker__grid {
		display: grid;
		grid-template-columns: repeat(7, minmax(0, 1fr));
		gap: 2px;
		width: 100%;
	}

	.month-picker__weekdays,
	.month-picker__days {
		display: contents;
	}

	.month-picker__weekday {
		display: flex;
		align-items: center;
		justify-content: center;
		min-width: 0;
		padding: 0 0 0.25rem;
		font-size: 0.625rem;
		font-weight: 600;
		text-transform: uppercase;
		color: var(--color-on-surface-variant);
		line-height: 1;
	}

	.month-picker__day {
		width: 100%;
		min-width: 0;
		aspect-ratio: 1;
		padding: 0;
		border: 1px solid transparent;
		border-radius: var(--radius-full);
		background: transparent;
		font: inherit;
		font-size: 0.8125rem;
		font-weight: 500;
		line-height: 1;
		cursor: pointer;
		color: var(--color-on-surface);
		transition:
			background 0.15s ease,
			color 0.15s ease,
			border-color 0.15s ease,
			box-shadow 0.15s ease,
			transform 0.12s ease;
	}

	.month-picker__day:focus-visible {
		outline: none;
		border-color: rgba(0, 103, 127, 0.35);
		box-shadow: var(--focus-ring);
	}

	/* Adjacent-month days (still selectable) — secondary text per DESIGN.md */
	.month-picker__day--outside:not(:disabled):not(.month-picker__day--selected) {
		color: var(--color-on-surface-variant);
	}

	/* Past / disabled — muted but readable; no hover affordance */
	.month-picker__day--past,
	.month-picker__day:disabled {
		color: var(--color-outline);
		opacity: 1;
		cursor: not-allowed;
	}

	.month-picker__day--past:hover,
	.month-picker__day:disabled:hover {
		background: transparent;
		border-color: transparent;
		box-shadow: none;
		transform: none;
	}

	.month-picker__day--today:not(.month-picker__day--selected):not(:disabled) {
		background: var(--color-primary-fixed);
		color: var(--color-on-primary-container);
		border-color: rgba(0, 103, 127, 0.2);
		font-weight: 600;
	}

	.month-picker__day--selected {
		background: var(--color-primary);
		color: var(--color-on-primary);
		border-color: transparent;
		font-weight: 600;
	}

	/* Hover: primary tint + ghost border — lifts per DESIGN.md glass interaction */
	.month-picker__day:not(:disabled):not(.month-picker__day--selected):hover {
		background: var(--color-primary-fixed);
		color: var(--color-on-primary-container);
		border-color: rgba(0, 103, 127, 0.3);
		box-shadow: 0 0 0 2px rgba(76, 214, 255, 0.25);
	}

	.month-picker__day--today:not(.month-picker__day--selected):not(:disabled):hover {
		background: var(--color-primary-fixed-dim);
		border-color: rgba(0, 103, 127, 0.45);
		box-shadow: var(--focus-ring);
	}

	.month-picker__day--selected:hover {
		filter: brightness(1.08);
		box-shadow: 0 2px 12px rgba(0, 103, 127, 0.35);
	}

	.month-picker__day:not(:disabled):not(.month-picker__day--selected):active {
		transform: scale(0.94);
		background: var(--color-primary-fixed-dim);
	}

	.month-picker__error {
		margin: 0.5rem 0 0;
		font-size: var(--text-label-md-size);
		color: var(--color-on-error-container);
	}
</style>
