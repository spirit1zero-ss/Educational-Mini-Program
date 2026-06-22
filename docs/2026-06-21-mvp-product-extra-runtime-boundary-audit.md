# 2026-06-21 MVP Product Extra Runtime Boundary Audit

## Goal

Validate whether the current product-extra soft slimming is safe before any further physical deletion. This pass is intentionally an audit, not a deletion pass.

## Current Soft-Slimming Position

- `enable_product_extras` is disabled in `crmeb/config/mvp.php`.
- Admin route blocking still covers:
  - `product/product/get_template`
  - `product/product/get_temp_keys`
  - `product/product/import_card`
- Admin menu hiding still covers the same product-extra permission keys.
- Product save now normalizes crafted product-extra payloads back to normal-product defaults.
- Product attribute generation now returns normal-product attributes even when crafted virtual-product payloads are sent.
- The dedicated `import_card` endpoint chain was physically removed in the previous small deletion pass.

## Data-State Evidence

Current local database counts:

- `eb_store_product` rows with `is_virtual != 0` or `virtual_type != 0`: `0`.
- `eb_store_product_attr_value` rows with virtual SKU fields populated: `0`.
- `eb_store_order` rows with virtual order or fictitious delivery state: `0`.
- `eb_store_product_virtual` rows: `0`.

This means the current dataset does not require virtual-product runtime compatibility to serve existing product or order records.

## Runtime Dependency Findings

The virtual-product runtime path still exists in code and is tied to order compatibility:

- `OrderPaySuccessListener` calls `StoreOrderDeliveryServices::virtualSend()` only when `virtual_type` is `1` or `2`.
- `StoreOrderDeliveryServices::virtualSend()` still uses `StoreProductVirtualServices` for virtual card delivery.
- `StoreProductVirtualServices`, `StoreProductVirtualDao`, `StoreProductVirtual` model, and the `eb_store_product_virtual` table still exist.
- Order creation and payment services still carry `virtual_type` as a compatibility field.

Because product save and attribute generation now force normal-product defaults, new MVP products should not enter that runtime path. The remaining runtime code is therefore compatibility/dead-path protection for old or crafted data, not an active MVP entry point.

## Deletion Checklist Status

- Frontend page: not deleted. Product add/edit remains because it is the normal product page.
- Admin page: not deleted. No standalone admin page was removed in this audit pass.
- API route: only `product/import_card` was physically deleted. `get_template` and `get_temp_keys` remain but are blocked by the MVP switch.
- Controller: only `StoreProduct::import_card()` was physically deleted. `get_template` and `getTempKeys` remain blocked.
- Service: not deleted. Product and order services still contain compatibility logic.
- DAO/Model: not deleted. `StoreProductVirtualDao` and `StoreProductVirtual` remain because order delivery compatibility still references them.
- Menu records: only the `import_card` seed records were physically deleted. `get_template` and `get_temp_keys` records remain hidden/blocked.
- Data tables: not deleted. `eb_store_product_virtual` and product/order virtual columns remain.
- Install SQL/migration files: only `import_card` seed/API metadata rows were physically deleted. No table or column DDL was removed.

## Safety Assessment

The current soft-slimming state is safe for the verified local MVP dataset:

- Normal product detail and list flows continue to work.
- Crafted virtual-product save payloads are normalized before persistence.
- Crafted virtual attribute generation is normalized before response.
- Product-extra admin APIs are blocked while the switch is disabled.
- There is no local virtual-product or virtual-order data that would require active runtime handling.

Further physical deletion is not yet safe for Service, DAO/Model, table, or shared field layers without a dedicated order/payment compatibility plan.

## Next Recommendation

Do not delete the virtual-product service, DAO/model, table, or order runtime path yet. The next safe small batch is an additional verification pass around normal order creation and payment-readiness with `virtual_type = 0`, followed by documenting whether order-side virtual compatibility can remain as inactive legacy code for MVP.
