# CRMEB MVP slimming down: backend home page and advanced distribution entrance closing audit

Date: 2026-06-18

## Target

Continue to implement MVP soft slimming without deleting code, rewriting the routing system, or affecting basic secondary distribution and commission viewing.

This stage focuses on the non-MVP entrances that are still visible in the backend and front-end:

- CMS/articles in the quick entry on the backend home page
- Coupons in the quick entry on the backend home page
- Business unit/agent advanced distribution module in background static routing

## This adjustment

### Backend MVP configuration

Location:

- `src/CRMEB/CRMEB-master/template/admin/src/config/mvp.js`

deal with:

- Added `isMvpAdminLinkVisible(link)`.
- In MVP mode, hide the shortcut entry on the backend homepage:
  - `/cms/`
  - `/marketing/store_coupon`
  - `/marketing/coupon`

### Backstage homepage quick entrance

Location:

- `src/CRMEB/CRMEB-master/template/admin/src/pages/index/components/gridMenu.vue`

deal with:

- CMS/article quick entry is hidden according to MVP rules.
- The coupon quick entry is hidden according to MVP rules.
- Users, system settings, products, orders, and basic distribution entrances are reserved.

### Background static routing

Location:

- `src/CRMEB/CRMEB-master/template/admin/src/router/routers.js`

deal with:

- The `division` static route is not mounted in MVP mode.
- `agent` The basic distribution route is retained to avoid affecting secondary distribution and commission viewing.

### Backend MVP configuration completion

Location:

- `src/CRMEB/CRMEB-master/crmeb/config/mvp.php`
- `src/CRMEB/CRMEB-master/crmeb/app/adminapi/route/agent.php`

deal with:

- Backend menu hiding rule supplement `enable_advanced_distribution`:
  - `division`
  - `agent-division`
- Supplementary background interface interception rules:
  - `agent/division`
- The background `agent` routing group is connected to the existing `MvpRouteBlockMiddleware`, only intercepts the `agent/division` high-level distribution interface, and retains the basic secondary distribution interface.

## retain ability

This time it does not affect:

- View by background users
- Backend product view
- Backend order viewing
- Basic secondary distribution
- View commission records
- Sign in
- member
- WeChat payment and payment callback

## local verification path

Background build:

```bash
cd src/CRMEB/CRMEB-master/template/admin
npm run build
```

Docker backend sampling test:

```bash
docker exec -w /var/www/crmeb crmeb-local php think clear
curl.exe -i --max-time 20 http://127.0.0.1:8080/adminapi/agent/division/list
```

Backend browser path:

- `http://127.0.0.1:8080/admin`
- After logging in, view the quick entrance to the backend homepage
- Confirm that the quick entry to CMS/articles and coupons is not displayed
- Confirm that users, products, orders, and basic distribution entrances are still retained

## Risk point

- Basic distribution shares the `agent` namespace with advanced business units/agents, and `agent` cannot be deleted as a whole.
- Before actual physical deletion, you need to continue to split the basic secondary distribution interface and `agent/division` advanced distribution interface.
- The backend menu may also be dynamically returned by the backend permission menu, so this time we also added frontend static routing and backend MVP menu/interface rules.
