# 2026-06-18 MVP slimming: admin menu hidden-pattern coverage

## Scope

- Round scope: backend admin menu output filtering for disabled MVP modules.
- Strategy: add missing hidden-menu patterns only. No route, controller, database, or frontend deletion.
- Branch target: `dev3`.

## Existing mechanism reviewed

- `app/services/system/SystemMenusServices.php`
  - `/setting/menus/unique` returns the current admin menu tree and permission identifiers through `getMenusList()`.
- `app/dao/system/SystemMenusDao.php`
  - Menu queries call `withMvpHiddenMenu()` and pass hidden patterns into the model search layer.
- `app/model/system/SystemMenus.php`
  - `searchMvpHiddenMenuAttr()` filters disabled MVP patterns across `menu_path`, `controller`, `unique_auth`, `api_url`, `header`, `menu_name`, and `mark`.
- `app/common.php`
  - `mvp_admin_hidden_menu_patterns()` collects patterns only for switches that are disabled.

## Changes made in this round

- `config/mvp.php`
  - Added hidden-menu patterns for `enable_lottery=false`.
  - Added hidden-menu patterns for `enable_cms=false`.
  - Added hidden-menu patterns for `enable_app_admin=false`.
  - Added hidden-menu patterns for `enable_offline_payment=false`.
  - Added hidden-menu patterns for `enable_store_pickup=false`.

## Explicitly not changed

- Did not delete admin menu rows from the database.
- Did not delete CRMEB route files, controllers, services, models, or tables.
- Did not change login, users, products, orders, WeChat pay, pay callback, second-level distribution, commissions, sign-in, assessment, or member features.
- Did not run the full mini-program build in this soft-slimming round.

## Verification notes

- `docker exec -w /var/www/crmeb crmeb php -l config/mvp.php`
  - Result: no syntax errors.
- `docker exec -w /var/www/crmeb crmeb php think clear`
  - Result: `Clear Successed`.
- `mvp_admin_hidden_menu_patterns()` was checked inside the mounted Docker container.
  - Result includes `lottery`, `cms/`, `article`, `special`, `news`, `app/`, `wechat/`, `offline`, `offline_payment`, `store_pickup`, `verify_order`, `system_store`, and `store-staff`.
- `GET /api/wechat/live?page=1&limit=10`
  - Result: HTTP 200 wrapper with `{"status":400,"msg":"MVP module disabled"}`.
- `GET /api/product/detail/1`
  - Result: HTTP 200 business success with `"coupons":[]`.
- Existing route middleware remains the backend enforcement layer; this round only improves admin menu visibility coverage.
