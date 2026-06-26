# MVP Product Copy Pay-Meal Guard Audit

Date: 2026-06-21

## Objective

Verify that the remaining Yihaotong payment endpoint does not expose the retired product copy service when `enable_product_copy` is disabled.

This audit follows the project rule: the goal is not broad deletion. The goal is to verify the current soft-slimming boundary first, then physically delete only small, proven-safe module slices.

## Finding

`serve/open?type=1` and `serve/meal_list?type=copy` already returned `MVP module disabled`.

During the follow-up runtime check, `serve/pay_meal` blocked form data with `type=copy`, but a JSON request could still continue to the Yihaotong user-token lookup before failing because local Yihaotong credentials are absent. That was a soft-slimming boundary leak even though it did not successfully purchase or enable product copy.

## Fix

Updated `app/adminapi/controller/v1/serve/Serve.php` so `payMeal()` normalizes `type` before any external service call.

The type is now read from:

- form data parsed by `postMore()`;
- query parameters;
- JSON request body.

When the normalized type is `copy` and `enable_product_copy` is disabled, the method returns `MVP module disabled` immediately.

## Verification

Authenticated runtime checks against `http://127.0.0.1:8011/adminapi`:

| Check | Result |
| --- | --- |
| `POST /serve/pay_meal` with form `type=copy` | `status=400`, `msg=MVP module disabled` |
| `POST /serve/pay_meal` with JSON `{"type":"copy"}` | `status=400`, `msg=MVP module disabled` |
| `GET /serve/open?type=1` | `status=400`, `msg=MVP module disabled` |
| `GET /serve/meal_list?type=copy` | `status=400`, `msg=MVP module disabled` |
| `GET /product/product/1` | `status=200`, `msg=success` |

Static and syntax checks:

- `php -l /var/www/app/adminapi/controller/v1/serve/Serve.php`: no syntax errors.
- Source search for product copy/crawl identifiers in live backend/admin source returned no remaining live hits.
- Exact database checks for product copy/crawl menu rows, config rows, and config tab rows returned `0`.

## Layer Decision

| Layer | Status |
| --- | --- |
| Frontend page | Product copy entry is hidden or guarded; shared notify/service pages remain. |
| Admin page | Shared Yihaotong service pages remain for SMS, logistics query, and electronic waybill. |
| API route | `serve/pay_meal` remains, but `type=copy` is blocked before external calls. |
| Controller | `Serve::payMeal()` now blocks normalized copy type for form, query, and JSON inputs. |
| Service | Product copy service chain remains physically deleted; shared Yihaotong user service remains. |
| DAO/Model | No dedicated product copy DAO/model exists. |
| Menu records | Product copy/crawl menu rows are absent. |
| Data tables | No dedicated product copy/crawl tables found. |
| Install SQL / migration files | Product copy/crawl service and seed records have already been removed from install and upgrade records. |

## Recommendation

Treat product copy/crawl as soft-slimming safe after this guard fix. Do not delete shared Yihaotong service pages or payment routes because they are still used by SMS, logistics query, and electronic waybill flows.
