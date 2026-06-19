# 2026-06-19 MVP slimming: PC CMS route coverage

## Scope

- Round scope: PC public CMS/news route residuals.
- Strategy: add MVP route middleware to the PC public route group and block only PC news routes through the CMS switch.
- Branch target: `dev3`.

## Existing state reviewed

- Mobile/API CMS routes were already blocked by `api_route_block_patterns.enable_cms`:
  - `article/`
  - `theme/article`
- PC public routes still exposed CMS/news endpoints in `app/api/route/pc.php`:
  - `get_news_category`
  - `get_news_list`
  - `get_news_detail/:id`
- The same PC public group also contains retained product and storefront routes, so any new block rule must stay narrow.

## Changes made in this round

- `app/api/route/pc.php`
  - Added `MvpRouteBlockMiddleware` to the PC public route group.
- `config/mvp.php`
  - Added `get_news_` under `api_route_block_patterns.enable_cms`.

## Explicitly not changed

- Did not block PC product list, product routine code, city list, company info, recommended products, good products, banner, or order-status polling routes.
- Did not block login, users, products, orders, WeChat pay, pay callback, second-level distribution, commissions, sign-in, assessment, or member features.
- Did not delete route definitions, controllers, models, tables, or frontend pages.
- Did not run a complete mini-program build in this round.

## Verification notes

- Docker verification completed:
  - `php -l config/mvp.php`
    - Result: no syntax errors.
  - `php -l app/api/route/pc.php`
    - Result: no syntax errors.
  - `php think clear`
    - Result: `Clear Successed`.
  - `GET /api/pc/get_news_list`
    - Result: HTTP 200 wrapper with `{"status":400,"msg":"MVP module disabled"}`.
  - `GET /api/pc/get_products`
    - Result: HTTP 200 wrapper with `{"status":200,"msg":"success"}` and product list data; not `MVP module disabled`.
  - `GET /api/product/detail/1`
    - Result: HTTP 200 wrapper with `{"status":200,"msg":"success"}` and `coupons: []`.
