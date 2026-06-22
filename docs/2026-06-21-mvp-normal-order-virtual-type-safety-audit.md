# 2026-06-21 MVP Normal Order Virtual Type Safety Audit

## Goal

Verify that the current product-extra soft slimming keeps normal product order flow safe. This pass did not delete code and did not create test orders.

## Code Path Findings

- `StoreOrderCreateServices::createOrder()` reads `virtual_type` from the first cart product.
- When `virtual_type` is `0`, normal shipping address validation remains active.
- The created order stores `virtual_type` from the cart product.
- `OrderPaySuccessListener` calls `StoreOrderDeliveryServices::virtualSend()` only when `virtual_type` is `1` or `2`.
- `OrderOfflineServices::orderOffline()` also calls `virtualSend()` only when `virtual_type` is `1` or `2`.
- `StoreCartServices::checkProductStock()` only performs virtual coupon validation when product `is_virtual = 1`, product `virtual_type = 2`, and SKU `coupon_id` is populated.

Because product save and attribute generation now normalize product-extra payloads to normal-product defaults, normal MVP products should keep `virtual_type = 0` and avoid the virtual delivery path.

## Database Evidence

Current local database checks:

- Visible products: `3`.
- Visible products with `is_virtual != 0` or `virtual_type != 0`: `0`.
- Visible product SKUs with virtual fields populated: `0`.
- Orders with virtual or fictitious delivery state: `0`.
- Sample visible product/SKU:
  - Product ID: `1`.
  - Product `virtual_type`: `0`.
  - Product `is_virtual`: `0`.
  - SKU `is_virtual`: `0`.
  - SKU `coupon_id`: `0`.
  - SKU `disk_info`: empty.

## Read-Only Smoke Checks

- `GET /api/product/detail/1`: `status=200`, `msg=success`, `virtual_type=0`, `is_virtual=0`, `cart_button=1`.
- `GET /api/pc/get_products`: `status=200`, `msg=success`.

## Assessment

The current soft-slimming state is safe for normal product browsing and order-readiness:

- Normal products are visible and carry normal product flags.
- Normal SKUs do not contain virtual card, disk, or coupon payloads.
- Normal product detail still exposes a cart path.
- The payment-success virtual delivery path is gated by order `virtual_type` and should not run for normal MVP products.

The remaining virtual delivery code should stay in place for now because it is still referenced by order/payment compatibility paths, even though the current MVP data does not trigger it.

## Next Recommendation

Do not physically delete order-side virtual delivery services, DAO/model, table, or product/order virtual columns yet. The next safe step is a small, read-only audit of admin permission/menu state to confirm that the remaining product-extra routes are hidden and blocked consistently while their shared code remains available for compatibility.
