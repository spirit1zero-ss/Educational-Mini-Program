# 2026-06-19 MVP Slimming: backend public customer service interface closing audit
## scope
Continue with MVP soft slimming without deleting files, route definitions, controllers, services, models, database tables, or front-end pages.
In this round, only one backend public interface remains:
- `GET /adminapi/get_workerman_url`

This interface is used to obtain customer service long connection related data. The customer service capability is currently disabled in MVP mode, so this interface should also enter the unified interception range.
## This adjustment
Adjustment file:
- `src/CRMEB/CRMEB-master/crmeb/config/mvp.php`
- `src/CRMEB/CRMEB-master/crmeb/app/adminapi/route/route.php`

Adjustments:
- Add `get_workerman_url` to the background routing interception rules of `enable_customer_service`.
- Add `MvpRouteBlockMiddleware` to the background unlogged public routing group.
This middleware matches paths according to configuration rules, so common basic entrances such as background login, login information, verification code, scan code upload, and background custom JS will not be intercepted; only interfaces that hit disabled MVP module rules will return `MVP module disabled`.
## Reserved capabilities
This round does not affect:
- Backend login.
-Backend verification code and login information.
-Backend menu loading.
- Products, orders, payment, education, check-in, membership and basic distribution links.
- Existing customer service source code, controller, page and kefu API files.
## Verify records
Local syntax check performed:
```powershell
php -l src/CRMEB/CRMEB-master/crmeb/config/mvp.php
php -l src/CRMEB/CRMEB-master/crmeb/app/adminapi/route/route.php
```

result:
- `config/mvp.php` No syntax error found.
- `app/adminapi/route/route.php` No syntax error found.
After the CRMEB container is running, it is recommended to supplement the interface sampling test:
```powershell
Invoke-WebRequest -UseBasicParsing -Uri http://127.0.0.1:8080/adminapi/login/info
Invoke-WebRequest -UseBasicParsing -Uri http://127.0.0.1:8080/adminapi/get_workerman_url
```

expected:
- `GET /adminapi/login/info` is still accessible.
- `GET /adminapi/get_workerman_url` returns `MVP module disabled` when `enable_customer_service=false` is used.
## Follow-up remarks
The larger `serve` routing group still contains interfaces related to ONLY, SMS, and electronic forms. This round did not deal with it because the SMS configuration may belong to operational reserve capabilities and needs to be judged individually before deciding whether to intercept.