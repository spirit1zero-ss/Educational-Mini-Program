# 2026-06-18 MVP background settings routing audit
## scope
This article records the cleanup of backend and frontend routing settings during MVP slimming. In this round, the disabled setting entrance is hidden in the background SPA routing, and the back-end code is not deleted, the database menu is not modified, the payment is not modified, and the order behavior is not modified.
## Change
- `src/CRMEB/CRMEB-master/template/admin/src/router/modules/setting.js`
  - Introduce existing MVP switch helper.
  - Change routing object to `settingRouter`.
  - Filter disabled MVP settings subroutes when `MVP_ENABLED=true`.
## Hidden background settings entrance
Filter rules hide the following routes:
- Logistics configuration and freight templates.
- City data maintenance used by freight templates.
- Electronic invoice configuration.
- Page DIY and theme/micro page tools.
- Customer service configuration page.
- External API/account page.
- Receipt printer page.
## Reserved content
Filter rules preserve backend core settings routes and MVP required routes, including:
- Basic system configuration.
- Configuration of members and member rights.
- Check-in configuration.
- Core user, product, order, evaluation, distribution and commission modules.
## verify
Background build:
```bash
cd src/CRMEB/CRMEB-master/template/admin
npm run build
```

Result: Build passed. Existing CSS order and resource size warnings still exist.
## Risk Statement
- Filtering rules are based on paths and permission identifiers. You should review them before adding new routes to avoid adding excessively broad interception rules.
- Backend route interception is still the de facto source of disabled APIs; this frontend filtering only removes visible SPA entries.