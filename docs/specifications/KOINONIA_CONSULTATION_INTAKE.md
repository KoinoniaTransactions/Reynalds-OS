# Koinonia Consultation Intake Flow

Status: Active implementation
Date: 2026-07-14

## Purpose

The Schedule a Consultation experience should keep clients on the website instead of sending them to their email application.

## Current Flow

1. Visitor lands on `/contact#schedule-consultation`.
2. The Contact page shows a compact Schedule a Consultation CTA block.
3. Visitor opens the scheduler popup.
4. Visitor chooses the support type inside the popup.
5. Visitor enters name, email, phone, requested weekday date, requested time window, and notes.
6. The form submits to `/api/koinonia/consultation`.
7. The API emails the request to `jeremiah@koinoniaadmin.com` once email delivery is configured.
8. The visitor sees a confirmation or error message.

## Consultation Window

Consultations are currently available Monday-Friday, 9:00 AM-5:00 PM.

The visible Contact page should keep this information compact. Do not make the availability display a bulky header or repeated card section.

## Email Delivery

The API is prepared for Resend email delivery.

Required production environment variable:

- `RESEND_API_KEY`

Optional production environment variables:

- `CONTACT_INTAKE_TO_EMAIL`
- `CONTACT_INTAKE_FROM_EMAIL`

Default recipient:

- `jeremiah@koinoniaadmin.com`

Default sender:

- `Koinonia <noreply@koinoniatransactions.com>`

The sender domain must be configured with the email provider before live production email delivery.

## Design Direction

- Keep the Contact page focused on phone, email, text, and one compact scheduler CTA
- Keep support-type selection inside the popup
- Do not reintroduce the five large consultation cards
- Do not reintroduce the bulky availability/header panel
- Avoid temporary-sounding language such as “confirmed by Koinonia”
- Avoid visible “preferred” wording in the scheduler copy
