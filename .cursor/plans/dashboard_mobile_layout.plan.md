---
name: Dashboard mobile layout
overview: Fix the owner dashboard on small screens by replacing the broken WeekCalendar column-stack with horizontal scroll, removing the nested 640px scroll trap, and letting the page header wrap.
todos:
  - id: week-calendar-scroll
    content: "WeekCalendar.svelte: add scroll wrapper, remove 640px column stack, horizontal scroll + no nested max-height at ≤768px"
    status: completed
  - id: dashboard-header-wrap
    content: "dashboard/+page.svelte: flex-wrap on page header main and header actions at ≤48rem"
    status: completed
  - id: dashboard-verify
    content: Manual check /dashboard and modals at 375px and 768px
    status: pending
isProject: false
---

# Fix dashboard mobile layout (minimal)

## Problem diagnosis

The main dashboard ([`src/routes/dashboard/+page.svelte`](src/routes/dashboard/+page.svelte)) is dominated by [`WeekCalendar.svelte`](src/lib/components/WeekCalendar.svelte). On narrow viewports it fails for two reasons:

### 1. Broken `@media (max-width: 640px)` rules in WeekCalendar

Current mobile CSS stacks the calendar vertically:

```243:260:src/lib/components/WeekCalendar.svelte
@media (max-width: 640px) {
  .week-calendar__header {
    grid-template-columns: 1fr;
  }
  .week-calendar__body {
    flex-direction: column;
  }
  ...
}
```

That produces a poor layout:

- Five day headers stack in a single column (not a usable week strip).
- Five day columns stack vertically, each **768px** tall (`12 hours × 64px`).
- `.week-calendar__body` still has `max-height: 640px` and `overflow-y: auto` → a **nested scroll trap** (same class of bug as the old book form `240px` columns).

Between **641px and ~900px**, there is **no** mobile treatment: five columns stay side-by-side in ~100px-wide cells — appointments are unreadable and overflow is clipped (`overflow: hidden` on `.week-calendar`).

### 2. Dashboard header does not wrap

[`PageHeader`](src/lib/ui/PageHeader.svelte) keeps title + add button + Services + Sign out on one row with no `flex-wrap`. On ~375px width, controls compete for space above the calendar.

The toolbar below the header already stacks at `48rem` — that part is fine.

## Approach (industry-standard, minimal)

Same philosophy as the book fix: **one primary scroll context**, no nested panes, no new routes or view modes.

| Approach | Verdict |
|----------|---------|
| Horizontal scroll for week grid on narrow screens | **Yes** — common for week views on mobile |
| Remove broken vertical stack | **Yes** |
| Day-list / single-day picker / new components | **No** — overkill |
| Global layout/token refactor | **No** |

## Implementation

### 1. WeekCalendar — required ([`src/lib/components/WeekCalendar.svelte`](src/lib/components/WeekCalendar.svelte))

**Remove** the entire `@media (max-width: 640px)` block (column stack).

**Add** a single scroll wrapper in markup (one div):

```svelte
<div class="week-calendar">
  <div class="week-calendar__scroll">
    <!-- existing header + body -->
  </div>
</div>
```

**Add** narrow styles (use **`768px`** to align with book/booking breakpoints):

- `.week-calendar__scroll { overflow-x: auto; -webkit-overflow-scrolling: touch; }`
- `.week-calendar__header` and `.week-calendar__body { min-width: min(100%, 36rem); }` (or ~560px — gutter + 5 columns)
- At `max-width: 768px`: `.week-calendar__body { max-height: none; }` — page scroll for height, not 640px inner box

Desktop layout unchanged.

### 2. Dashboard page header — required ([`src/routes/dashboard/+page.svelte`](src/routes/dashboard/+page.svelte))

Scoped CSS only:

```css
@media (max-width: 48rem) {
  :global(.page--wide .ui-page-header__main) {
    flex-wrap: wrap;
  }
  .dashboard-header-actions {
    flex-wrap: wrap;
  }
}
```

### 3. Modals — no extra work

[`Modal.svelte`](src/lib/ui/Modal.svelte) already scrolls on mobile from the book fix.

### 4. Manual verification

At **375px** and **768px** on `/dashboard`:

- Week grid scrolls horizontally; columns readable; Manage works
- Page scrolls vertically (no 640px inner cage)
- Header controls wrap
- Create/manage modals still usable

## Files to change

| File | Change |
|------|--------|
| `WeekCalendar.svelte` | Scroll wrapper; remove 640px stack; horizontal scroll + drop nested max-height on mobile |
| `dashboard/+page.svelte` | Header/actions wrap at `48rem` |

## Out of scope

- Mobile appointment list view
- `/dashboard/services` (already has `36rem` row stack)
- Automated visual tests
