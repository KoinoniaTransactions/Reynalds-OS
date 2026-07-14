# ConsultationIntake Component

Status: Active
Date: 2026-07-14

## Purpose

Provides the public Koinonia consultation scheduler popup used from the Contact page compact consultation CTA.

## Current Behavior

- Keeps the Contact page clean with a small Schedule a Consultation CTA block
- Opens a modal instead of sending the visitor to an email application
- Lets the visitor choose the support type inside the popup
- Shows a short summary for the selected support type
- Collects name, email, phone, requested weekday date, requested time window, and notes
- Submits to `/api/koinonia/consultation`
- Shows success, submitting, and error states
- Prevents weekend consultation date submissions
- Includes a honeypot field for simple spam reduction

## Email Delivery

The API route is prepared for Resend email delivery.

Required production environment variable:

- `RESEND_API_KEY`

Default recipient:

- `jeremiah@koinoniaadmin.com`

Optional production environment variables:

- `CONTACT_INTAKE_TO_EMAIL`
- `CONTACT_INTAKE_FROM_EMAIL`

## Design Rule

The Contact page should not become a second services page. Keep the visible scheduler area compact, and keep the support-type selection inside the popup.
