# Preservation Map

## Preserved as canonical working baseline

- `apps/web/app/koinonia/page.tsx`
- `apps/web/app/koinonia/services/page.tsx`
- `apps/web/app/koinonia/about/page.tsx`
- `apps/web/app/koinonia/contact/page.tsx`
- `apps/web/components/site/PageAssemblies/KoinoniaHome.tsx`
- `apps/web/components/site/PageAssemblies/KoinoniaServices.tsx`
- `apps/web/components/site/PageAssemblies/KoinoniaAbout.tsx`
- `apps/web/components/site/PageAssemblies/KoinoniaContact.tsx`
- `apps/web/components/site/ContactActions/ContactActions.tsx`
- `apps/web/config/contact.config.ts`

## Preserved as recovery snapshot, not yet integrated

- `RECOVERY_AUDIT/source_snapshots/v11_3_0_services_pricing/app_koinonia/`
- `RECOVERY_AUDIT/source_snapshots/v11_3_0_services_pricing/components_site/`
- `archives/source_repositories/Reynalds_OS_v11_3_0_Koinonia_Services_Pricing_Assembly.zip`

## Why not immediately merge v11.3.0?

The v11.2.1 and v11.3.0 website code use different component structures. Immediate overwrite could break the contact/about/home work. The correct approach is to preserve v11.3.0, run the app, then reconcile intentionally.
