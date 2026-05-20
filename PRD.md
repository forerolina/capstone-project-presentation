# Appointment Web App

## What I'm building

A web-based appointment booking system that lets clients schedule appointments with a business and handles reminders. It's for small service businesses that need to manage bookings, confirmations, cancellations, and reschedules. Clients book without authentication, while the business owner manages everything from a logged-in dashboard.

## Core features

- **Appointment scheduling & management** — Clients can book appointments through a simple form; business owner can view, reschedule, cancel, and manually create appointments from a week-view dashboard.
- **Automated reminders & confirmations** — Send email confirmations at booking and reminders before appointments (with personalized prep notes). Clients can confirm attendance from the reminder email link.

## What I'm not building

- **Document uploads** — Too much complexity for MVP; clients can bring documents in person.
- **Online payments** — Out of scope for MVP; clients pay in person if needed.
- **Analytics dashboard** — Not essential for core functionality; the calendar view covers day-to-day management.

## Tech stack

SvelteKit + Drizzle + Neon + Better Auth + Resend

## Sprint 1 — vertical slice

Build a single happy path that cuts through all layers end-to-end:

- ✅ Client fills booking form and submits (service, date, time, contact info)
- ✅ Slot conflict detection prevents double-booking
- ✅ Appointment saved to database (`upcoming` status)
- ✅ Confirmation email sent to client via Resend
- ✅ Owner sees the appointment in the week-view dashboard
- ✅ Cancel and reschedule flows from the dashboard

## Sprint 2

- ✅ Owner can manually send reminder emails from the dashboard
- ✅ Reminder email includes a confirmation link unique to the appointment
- ✅ Client confirmation page — client clicks link to confirm attendance
- ✅ Owner can create appointments directly from the dashboard
- ⏳ Automatic (scheduled) reminder sending — currently owner-triggered
- ⏳ `completed` appointment status (currently: `upcoming` / `cancelled` only)

## Nice-to-haves

- Client history and personalization (remember past appointments and preferences)
- Multi-service or multi-staff management (different service types, assign to staff)
- Online payments at booking time
- Automated reminder scheduling (time-based trigger, no manual step)
