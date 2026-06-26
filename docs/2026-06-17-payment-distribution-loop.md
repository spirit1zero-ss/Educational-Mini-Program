# 2026-06-17 MVP closed-loop instructions for payment orders and distribution commissions

## This time's goal

Check and strengthen the closed loop of CRMEB MVP’s order and secondary distribution commission after successful WeChat payment:

WeChat payment is successful -> Payment callback verification -> Update order as paid -> Bind or read user superior relationship -> Generate commission record according to two-level distribution rules -> Commission record can be viewed in the background.

This time, the payment logic was not rewritten, nor was the original order state machine of CRMEB changed. The changes only supplement the troubleshooting log and confirm that commission generation in the existing state machine occurs during the confirmation of receipt phase.

## Payment callback entry

- Routing entry: `src/CRMEB/CRMEB-master/crmeb/app/api/route/v1.php`
- Route: `Route::any('pay/notify/:type', 'v1.PayController/notify')`
- Controller: `src/CRMEB/CRMEB-master/crmeb/app/api/controller/v1/PayController.php`
- Event monitoring: `src/CRMEB/CRMEB-master/crmeb/app/listener/pay/NotifyListener.php`

New log:

- `mvp_pay_notify_received`
- `mvp_pay_notify_dispatch`

Used to confirm whether the WeChat payment notification enters the CRMEB event chain and records key fields such as `pay_type`, `attach`, `out_trade_no`, `transaction_id`.

## Order status update location

- Business entrance: `src/CRMEB/CRMEB-master/crmeb/app/services/pay/PayNotifyServices.php`
- Product order callback method: `wechatProduct($order_id, $trade_no, $payType)`
- Order payment successfully processed: `src/CRMEB/CRMEB-master/crmeb/app/services/order/StoreOrderSuccessServices.php`
- Core method: `paySuccess(...)`

The existing logic would be:

- Query orders based on `order_id`
- Paid orders are returned directly, maintaining idempotence.
- Unpaid order updates `paid`, `pay_type`, `pay_time`, `trade_no`
- Trigger `OrderPaySuccessListener`

New log:

- `mvp_pay_product_notify_start`
- `mvp_pay_product_notify_order_missing`
- `mvp_pay_product_notify_already_paid`
- `mvp_pay_product_notify_finish`
- `mvp_pay_product_notify_error`
- `mvp_order_pay_success_update`
- `mvp_order_pay_success_event_dispatched`

## Distribution relationship reading position

- Job after order creation: `src/CRMEB/CRMEB-master/crmeb/app/jobs/OrderCreateAfterJob.php`
- Superior reading method: `src/CRMEB/CRMEB-master/crmeb/app/services/user/UserServices.php`
- Core method: `getSpreadUid(...)`

CRMEB is precalculated and written after order creation:

- `spread_uid`
- `spread_two_uid`
- `one_brokerage`
- `two_brokerage`

New log:

- `mvp_order_brokerage_precomputed`

Used to check whether the order has correctly read the first-level and second-level parent relationships, and whether the commission amount has been precalculated.

## Commission generation location

CRMEB's existing state machine does not generate commission records for ordinary commodities at the moment of successful payment, but generates commissions during the confirmation of receipt phase.

- Confirm receipt service: `src/CRMEB/CRMEB-master/crmeb/app/services/order/StoreOrderTakeServices.php`
- First level commission: `backOrderBrokerage(...)`
- Secondary commission: `backOrderBrokerageTwo(...)`
- Commission flow is written: `src/CRMEB/CRMEB-master/crmeb/app/services/user/UserBrokerageServices.php`
- Core method: `income(...)`

New log:

- `mvp_order_take_brokerage_start`
- `mvp_order_brokerage_income_one`
- `mvp_order_brokerage_income_two`

It is used to confirm whether the first-level and second-level commissions are calculated, recorded and generated after the order is received.

## View location in the background

Backend commission list routing:

- `src/CRMEB/CRMEB-master/crmeb/app/adminapi/route/finance.php`
- `GET finance/commission_list`
- Controller: `v1.finance.Finance/get_commission_list`

Backend orders, users, and products still use the original backend module of CRMEB.

## Docker local verification results

This time, it is verified by Docker and does not rely on the host `php` command.

Currently available containers:

- `crmeb-local`
- Visit address: `http://127.0.0.1:8080`

Passed in-container PHP syntax check:

```bash
docker exec -w /var/www/crmeb crmeb-local php -l app/listener/pay/NotifyListener.php
docker exec -w /var/www/crmeb crmeb-local php -l app/services/pay/PayNotifyServices.php
docker exec -w /var/www/crmeb crmeb-local php -l app/services/order/StoreOrderSuccessServices.php
docker exec -w /var/www/crmeb crmeb-local php -l app/services/order/StoreOrderTakeServices.php
docker exec -w /var/www/crmeb crmeb-local php -l app/jobs/OrderCreateAfterJob.php
```

The results are:

```text
No syntax errors detected
```

Service connectivity:

```bash
docker exec crmeb-local bash -lc "mysqladmin -uroot -p123456 ping"
docker exec crmeb-local bash -lc "redis-cli -a 123456 ping"
```

result:

- MySQL：`mysqld is alive`
- Redis：`PONG`

Background dynamic interface verification:

```bash
curl -i http://127.0.0.1:8080/adminapi/auth
```

If not logged in, `401 login expired` is returned, which is an expected result, indicating that the dynamic interface is reachable.
## Local simulation test method

1. Start the all-in-one container:

```bash
docker start crmeb-local
```

2. If the dynamic interface times out, clear the ThinkPHP cache first:

```bash
docker exec -w /var/www/crmeb crmeb-local php think clear
```

3. Verify the background dynamic interface:

```bash
curl -i http://127.0.0.1:8080/adminapi/auth
```

4. Create an order and initiate WeChat payment:

- Mini program to enter the product details of the training camp
- Create order
- Initiate WeChat payment
- After the payment is successful, wait for the real callback from WeChat

5. View log keywords:

```bash
docker exec crmeb-local bash -lc "grep -n 'mvp_pay_notify\|mvp_order_pay_success\|mvp_order_brokerage' /var/www/crmeb/runtime/log/20260617.log /var/www/crmeb/runtime/log/20260617_error.log 2>/dev/null | tail -80"
```

6. Check the commission after confirming receipt:

- Backend order list confirms order status
- Backend financial commission list to view commission records
- Log view `mvp_order_brokerage_income_one` and `mvp_order_brokerage_income_two`

## Risk point

- Ordinary `curl POST /api/pay/notify/wechat` cannot simulate real WeChat payment callbacks; it will get stuck in the SDK verification/parsing layer when WeChat signatures and valid notification messages are missing.
- CRMEB ordinary commodity commission records are generated according to the original state machine during the receipt confirmation stage, not at the moment of successful payment.
- The warehouse's own `help/docker/docker-compose.yml` is a separate container. Currently, `.env` uses `127.0.0.1`, and the independent MySQL/Redis cannot be connected in the `crmeb_php` container. Current local verification should give priority to using the integrated `crmeb-local` container, or adjusting the compose environment variable and `.env`.
- `runtime/`, `install.lock`, Docker MySQL data, and log files are all local running products and should not be submitted to GitHub.
- Today we only enhanced the log and acceptance path, and did not modify the payment gateway, order status flow and commission generation rules.

