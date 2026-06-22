# MVP Serve Shared Route Boundary Audit

## Scope

This pass verified the shared Yihaotong service routes after the product copy/crawl retirement work. The goal was to keep shared SMS/logistics/electronic-waybill service boundaries intact while removing product copy/crawl references from runtime behavior and install metadata.

## Runtime Results

Environment:

- Backend: `http://127.0.0.1:8011/adminapi`
- Branch context: `dev3`
- Date: `2026-06-21`

Checks:

| Route | Result | Decision |
| --- | --- | --- |
| `GET /serve/open` | `400`, missing Yihaotong token parameters | Retained shared route; local credentials are unavailable. |
| `GET /serve/open?type=0` | `400`, missing Yihaotong token parameters | Retained shared logistics-open path. |
| `GET /serve/open?type=1` | `400`, `MVP module disabled` | Product-copy open path is blocked. |
| `GET /serve/meal_list?type=sms` | `400`, `Call to undefined method crmeb\services\serve\storage\Crmeb::mealList()` | Shared Yihaotong package-list gap; not a product-copy residue. |
| `GET /serve/meal_list?type=query` | Same missing method result | Shared Yihaotong package-list gap. |
| `GET /serve/meal_list?type=dump` | Same missing method result | Shared Yihaotong package-list gap. |
| `GET /serve/meal_list?type=copy` | `400`, `MVP module disabled` | Product-copy package-list path is blocked. |
| `POST /serve/pay_meal` with JSON `{"type":"sms"}` | `400`, missing Yihaotong token parameters | Retained shared payment path; local credentials are unavailable. |
| `POST /serve/pay_meal` with JSON `{"type":"copy"}` | `400`, `MVP module disabled` | Product-copy payment path is blocked. |
| `GET /product/product/1` | `200`, `success` | Control route remains healthy. |

## Install Metadata Cleanup

Updated `src/CRMEB/CRMEB-master/crmeb/public/install/crmeb.sql` to remove product-copy references from shared service route metadata:

- `serve/info`: removed the `copy` response object.
- `serve/meal_list`: removed `copy, product copy` from the `type` parameter description.
- `serve/open`: removed `type=1` product-copy open description.
- `serve/record`: removed `type=4` product-copy record description and the product-copy response block.

No `UpgradeController.php` route-metadata product-copy match was found in this pass.

## Layer Decision Matrix

| Layer | Decision |
| --- | --- |
| Frontend page | Product-copy notify/package UI was removed in the previous pass. Shared SMS/logistics/Yihaotong pages remain. |
| Backend/admin page | Shared Yihaotong admin pages remain. Product-copy controls are no longer advertised. |
| API route | Shared `serve/*` routes remain. Product-copy inputs are blocked. Legacy product copy/crawl routes return `404`. |
| Controller | `Serve.php` remains because it owns shared service routes. Product-copy branches are guarded. |
| Service | Product-copy service chain was physically removed. Shared Yihaotong service remains, with `mealList()`/`payMeal()` method coverage noted as a separate follow-up. |
| DAO/Model | No dedicated product-copy DAO/model remains in scope. |
| Menu records | Product copy/crawl menu and permission rows remain at `0`. |
| Data tables | No dedicated product copy/crawl data table was found. |
| Install SQL/migration | Product-copy route metadata was removed from `public/install/crmeb.sql`; no matching `UpgradeController.php` route metadata was found. |

## Finding

The product-copy paths are blocked at the shared service boundary. The remaining non-copy `serve/meal_list` failure is a shared Yihaotong package-list implementation gap: `Serve.php` calls `Crmeb::mealList()`, but `crmeb/services/serve/storage/Crmeb.php` does not define that method. This should not be patched with guessed upstream API names.

## Recommendation

Do not delete shared `serve/*` routes yet. Decide whether Yihaotong purchase/package management is part of the MVP:

- If retained, restore and verify `Crmeb::mealList()` and `Crmeb::payMeal()` from a known Yihaotong API source, then rerun package-list and payment smoke tests.
- If not retained, soft-block nonessential package purchase endpoints while keeping basic SMS/logistics configuration and status paths available.

## 2026-06-22 Follow-up

Decision: treat Yihaotong package purchase and payment-code generation as nonessential for the current MVP until a known upstream API source is available.

Changes:

- Added `enable_serve_purchase => false` to `config/mvp.php`.
- Soft-blocked `Serve::mealList()` before it can call the missing `Crmeb::mealList()` method.
- Soft-blocked `Serve::payMeal()` before it can request Yihaotong user/package/payment data.
- Kept JSON body type normalization in `Serve::payMeal()` so JSON `{"type":"copy"}` is blocked consistently.
- Soft-blocked `Serve::getRecord()` with `type=4` while `enable_product_copy=false`, preventing runtime access to the legacy product-copy record type.

Verification:

- `php -l /var/www/app/adminapi/controller/v1/serve/Serve.php`: passed.
- `php -l /var/www/config/mvp.php`: passed.
- Container file check confirmed `enable_serve_purchase` exists in `/var/www/config/mvp.php`.
- Container file check confirmed the `enable_serve_purchase` guards exist in `/var/www/app/adminapi/controller/v1/serve/Serve.php`.
- Initial runtime smoke testing was delayed because local backend initialization took longer than the short request timeout, and queue/timer/Workerman processes were adding noise during startup. For the smoke pass, the container-level supervisor config was temporarily adjusted to start only `php-fpm`; this was a local verification-environment change, not a repository change.
- Authenticated runtime smoke results after increasing request timeouts:
  - `GET /serve/meal_list?type=sms`: `400`, `MVP module disabled`.
  - `GET /serve/meal_list?type=copy`: `400`, `MVP module disabled`.
  - `POST /serve/pay_meal` with form `type=sms`: `400`, `MVP module disabled`.
  - `POST /serve/pay_meal` with form `type=copy`: `400`, `MVP module disabled`.
  - `POST /serve/pay_meal` with JSON `{"type":"sms"}`: `400`, `MVP module disabled`.
  - `POST /serve/pay_meal` with JSON `{"type":"copy"}`: `400`, `MVP module disabled`.
  - `GET /serve/record?page=1&limit=10&type=4`: `400`, `MVP module disabled`.
  - Control route `GET /product/product/1`: `200`, `success`.

Updated recommendation:

- Keep the soft block for `serve/meal_list`, `serve/pay_meal`, and product-copy `serve/record type=4` in the current MVP.
- Do not physically delete shared `serve/*`, `Serve.php`, `ServeServices.php`, or `crmeb/services/serve/*`.
- Restore the normal local supervisor startup profile before testing queue, timer, Workerman, or customer-service flows.
- Next module candidate remains product-copy/crawl cleanup verification only if the same layer matrix can be proven from current state.
