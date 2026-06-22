# 2026-06-19 MVP PC CMS routing coverage audit
## scope
- Scope of this round: PC public CMS/news routing remnants.
- Strategy: Add MVP routing middleware to PC public routing group and intercept PC news routing only via CMS switch.
- Target branch: `dev3`.
## Checked status
- Mobile/API CMS route intercepted by `api_route_block_patterns.enable_cms`:
  - `article/`
  - `theme/article`
- PC public route still exposes CMS/news interface in `app/api/route/pc.php`:
  - `get_news_category`
  - `get_news_list`
  - `get_news_detail/:id`
- The same PC public routing group also contains reserved product and mall front-end routing, so the new interception rules must remain accurate.
## Changes in this round
- `app/api/route/pc.php`
  - Added `MvpRouteBlockMiddleware` for PC public routing group.
- `config/mvp.php`
  - Added `get_news_` under `api_route_block_patterns.enable_cms`.
## Clearly unchanged
- PC product lists, product applet codes, city lists, company information, recommended products, premium products, banners or order status polling routes are not blocked.
- Login, user, product, order, WeChat payment, payment callback, secondary distribution, commission, check-in, evaluation or membership functions are not blocked.
- Route definitions, controllers, models, data tables, or front-end pages are not deleted.
- The complete applet construction was not performed in this round.
## Verify records
- Docker verification completed:
  - `php -l config/mvp.php`
    - Result: No syntax errors.
  - `php -l app/api/route/pc.php`
    - Result: No syntax errors.
  - `php think clear`
    - Result: `Clear Successed`.
  - `GET /api/pc/get_news_list`
    - Result: HTTP 200 wrapped response with content `{"status":400,"msg":"MVP module disabled"}`.
  - `GET /api/pc/get_products`
    - Result: HTTP 200 wrapped response with content `{"status":200,"msg":"success"}` and product list data, not `MVP module disabled`.
  - `GET /api/product/detail/1`
    - Result: HTTP 200 wrapped response with content `{"status":200,"msg":"success"}` and `coupons: []`.