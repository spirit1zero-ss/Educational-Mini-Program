# MVP Product Copy/Crawl Final Retirement Matrix

Date: 2026-06-21

## Objective

This audit verifies the safety of the current MVP soft-slimming state before declaring the product copy/crawl slice retired.

The objective is not to delete broadly. The accepted workflow is:

1. Verify soft-slimming guards and removed routes are safe.
2. Confirm there is no remaining live runtime path.
3. Physically delete only the small module slice that has already passed verification.

## Runtime Verification

Legacy product copy/crawl routes:

| Endpoint | Result |
| --- | --- |
| `POST /adminapi/product/crawl` | `404` |
| `GET /adminapi/product/copy_config` | `404` |
| `POST /adminapi/product/copy` | `404` |
| `POST /adminapi/product/crawl/save` | `404` |
| `POST /adminapi/product/product_import` | `404` |
| `GET /adminapi/product/product_export` | `404` |

Remaining serve-copy guard endpoints:

| Endpoint | Result |
| --- | --- |
| `GET /adminapi/serve/open?type=1` | `400 MVP module disabled` |
| `GET /adminapi/serve/meal_list?type=copy` | `400 MVP module disabled` |
| `POST /adminapi/serve/pay_meal` with form `type=copy` | `400 MVP module disabled` |
| `POST /adminapi/serve/pay_meal` with JSON `{"type":"copy"}` | `400 MVP module disabled` |

Control endpoint:

| Endpoint | Result |
| --- | --- |
| `GET /adminapi/product/product/1` | `200 success` |

## Data Verification

| Check | Result |
| --- | --- |
| Exact product copy/crawl menu rows | `0` |
| Product copy/crawl config rows | `0` |
| Product copy/crawl config tab rows | `0` |
| Tables matching `%copy%` | none found |
| Tables matching `%crawl%` | none found |

One broad menu search result remains for `marketing/coupon/copy/<id>`, but it belongs to coupon duplication and is not part of product copy/crawl.

## Deletion Matrix

| Layer | Final Status | Evidence |
| --- | --- | --- |
| Frontend page | Product copy/crawl slice removed from shared UI | Product-copy notify/Yihaotong tabs, package labels, open-service state, and direct copy actions were removed. Shared product/admin pages remain because they host unrelated MVP-safe functions. |
| Admin page | Product copy/crawl page entries removed or blocked | Shared serve and product pages remain because they host SMS, logistics, and normal product management. |
| API route | Deleted or blocked | Legacy product copy/crawl routes return `404`; serve copy routes remain but return `MVP module disabled`. |
| Controller | Product copy/crawl controller paths removed or guarded | Old product copy/crawl controller paths are gone. Shared `Serve.php` remains and blocks copy/package purchase record paths before legacy copy behavior can run. |
| Service | Deleted for retired slice | `CopyTaobaoServices`, `ProductCopyJob`, `StoreProductServices` copy-image branch, `ServeServices::copy()`, and `crmeb/services/copyproduct/*` are removed. |
| DAO/Model | No delete needed | No dedicated product copy/crawl DAO/model remains for this slice. |
| Menu records | Deleted for product copy/crawl | Exact product copy/crawl menu rows are `0`. |
| Data tables | No delete needed | No dedicated product copy/crawl runtime tables found. |
| Install SQL / migration files | Updated | Product copy/crawl service/file records, config seeds, route metadata, and language seed rows were removed from install records. No matching `UpgradeController.php` route metadata remains. |

## Follow-up Guard Fix

A fresh verification pass found that `serve/pay_meal` already blocked form `type=copy`, but a JSON request could still reach the Yihaotong token lookup before failing on missing external credentials. The controller now normalizes the meal type from form data, query parameters, and JSON body before any external service call.

Verified after the fix:

- `POST /adminapi/serve/pay_meal` with form `type=copy`: `400 MVP module disabled`.
- `POST /adminapi/serve/pay_meal` with JSON `{"type":"copy"}`: `400 MVP module disabled`.

## Notify UI Physical Cleanup

A follow-up frontend pass removed the remaining product-copy UI slice from shared notify/Yihaotong pages:

- Product-copy tabs and labels were removed from `smsPay` and `smsConfig/tableList`.
- Product-copy open-service state and branches were removed from `smsConfig/index` and `smsConfig/tableList`.
- The unused `serveOpnOtherApi()` frontend wrapper was removed.
- The unused frontend `isMvpProductCopyEnabled()` helper was removed.

`npm.cmd run build` passed after the cleanup.

## 2026-06-22 Final Residue Cleanup

This pass rechecked the current state across the requested layers and removed the remaining product-collection language residue.

Additional cleanup:

- Removed the old `400178` product-collection language seed rows from `public/install/crmeb.sql`.
- Removed the runtime language key `Please activate the product collection service first` from `app/lang/en_us.php`.
- Removed the Chinese runtime language key for the retired product-collection service from `app/lang/zh_cn.php`.
- Collapsed the unreachable shared `Serve::payMeal()` `copy` case to return `MVP module disabled`.

Current verification:

| Check | Result |
| --- | --- |
| Search for `400178`, the retired product-collection service prompt, `product collection service`, `openInfo['copy']` | no matches in app/install/upgrade scope |
| Exact product copy/crawl menu rows | `0` |
| Product copy/crawl config rows | `0` |
| Product copy/crawl config tab rows | `0` |
| Product copy/crawl dedicated files by name | none found |
| `php -l` for `Serve.php` | passed |
| `php -l` for `app/lang/zh_cn.php` | passed |
| `php -l` for `app/lang/en_us.php` | passed |
| `GET /adminapi/serve/meal_list?type=copy` | `400 MVP module disabled` |
| `POST /adminapi/serve/pay_meal` with form `type=copy` | `400 MVP module disabled` |
| `GET /adminapi/serve/record?page=1&limit=10&type=4` | `400 MVP module disabled` |
| Control `GET /adminapi/product/product/1` | `200 success` |

Current layer answer:

| Layer | Is the product copy/crawl slice deleted? | Current answer |
| --- | --- | --- |
| Frontend page | Yes for the retired slice | Dedicated product copy/crawl UI and notify/Yihaotong copy purchase controls were removed. Shared product and notify pages remain. |
| Backend/admin page | Yes for the retired slice | Dedicated product copy/crawl entries are gone. Shared product and serve admin pages remain. |
| API route | Yes or soft-blocked | Legacy product copy/crawl product routes are `404`; shared serve copy/package/record paths are soft-blocked. |
| Controller | Yes or guarded | Dedicated product copy/crawl controller paths are gone; shared `Serve.php` is retained with guards. |
| Service | Yes for dedicated services | Dedicated copy/crawl services and job were removed; shared serve and neutral remote-image services remain. |
| DAO/Model | Not applicable | No dedicated product copy/crawl DAO/model remains. |
| Menu records | Yes | Exact product copy/crawl menu rows are `0`. |
| Data tables | Not applicable | No dedicated product copy/crawl runtime table was found. |
| Install SQL / migration files | Yes for retired slice | Product copy/crawl config, route metadata, file records, service seeds, and language seeds were removed from install records; no matching upgrade route metadata remains. |

## Remaining Non-scope Items

The following are intentionally not part of this product copy/crawl retirement:

- `product/product/get_template`: shipping-template/product-extra guard area.
- `product/product/get_temp_keys`: video temp-key/product-extra guard area.
- `marketing/coupon/copy/<id>`: coupon duplication, not product copy/crawl.
- Normal text labels such as "copy" in UI commands.

## Recommendation

Treat product copy/crawl as retired for MVP after this audit. The next batch should not expand from this module. Pick the next candidate module only after a fresh soft-slimming safety check and produce the same layer-by-layer matrix before any physical delete.

## 2026-06-22 Product Migration/Import Residual Recheck

This pass rechecked the current worktree and runtime state for the narrow product collection, product copy, and product migration/import slice.

The goal of this recheck was not to delete more code. It was to prove whether the current soft-slimming and previous physical cleanup remain safe before considering any further deletion.

Runtime verification:

| Endpoint / path | Result |
| --- | --- |
| `POST /adminapi/product/crawl` | `404` |
| `GET /adminapi/product/copy_config` | `404` |
| `POST /adminapi/product/copy` | `404` |
| `POST /adminapi/product/crawl/save` | `404` |
| `POST /adminapi/product/product_import` | `404` |
| `GET /adminapi/product/product_export` | `404` |
| `GET /adminapi/product/product/1` | `200` in the Nginx access log during this pass |

Source verification:

| Check | Result |
| --- | --- |
| Live backend hits for `product_import`, `product_export`, product `crawl`, `copy_config`, `CopyTaobao`, `ProductCopyJob`, and `copyproduct` | none |
| Admin frontend hits for deleted product import/crawl wrappers and dedicated UI components | none |
| Dedicated product copy/crawl files by name | none in application source; one unrelated dependency file under `node_modules` is outside this slice |

Database verification:

| Check | Result |
| --- | --- |
| Exact product collection/copy/migration menu rows | `0` |
| Product collection/copy/migration config rows | `0` |
| Product collection/copy/migration config tab rows | `0` |
| Product collection/copy/migration route document rows | `0` |
| Product collection/copy/migration file records | `0` |
| Dedicated tables matching crawl/copy names | none returned |

Boundary notes:

- `product-export` still appears as a normal product list export permission. It is not the deleted migration endpoint `product/product_export`.
- Coupon duplication, system backup import, theme import, live-room product import, and general upgrade/data migration code are outside this product copy/crawl slice.
- Shared product list, product edit, product detail, normal product export, and product management routes must remain.

Current layer answer:

| Layer | Is the product collection/copy/migration slice deleted? | Current answer |
| --- | --- | --- |
| Frontend page | Yes for the retired slice | Dedicated product collection and migration UI components and API wrappers are absent. Shared product pages remain. |
| Backend/admin page | Yes for the retired slice | Dedicated admin entries are absent. Shared product management remains. |
| API route | Yes for the retired slice | Legacy product collection/copy/migration endpoints return `404`; normal product detail remains healthy. |
| Controller | Yes for dedicated paths | No dedicated product collection/copy controller path remains in the product route tree. Shared product controllers remain. |
| Service | Yes for dedicated services | Dedicated copy/crawl services and job are absent. Shared product and neutral remote-image services remain. |
| DAO/Model | Not applicable | No dedicated product collection/copy/migration DAO/model remains for this slice. |
| Menu records | Yes | Exact runtime menu rows for the retired slice are `0`. |
| Data tables | Not applicable | No dedicated product collection/copy/migration runtime table was found. |
| Install SQL / migration files | Yes for retired slice | Install and upgrade route/file metadata for this retired slice are absent. |

Decision:

No additional physical deletion was made in this recheck. The safe next action is to move to another narrow candidate only after a fresh soft-slimming safety audit, not to continue deleting shared product management code.
