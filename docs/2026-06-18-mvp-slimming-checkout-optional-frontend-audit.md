# CRMEB MVP Downsizing: Order confirmation optional capability front-end closing audit
Date: 2026-06-18
## Target
Continue to implement MVP soft slimming without deleting code, changing the order state machine, or rewriting payments.
This stage focuses on non-MVP capabilities that may still appear on the order confirmation page:
- Invoice
- Pick up in store
- Offline payment related entrances
- Gift order history parameters
- Invoice management and account cancellation entrance in the user profile page
## This adjustment
### Order confirmation page
Location:
- `src/CRMEB/CRMEB-master/template/uni-app/pages/goods/order_confirm/index.vue`

deal with:
- Store pickup switching is not displayed in MVP mode.
- The invoicing portal is not displayed in MVP mode.
- In MVP mode, `checkShipping` will go directly to normal delivery.
- In MVP mode, `getList`, `showStoreList`, `goInvoice`, and `getInvoiceList` are returned directly.
- `invoice_id` and `is_gift` in the old URL parameters in MVP mode will be cleared.
- Mandatory order submission in MVP mode:
  - `payType = weixin`
  - `shipping_type = 1`
  - `store_id = 0`
  - `invoice_id = ""`
  - `is_gift = 0`
### User profile page
Location:
- `src/CRMEB/CRMEB-master/template/uni-app/pages/users/user_info/index.vue`

deal with:
- Hide invoice management in MVP mode.
- Hidden account logout in MVP mode.
- Address management is retained, because ordinary orders still rely on the delivery address.
## Reserved capabilities
This time it does not affect:
- User login
- User profile editing
- Address management
- Product details
- Create order
- WeChat Pay
- Payment callback
- Secondary distribution
- Commission records
- Sign in
- Member
## Local verification path
Front-end build:
```bash
cd src/CRMEB/CRMEB-master/template/uni-app
npm run build:mp-weixin
```

Docker backend sampling test:
```bash
docker exec -w /var/www/crmeb crmeb-local php think clear
curl.exe -i --max-time 20 http://127.0.0.1:8080/api/product/detail/1
curl.exe -i --max-time 20 -X POST http://127.0.0.1:8080/api/user/set_visit
```

WeChat developer tool path:
- import `src/CRMEB/CRMEB-master/template/uni-app/dist/build/mp-weixin`
- Open product details
- Go to order confirmation
- Confirm that only normal delivery will be displayed, and store pickup switching will not appear.
- Confirm that the invoicing portal does not appear
- Confirm that the payment method only retains WeChat payment
- Open the user profile page and confirm that invoice management and account cancellation are not displayed.
## Risk points
- The order confirmation page has heavy historical logic. Before actually deleting the store/invoice code, you need to return to order creation, payment, callback, confirmation of receipt and commission generation again.
- The backend may still return the invoice and pick-up fields through configuration. This time, the front-end has done MVP verification, but the interface response must be checked before subsequent physical deletion.
- Address management cannot be deleted, it belongs to the core link of ordinary orders.
- Sign-in and membership are still reserved functions and cannot be deleted together with the points mall and marketing modules.

## 2026-06-22 Backend Express-Only Guard Recheck

### Result

The checkout soft-slimming boundary now has backend guards in addition to the existing frontend MVP mode checks. No physical deletion was made in this slice.

### Backend Guard Changes

- `StoreOrderServices::getOrderConfirmData`
  - If `shipping_type=2` is submitted while `store_self_mention=0`, the service now forces `shipping_type=1` before address and price calculation.
  - This prevents a direct API caller from clearing the address and generating a no-postage confirmation cache while store pickup is disabled.
- `StoreOrderServices::checkShipping`
  - If `store_self_mention=0`, the service returns `type=1`, which means express delivery only.
  - This prevents the delivery selector from advertising store-pickup options when the store-pickup feature is off.
- `StoreOrderComputedServices::computedOrder`
  - If `shippingType=2` is submitted while `store_self_mention=0`, the service now forces `shippingType=1` before price recalculation.
  - This aligns recalculation with order creation, which already forces express delivery when store pickup is disabled.

### Safety Matrix

| Layer | Deleted? | Current state |
| --- | --- | --- |
| Frontend page | No | Checkout page remains, but MVP mode hides store pickup, invoice, gift, coupon, balance, offline payment, and related optional entries. |
| Backend page | No | Backend order/store pages are retained; disabled store/write-off entries are blocked or hidden through MVP rules. |
| API route | No | `order/check_shipping`, order confirmation, order calculation, and order creation routes remain. Store-list and write-off routes remain soft-blocked. |
| Controller | No | Order controllers remain. |
| Service | No | Order services remain, with added express-only guards when store pickup is disabled. |
| DAO/Model | No | Order and store DAO/model classes remain. |
| Menu records | No | Store/write-off menu records remain hidden by MVP menu rules. |
| Data tables | No | Store and order tables remain. Runtime store-pickup business rows are still `0` in the related checks. |
| Install SQL / migration files | No | Install and upgrade metadata remain unchanged. |

### Runtime Checks

| Path | HTTP | Payload status | Result |
| --- | --- | --- | --- |
| `/api/order/check_shipping` | `200` | `401` | Preserved control path; original login requirement remains. |
| `/api/store_list` | `200` | `400` | `MVP module disabled` |
| `/api/order/order_verific` | `200` | `400` | `MVP module disabled` |
| `/api/product/detail/1` | `200` | `200` | Control path remains healthy. |

### Authenticated Checkout Smoke Test

An authenticated mobile API smoke test was run with a temporary user address and a direct-buy cart item. The request intentionally submitted `shipping_type=2` while store pickup was disabled.

| Check | Result |
| --- | --- |
| Temporary address creation | `status=200`, address created for the smoke run only. |
| Direct-buy cart creation | `status=200`, cart key returned. |
| `POST /api/order/confirm` with `shipping_type=2` | `status=200`, `store_self_mention=false`, address remained present, no `system_store` payload was returned, and an `orderKey` was returned. |
| `POST /api/order/computed/{orderKey}` with `shipping_type=2` | `status=200`; recalculation completed through the guarded express-only path. |
| Cleanup | Temporary address delete returned `status=200`. |
| Data side effects | Active smoke addresses: `0`; pickup orders for the test user: `0`; nonzero store-id orders: `0`; verify-code orders: `0`. |

### Validation

- PHP lint passed for `/var/www/app/services/order/StoreOrderServices.php`.
- PHP lint passed for `/var/www/app/services/order/StoreOrderComputedServices.php`.
- PHP lint passed for `/var/www/app/services/order/StoreOrderCreateServices.php`.
- PHP lint passed for `/var/www/app/api/controller/v1/order/StoreOrderController.php`.

### Next Step

Do not physically delete the store-pickup/order-checkout layers yet. The next small batch should inspect order creation, payment callback, order detail, admin order list/detail, and customer-service order views to confirm every remaining `shipping_type=2`, `store_id`, and `verify_code` branch can be isolated or forced to express-only without changing normal delivery behavior.
