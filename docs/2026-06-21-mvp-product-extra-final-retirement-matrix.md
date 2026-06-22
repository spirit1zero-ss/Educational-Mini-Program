# MVP Product Extra Final Retirement Matrix

Date: 2026-06-21

## Objective

This document consolidates the product-extra soft-slimming verification work.

The goal is not to delete broadly. The accepted workflow is:

1. Verify the soft-slimming guard is safe.
2. Confirm no disabled product-extra path can persist disabled data.
3. Physically clean only narrow, proven-safe menu, permission, install, or isolated service remnants.

## Product-extra Scope

This matrix covers:

- Shipping-template picker on product add/edit
- Video temp-key upload endpoint
- Product video field
- Virtual product/card/coupon SKU fields
- `import_card` permission/route guard

It does not cover shared shipping-template infrastructure itself, normal product CRUD, or normal SKU tables.

## Runtime Verification

| Endpoint / path | Result |
| --- | --- |
| `GET /adminapi/product/product/get_template` | `400 MVP module disabled` |
| `GET /adminapi/product/product/get_temp_keys` | `400 MVP module disabled` |
| `GET /adminapi/product/product/import_card` | `400 MVP module disabled` |
| `GET /adminapi/product/product/1` | `200 success` |

## Save Sanitizer Verification

A crafted product save payload was executed inside an explicit transaction and rolled back.

The payload attempted to persist product-extra data:

- `is_virtual = 1`
- `virtual_type = 2`
- `video_link`
- `temp_id = 88`
- `freight = 3`
- SKU `disk_info`
- SKU `coupon_id = 99`

Observed transaction-local persisted values:

| Field | Observed value |
| --- | --- |
| `store_product.is_virtual` | `0` |
| `store_product.virtual_type` | `0` |
| `store_product.video_link` | empty string |
| `store_product.temp_id` | `0` |
| `store_product.freight` | `2` |
| `store_product_attr_value.is_virtual` | `0` |
| `store_product_attr_value.disk_info` | empty string |
| `store_product_attr_value.coupon_id` | `0` |

The transaction was rolled back, and the temporary product row count was confirmed as `0`.

## Data And Seed Verification

| Check | Result |
| --- | --- |
| Product-extra menu/permission rows for template/temp-key/import-card | `0` |
| Install/upgrade seed hits for template/temp-key/import-card permissions | none |
| `CopyTaobaoServices` / `ProductCopyJob` / `copyproduct` hits | none in live backend/install scope |
| Frontend API function definitions for template/temp-key | remain intentionally |

## Final Deletion Matrix

| Layer | Final status | Evidence / reason |
| --- | --- | --- |
| Frontend page | Not physically deleted | Product add/edit is shared with normal product management. Product-extra controls are hidden or guarded in MVP mode. |
| Admin page | Not physically deleted | Shared product admin pages remain necessary for normal product work. |
| API route | Not physically deleted for template/temp-key/import-card | Routes remain behind MVP route blocker so disabled paths return controlled `MVP module disabled` responses and do not fall through to generic `product/:id`. |
| Controller | Not physically deleted for template/temp-key | Controller methods remain behind route middleware. `import_card` live code was already removed while the route block pattern remains. |
| Service | Verified safe / partially physically deleted | Product save sanitizer is verified. Isolated copy/card import remnants such as `ProductCopyJob`, `CopyTaobaoServices`, and `copyproduct/*` were physically removed in earlier proven-safe passes. |
| DAO/Model | No physical delete | Product, SKU, virtual-card, and shipping-template models/tables are shared or core infrastructure. |
| Menu records | Deleted for product-extra disabled entries | Exact database rows for template/temp-key/import-card permissions are `0`. |
| Data tables | Not physically deleted | Product/SKU/shipping-template tables are shared infrastructure; no dedicated product-extra-only runtime table was removed in this pass. |
| Install SQL / migration files | Updated | Permission/API seed rows for template/temp-key/import-card and isolated copy/card import service records were removed in earlier passes. |

## Frontend Verification

The product add/edit page now:

- Filters product type choices to normal product only when product extras are disabled.
- Hides video upload entry points when product extras are disabled.
- Hides the shipping-template `freight = 3` option when product extras are disabled.
- Resets product-extra values before submit.

Production build passed with existing CSS order and asset-size warnings only.

## Recommendation

Treat the product-extra slice as soft-slimming safe.

Do not delete shared product pages, runtime routes, controllers, core product/SKU models, or shared shipping-template tables. Future physical deletes should only target isolated remnants after the same evidence standard is met.

## 2026-06-22 Current-state Recheck

This pass rechecked the current repository and runtime state before considering any further physical deletion.

Runtime verification:

| Endpoint / path | Result |
| --- | --- |
| `GET /adminapi/product/product/get_template` | `400 MVP module disabled` |
| `GET /adminapi/product/product/get_temp_keys` | `400 MVP module disabled` |
| `GET /adminapi/product/product/import_card` | `400 MVP module disabled` |
| `GET /adminapi/product/product/1` | `200 success` |

Database verification:

| Check | Result |
| --- | --- |
| Exact product-extra menu rows for template/temp-key/import-card and visible extra labels | `0` |
| Product-extra config rows | `0` |
| Product-extra config tab rows | `0` |
| `eb_store_product_virtual` rows | `0` |
| `eb_member_card` rows | `0` |
| `eb_member_card_batch` rows | `0` |
| Products with extra flags (`is_virtual`, `virtual_type`, `video_link`, `temp_id`, `freight=3`) | `0` |
| SKU rows with extra fields (`is_virtual`, `disk_info`, `coupon_id`) | `0` |

Seed and route metadata verification:

| Check | Result |
| --- | --- |
| `public/install/crmeb.sql` hits for `product/product/get_template`, `product/product/get_temp_keys`, `product/product/import_card` | none |
| `UpgradeController.php` hits for the same product-extra API metadata | none |
| Live route for `import_card` | no dedicated route remains; the MVP route blocker still prevents fallback into `product/:id` |

Current layer answer:

| Layer | Is the product-extra slice deleted? | Current answer |
| --- | --- | --- |
| Frontend page | No broad deletion | Shared product add/edit pages remain. Product-extra controls are hidden, guarded, or reset before submit. |
| Backend/admin page | No broad deletion | Shared product admin pages remain for normal product work. Product-extra permissions/menu rows are `0`. |
| API route | Soft-blocked / partially removed | `get_template` and `get_temp_keys` remain but are blocked. `import_card` has no dedicated live route and is still blocked by pattern to avoid generic fallback. |
| Controller | Retained shared controller | `StoreProduct.php` remains for normal product management. Disabled endpoints are guarded by route middleware. |
| Service | Retained with sanitizer | `StoreProductServices` remains and sanitizes disabled extra fields before persistence. |
| DAO/Model | Retained shared or historical models | Product/SKU/order virtual-card logic is referenced by shared order and historical flows. Do not delete DAO/model classes in this pass. |
| Menu records | Deleted for disabled entries | Exact menu/permission rows are `0`. |
| Data tables | Retained | `eb_store_product_virtual`, member-card tables, product/SKU tables, and shipping-template tables remain. Current counts are `0` for product-extra runtime data, but the tables are still referenced by shared/historical flows. |
| Install SQL / migration files | Deleted for disabled entries | Product-extra API permission metadata is absent from install and upgrade metadata. |

Decision:

No new physical deletion was made in this recheck. The next safe action is to keep the current soft-blocks and sanitizer, not to delete shared product/order virtual-card infrastructure.

## 2026-06-22 Frontend Residual Trigger Audit

This pass checked whether disabled product-extra functionality can still be triggered from the product add/edit UI.

Frontend findings:

| Control / path | Current behavior |
| --- | --- |
| Product type selector | Receives `mvpGoodsType`; when product extras are disabled, only normal product type `0` is visible/selectable. |
| Legacy cached or edit data with nonzero `virtual_type` | `virtualbtn()` rejects nonzero product-extra types and resets product-extra fields. |
| Product video entry point | Add-video UI is hidden while product extras are disabled; direct video upload helper methods now also reject disabled mode. |
| Existing video preview | May display only if legacy data already has `video_link`; deleting it remains allowed, and submit clears it. |
| Shipping-template option | `freight = 3` radio/select controls are hidden while product extras are disabled. |
| Shipping-template modal | `addTemp()` rejects disabled mode. |
| Virtual-card / disk controls | Normal UI cannot reach `virtual_type = 1`; direct card modal open and submit helpers now reject disabled mode and reset fields. |
| Coupon virtual product controls | Hidden in MVP mode and rejected by coupon helper methods. |
| Submit path | `applyMvpProductMarketingDefaults()` and `applyMvpProductExtraDefaults()` run before payload assembly, clearing virtual, video, template, card, and coupon fields before save. |

Additional frontend hardening made in this pass:

- `videoSaveToUrl()` returns early when product extras are disabled.
- `zh_uploadFile()` returns early when product extras are disabled.
- `addVirtual()` returns early and resets product-extra fields when product extras are disabled.
- `upVirtual()` returns early, resets product-extra fields, and closes the modal when product extras are disabled.

Current conclusion:

The product-extra frontend is now guarded at both visible-control and helper-method levels. No frontend page should be physically deleted because the product add/edit surface remains shared by normal product management.

## 2026-06-22 Virtual Storage And Member-card Boundary Recheck

This pass checked whether empty virtual-card/product-extra tables and related member-card tables can be physically removed.

Decision first:

Do not delete these tables, DAO/model classes, services, routes, or install/upgrade records in this pass.

Runtime verification:

| Endpoint / path | Result |
| --- | --- |
| `GET /adminapi/product/product/import_card` | HTTP `200` wrapper with `400 MVP module disabled` payload |
| `GET /adminapi/user/member_batch/index?page=1&limit=1` | HTTP `200`, empty list |
| `GET /adminapi/product/product/1` | HTTP `200`; product and SKU virtual fields remain `0` |
| `GET /api/user/member/card/index` | HTTP `200` with login-required payload |

Database verification:

| Check | Result |
| --- | --- |
| `eb_store_product_virtual` table | exists |
| `eb_member_card` table | exists |
| `eb_member_card_batch` table | exists |
| `eb_store_product_virtual` rows | `0` |
| `eb_member_card` rows | `0` |
| `eb_member_card_batch` rows | `0` |
| Product rows with product-extra flags | `0` |
| SKU rows with product-extra fields | `0` |
| Product-extra menu rows for template/temp-key/import-card | `0` |
| Runtime member-card menu rows | `8` |

Reference verification:

| Area | Evidence |
| --- | --- |
| Product virtual storage | `StoreProductVirtualServices` is referenced by product detail/edit, SKU save helpers, order delivery, and order pay success listeners. |
| Member card storage | `MemberCardServices` is referenced by user profile, sign-in, cart/order price logic, member-card orders, coupon logic, export, and admin/API member-card controllers. |
| API routes | Member-card routes still exist under both admin and API route files. |
| Install/upgrade metadata | Member-card and product-virtual file/checksum records still exist intentionally in install and upgrade metadata. |

Current layer answer:

| Layer | Is the virtual-card/member-card storage boundary deleted? | Current answer |
| --- | --- | --- |
| Frontend page | No broad deletion | Product add/edit virtual-card entry points are hidden/guarded; member-card pages are outside this product-extra deletion scope. |
| Backend/admin page | Retained where shared | Product-extra import-card permission is absent, but member-card admin pages remain active and should not be removed here. |
| API route | Soft-blocked or retained | Product `import_card` is soft-blocked by MVP route middleware. Member-card routes are retained because member/member-card features are still enabled. |
| Controller | Retained where shared | `StoreProduct` remains shared. Member-card controllers remain because they support active member-card flows. |
| Service | Retained | Product virtual storage service and member-card services are still referenced by product/order/user flows. |
| DAO/Model | Retained | Product virtual and member-card DAO/model classes remain referenced; deleting them would break shared runtime paths. |
| Menu records | Mixed by scope | Product-extra menu rows are `0`; member-card menu rows are present and outside this slice. |
| Data tables | Retained | Tables are currently empty, but they are still schema dependencies for referenced product virtual and member-card flows. |
| Install SQL / migration files | Retained for shared records | Product-extra permission metadata is absent, but table definitions and file/checksum records for product virtual and member-card classes remain intentionally. |

Conclusion:

The current soft-slimming boundary is safe: disabled product-extra paths cannot create virtual-card product data, and normal product/member-card paths still resolve. No physical deletion is justified in this boundary pass.

## 2026-06-22 Video Temp-key And Product Video Recheck

This pass checked the disabled product video upload key path and the shared product `video_link` field.

Runtime verification:

| Endpoint / path | Result |
| --- | --- |
| `GET /adminapi/product/product/get_temp_keys` | HTTP `200` wrapper with `400 MVP module disabled` payload |
| `GET /adminapi/product/product/get_template` | HTTP `200` wrapper with `400 MVP module disabled` payload |
| `GET /adminapi/product/product/import_card` | HTTP `200` wrapper with `400 MVP module disabled` payload |
| `GET /adminapi/product/product/1` | HTTP `200`; `video_link` is empty and `video_open` is `0` |

Database verification after this pass:

| Check | Result |
| --- | --- |
| Product-extra API document rows for template/temp-key/import-card | `0` |
| Product-extra menu rows for template/temp-key/import-card | `0` |
| Products with nonempty `video_link` | `0` |
| Config rows for video temp-key settings | `0` |

Narrow cleanup performed:

- Removed three stale runtime API-document rows from `eb_system_route`:
  - `product/product/get_template`
  - `product/product/get_temp_keys`
  - `product/product/import_card`

No repository install or upgrade file edit was needed in this pass because exact searches found no matching install/upgrade metadata for these paths.

Current layer answer:

| Layer | Is the product video/temp-key slice deleted? | Current answer |
| --- | --- | --- |
| Frontend page | No broad deletion | Product add/edit is shared. Video add/upload controls are hidden or helper-guarded while product extras are disabled. |
| Backend/admin page | No broad deletion | Shared product admin pages remain. Product-extra API document rows are now removed from the runtime DB. |
| API route | Soft-blocked | The route still exists so disabled requests return a controlled MVP response instead of falling through to generic product detail routing. |
| Controller | Retained shared controller | `StoreProduct` remains shared by normal product management. Disabled temp-key behavior is controlled by route middleware and save sanitizer. |
| Service | Retained shared service | Product save service remains and clears `video_link` while product extras are disabled. |
| DAO/Model | Retained shared product model | `video_link` is a shared product table field; do not remove the product model or column in this pass. |
| Menu records | Deleted for disabled entries | Product-extra menu rows for temp-key/template/import-card are `0`. |
| Data tables | Retained | `eb_store_product` is core product storage. Current nonempty `video_link` count is `0`, but the table/column is shared. |
| Install SQL / migration files | Already clean for disabled endpoint metadata | Exact install/upgrade metadata searches for these disabled API paths returned no hits. Runtime API-document rows were cleaned separately. |

Conclusion:

The product video/temp-key boundary is safe as soft-slimmed. The only justified physical cleanup in this pass was stale runtime API-document metadata. Shared product pages, routes, controller, service, model, and product table fields should remain.

## 2026-06-22 Freight-template Product-entry Recheck

This pass checked the product add/edit freight-template entry point separately from the shared shipping-template subsystem.

Runtime verification:

| Endpoint / path | Result |
| --- | --- |
| `GET /adminapi/product/product/get_template` | HTTP `200` wrapper with `400 MVP module disabled` payload |
| `GET /adminapi/setting/shipping_templates/list?page=1&limit=1` | HTTP `200` wrapper with `400 MVP module disabled` payload under the complex-logistics switch |
| `GET /adminapi/product/product/1` | HTTP `200`; product `freight` is `2` and `temp_id` is `0` |

Database verification:

| Check | Result |
| --- | --- |
| Product rows using freight-template mode (`freight = 3` or nonzero `temp_id`) | `0` |
| Product `get_template` menu rows | `0` |
| Product `get_template` runtime API-document rows | `0` |
| Shipping-template tables | four tables exist |
| `eb_shipping_templates` rows | `1` |
| `eb_shipping_templates_region` rows | `1` |
| `eb_shipping_templates_free` rows | `0` |
| `eb_shipping_templates_no_delivery` rows | `0` |

Reference verification:

| Area | Evidence |
| --- | --- |
| Product add/edit frontend | The freight-template radio/select is hidden unless product extras are enabled. |
| Product add/edit backend | Product save sanitizer resets `freight = 3` back to fixed freight and clears `temp_id` while product extras are disabled. |
| Shared shipping subsystem | Shipping-template services, DAO/model classes, routes, and tables are referenced by cart/order freight calculation, order confirmation, API admin product helpers, and system logistics pages. |
| System shipping-template routes | They are governed by `enable_complex_logistics`, not by the product-extra deletion slice. |

Current layer answer:

| Layer | Is the product freight-template entry deleted? | Current answer |
| --- | --- | --- |
| Frontend page | No broad deletion | Shared product add/edit page remains. Product freight-template controls are hidden while product extras are disabled. |
| Backend/admin page | No broad deletion | Product page remains. System shipping-template pages are a separate complex-logistics boundary. |
| API route | Soft-blocked | Product `get_template` is retained behind MVP route middleware for controlled disabled responses. |
| Controller | Retained shared controller | `StoreProduct` remains shared. Product freight-template data is neutralized by sanitizer. |
| Service | Retained shared services | Product and shipping-template services remain because shipping templates are referenced by order/cart/logistics flows. |
| DAO/Model | Retained shared models | Shipping-template DAO/model classes and tables are shared infrastructure. |
| Menu records | Deleted for product-extra entry | Product `get_template` menu rows are `0`. Shipping-template menu records belong to the complex-logistics boundary. |
| Data tables | Retained | Shipping-template tables are shared. Product rows currently do not use freight-template mode. |
| Install SQL / migration files | Retained for shared logistics | Product-extra endpoint metadata is absent; shipping-template install/upgrade records remain intentionally for shared logistics infrastructure. |

Conclusion:

The product freight-template entry is safe as soft-slimmed. No physical deletion was made in this pass because the remaining shipping-template tables, routes, services, DAO/model classes, and install records are shared logistics infrastructure rather than product-extra-only remnants.
