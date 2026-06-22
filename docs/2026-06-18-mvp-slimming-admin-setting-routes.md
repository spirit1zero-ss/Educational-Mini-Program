# 2026-06-18 MVP admin setting route audit

## Scope

This note records the admin frontend setting-route cleanup for MVP slimming. It hides disabled setting entries in the admin SPA router; it does not delete backend code, change menus in the database, change payment, or change order behavior.

## Change

- `src/CRMEB/CRMEB-master/template/admin/src/router/modules/setting.js`
  - Imports the existing MVP switch helper.
  - Converts the router object to `settingRouter`.
  - Filters disabled MVP setting children when `MVP_ENABLED=true`.

## Hidden Admin Setting Entries

The filter hides routes related to:

- Logistics configuration and freight templates.
- City-data maintenance used by freight templates.
- Electronic invoice configuration.
- Page DIY and theme/micro-page tooling.
- Customer-service configuration pages.
- External API/account pages.
- Receipt printer pages.

## Preserved

The filter keeps core admin setting routes and MVP-required routes, including:

- System configuration basics.
- Member and membership configuration.
- Sign-in configuration.
- Core user, product, order, assessment, distribution, and commission modules.

## Validation

Admin build:

```bash
cd src/CRMEB/CRMEB-master/template/admin
npm run build
```

Result: build passed. Existing CSS order and asset-size warnings remain.

## Risk Notes

- The filter is path/auth-pattern based, so future setting routes should be reviewed before adding broad blocked patterns.
- Backend route blocking remains the source of truth for disabled APIs; this frontend filter only removes visible SPA entries.
