# Appointment Web App

## What I'm building

A web-based appointment booking system that lets clients schedule appointments with a business, handles reminders, and collects payment upfront. It's for small service businesses that need to manage bookings, confirmations, cancellations and reschedules. Clients book without authentication, while the business owner manages everything from a logged-in dashboard.

## Core features

- **Appointment scheduling & management** — Clients can book appointments through a simple form; business owner can view, reschedule, and cancel in a status-based dashboard (pending / upcoming / completed / cancelled).
- **Automated reminders & confirmations** — Send email confirmations at booking and reminders before appointments (with personalized details like what to bring).

## What I'm not building

- **Document uploads** — Too much complexity for MVP; clients can bring documents in person.
- **Payment collection at booking** — Collect prepayment or partial deposits via card at the time of booking; automatically send receipts.
- **Apple Pay / Google Pay** — Stick with card-only payments for simplicity; can add more payment methods later.
- **Analytics dashboard** — Not essential for core functionality; business owner can manage bookings from the calendar view.

## Tech stack

SvelteKit + Drizzle + Neon + Better Auth

## Sprint 1 — vertical slice

Build a single happy path that cuts through all layers end-to-end:

- Client fills booking form and submits
- Real Stripe payment is charged
- Confirmation email is sent to client
- Rescheduling and cancellation flows
- Owner sees the appointment in the dashboard

Scope: One appointment type, no reminders yet.

## Sprint 2

Once the core flow works end-to-end:

- Automated reminders before appointments
- Partial deposit option (vs. full prepayment)
- Full status transitions (pending → upcoming → completed → cancelled)

## Nice-to-haves

- Client history & personalization (remember past appointments and preferences)
- Multi-service or multi-staff management (different service types, assign appointments to staff)
- Advanced payment options (installment plans, refund policies)

