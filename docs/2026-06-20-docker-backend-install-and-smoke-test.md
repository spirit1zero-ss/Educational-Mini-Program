# 2026-06-20 Docker backend installation and interface smoke test records
## Goal of this round
Install and start the Docker backend service on the local machine, complete the local running configuration of CRMEB, complete the core interface smoke test, and provide a retestable environment for subsequent MVP slimming down small batches.
## Docker service status
The project has been started through Docker Desktop and comes with Docker orchestration:
```powershell
cd src/CRMEB/CRMEB-master/help/docker
docker compose up -d
```

Current container:
- `crmeb_nginx`: External port `8011`
- `crmeb_php`
- `crmeb_mysql`: External port `33061`
- `crmeb_redis`: External port `63791`
Local access address:
```text
http://127.0.0.1:8011
```

## Local installation processing
The project installer requires that the `crmeb/public/install/.env` template exists. This file has not been submitted in the current warehouse, and `.gitignore` has ignored `.env`, so this round only locally completes the installation template to generate the running configuration.
The installer is complete:
- Generate `src/CRMEB/CRMEB-master/crmeb/.env`
- Generate `src/CRMEB/CRMEB-master/crmeb/public/install.lock`
- import `crmeb/public/install/crmeb.sql`
- Initialize database `crmeb`
- Initialize the background administrator account
Local administrator account:
```text
Account: admin
Password: crmeb123456
```

Note: The above `.env`, `install.lock`, and Docker MySQL data directories are all local running products and have been ignored by `.gitignore` and should not be submitted.
## Verify records
Executed:
```powershell
docker exec -w /var/www crmeb_php php think clear
curl http://127.0.0.1:8011/api/version
curl http://127.0.0.1:8011/api/product/detail/1
curl http://127.0.0.1:8011/api/pc/get_products
curl http://127.0.0.1:8011/api/pc/get_news_list
curl http://127.0.0.1:8011/adminapi/user/user
curl http://127.0.0.1:8011/adminapi/user/cancel_list
curl http://127.0.0.1:8011/adminapi/product/product
curl http://127.0.0.1:8011/adminapi/product/product/get_template
curl http://127.0.0.1:8011/adminapi/product/product/get_temp_keys
curl http://127.0.0.1:8011/adminapi/product/product/import_card
curl -X POST http://127.0.0.1:8011/adminapi/product/product_import
curl -X POST http://127.0.0.1:8011/adminapi/product/crawl
```

result:
- `GET /api/version`
  - `status=200`
  - `msg=success`
  - Return version `CRMEB-KY v6.0.0`
- `GET /api/product/detail/1`
  - `status=200`
  - `msg=success`
  - Return `coupons=[]`
- `GET /api/pc/get_products`
  - `status=200`
  - `msg=success`
  - Product list can be returned
- `GET /api/pc/get_news_list`
  - `status=400`
  - `msg=MVP module disabled`
- `GET /adminapi/user/user`
  - Returns `status=401` when not logged in
  - `msg=login expired, please log in again`
  - Not an MVP interception
- `GET /adminapi/user/cancel_list`
  - `status=400`
  - `msg=MVP module disabled`
- `GET /adminapi/product/product`
  - Returns `status=401` when not logged in
  - `msg=login expired, please log in again`
  - Not an MVP interception
- Test after logging in to the backend:
  - `GET /adminapi/product/product/get_template`
  - `GET /adminapi/product/product/get_temp_keys`
  - `GET /adminapi/product/product/import_card`
  - Both return `status=400`, `msg=MVP module disabled`
- Physically deleted product collection/product migration interface:
  - `POST /adminapi/product/product_import`
  - `POST /adminapi/product/crawl`
  - both return `HTTP=404`
  - This is consistent with the current status of deleted routes.
## Notes
- Docker Desktop is installed and available, but the current PowerShell session may not automatically load the Docker path; if you encounter that the `docker` command is not available, you can open a new terminal, or temporarily add `C:\Program Files\Docker\Docker\resources\bin` to the current session `Path`.
- There is an obvious slow start in the first request of the official application. This round of `GET /api/version` takes about 19 seconds for the first time; some subsequent interfaces may still return between 20-40 seconds. It is recommended to set a longer timeout when performing smoke tests.
- `GET /adminapi/product/product/get_template` and other backend product extension interfaces will first return `401` when there is no login status; you need to log in to the backend and carry `Authori-zation: Bearer <token>` to verify the MVP interception results.
- `product_import` and `crawl` have completed physical removal, so subsequent expectations should be adjusted from `MVP module disabled` to `HTTP=404`.
## Next step suggestions
The next round of suggestions is only for evaluation, not direct deletion:
- Split the references of `productGetTemplateApi` in the product main process, batch logistics settings, and disabled marketing activities.
- Split references to `productGetTempKeysApi` in the generic video upload component and disabled marketing/renovation pages.
- Separately confirm whether `product/product/import_card` only serves virtual card password extensions.
It is recommended to fix the verification method before entering the next round:
- Backend interface smoke test uses `http://127.0.0.1:8011`
- The background login account uses the local administrator account of this round.
- The background extension interface must be logged in before testing MVP interception
- At least retest after each round of changes:
  - `GET /api/product/detail/1`
  - `GET /api/pc/get_products`
  - `GET /api/pc/get_news_list`
  - `GET /adminapi/product/product`
  -Backend extension interface within the current evaluation scope