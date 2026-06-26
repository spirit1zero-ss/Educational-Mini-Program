# MVP Product Extra Frontend Runtime Guard Audit

Date: 2026-06-21

## Scope

This pass verifies the admin product add/edit frontend while `PRODUCT_EXTRAS_ENABLED = false`.

The goal is to verify soft-slimming safety and fix only frontend guard gaps. This pass does not physically delete the shared product add/edit page.

## Findings

The product add/edit page already had MVP guards for:

- Product type selection through `mvpGoodsType`
- Video upload actions through `isMvpProductExtrasEnabled()`
- Product-extra default cleanup before submit
- Coupon/member/virtual controls in several child components through `isMvpMode`

One frontend gap remained:

- `LogisticsSetting.vue` still displayed the shipping-template radio option and template selector UI even though template loading and backend persistence were already blocked.

## Changes

- Passed `isProductExtrasEnabled` from the product add/edit page into `LogisticsSetting.vue`.
- Hid the `freight = 3` shipping-template radio option when product extras are disabled.
- Hid the shipping-template selector and add-template action when product extras are disabled.

## Deletion Matrix

| Layer | Status | Notes |
| --- | --- | --- |
| Frontend page | Not deleted | Shared product add/edit page remains. Product-extra UI is hidden or guarded. |
| Admin page | Not deleted | Normal product management still depends on this page. |
| API route | Not deleted | Runtime routes remain blocked by MVP route middleware. |
| Controller | Not deleted | Controller methods remain behind route middleware. |
| Service | Verified separately | Backend save sanitizer still protects crafted payloads. |
| DAO/Model | No delete needed | Shared product and SKU models remain. |
| Menu records | Already cleaned for template/temp-key permissions | Exact database rows were verified as `0` in the previous pass. |
| Data tables | Not deleted | Shipping template and product tables are shared infrastructure. |
| Install SQL / migration files | Already updated for template/temp-key permissions | No new install SQL delete was needed in this frontend pass. |

## Verification

- Static scan confirmed `LogisticsSetting.vue` now receives `productExtrasEnabled`.
- Static scan confirmed `freight = 3` UI is hidden when product extras are disabled.
- Admin frontend production build passed with existing CSS order and asset-size warnings only.

## Recommendation

Treat the product-extra frontend guard as safer after this pass. Do not delete the shared product add/edit page. The next useful check is a final product-extra layer matrix that consolidates route blockers, save sanitizer, frontend guard, menu cleanup, and install SQL cleanup into one status note.

