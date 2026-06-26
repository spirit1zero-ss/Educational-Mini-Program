# 2026-06-18 MVP backend menu hidden rule coverage audit

## scope

- Scope of this round: Filtering disabled MVP modules in backend menu output.
- Strategy: Only add missing menu hiding rules; do not delete routes, controllers, databases or front-end files.
- Target branch: `dev3`.

## Checked mechanism

- `app/services/system/SystemMenusServices.php`
  - `/setting/menus/unique` returns the current admin menu tree and permission identifiers through `getMenusList()`.
- `app/dao/system/SystemMenusDao.php`
  - Menu queries call `withMvpHiddenMenu()` and pass hidden patterns into the model search layer.
- `app/model/system/SystemMenus.php`
  - `searchMvpHiddenMenuAttr()` filters disabled MVP patterns across `menu_path`, `controller`, `unique_auth`, `api_url`, `header`, `menu_name`, and `mark`.
- `app/common.php`
  - `mvp_admin_hidden_menu_patterns()` collects patterns only for switches that are disabled.

## Changes in this round

- `config/mvp.php`
  - Supplement menu hiding rules for `enable_lottery=false`.
  - Supplement menu hiding rules for `enable_cms=false`.
  - Supplement menu hiding rules for `enable_app_admin=false`.
  - Supplement menu hiding rules for `enable_offline_payment=false`.
  - Supplement menu hiding rules for `enable_store_pickup=false`.

## Clearly unchanged

- Backend menu records are not deleted from the database.
- CRMEB routing files, controllers, services, models, or data tables were not deleted.
- The login, user, product, order, WeChat payment, payment callback, secondary distribution, commission, check-in, evaluation or membership functions have not been modified.
- This round of soft slimming did not implement complete mini program construction.

## Verify records

- `docker exec -w /var/www/crmeb crmeb php -l config/mvp.php`
  - Result: No syntax errors.
- `docker exec -w /var/www/crmeb crmeb php think clear`
  - Result: `Clear Successed`.
- `mvp_admin_hidden_menu_patterns()` was checked inside the mounted Docker container.
  - Results include `lottery`, `cms/`, `article`, `special`, `news`, `app/`, `wechat/`, `offline`, `offline_payment`, `store_pickup`, `verify_order`, `system_store`, and `store-staff`.
- `GET /api/wechat/live?page=1&limit=10`
  - Result: HTTP 200 wrapped response with content `{"status":400,"msg":"MVP module disabled"}`.
- `GET /api/product/detail/1`
  - Result: HTTP 200 business response successfully, with `"coupons":[]`.
- The existing routing middleware is still the backend mandatory interception layer; this round only improves the visibility coverage of the background menu.
