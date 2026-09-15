# W6 Visual QA Environment Limitation — 2026-09-15

This note records an execution-environment limitation encountered while beginning W6 visual QA.

- The current non-production `main` Vercel deployment is READY.
- Vercel Authentication protects the preview.
- The available Vercel fetch path can validate deployment/build state but does not provide rendered viewport screenshots.
- The local container used for browser rendering has no external DNS/network access, so Chromium cannot load the protected Vercel preview.
- Therefore W6 must not be marked complete solely from build output or static code inspection.

A static responsive/CSS audit may still identify and fix clear visual regressions, but final W6 completion requires actual rendered viewport inspection at representative desktop/mobile widths.

Production remains untouched.