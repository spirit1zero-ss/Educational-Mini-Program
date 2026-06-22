# 2026-06-22 MVP physical delete: low-risk cleanup

## Scope

This round physically removed low-risk non-runtime files while preserving the MVP product, order, payment, assessment, sign-in, member, and basic distribution/commission paths.

Deleted groups:

- CRMEB upstream helper/agent folders:
  - `src/CRMEB/CRMEB-master/.codebuddy`
  - `src/CRMEB/CRMEB-master/.trae`
- CRMEB upstream help and root reference files:
  - `src/CRMEB/CRMEB-master/help`
  - `src/CRMEB/CRMEB-master/README.md`
  - `src/CRMEB/CRMEB-master/LICENSE`
  - `src/CRMEB/CRMEB-master/安装必读.docx`
  - `src/CRMEB/CRMEB-master/template/README.md`
- Admin development-only files:
  - `src/CRMEB/CRMEB-master/template/admin/mock`
  - `src/CRMEB/CRMEB-master/template/admin/cypress.json`
  - `src/CRMEB/CRMEB-master/template/admin/.travis.yml`
  - `src/CRMEB/CRMEB-master/template/admin/workspace.code-workspace`
  - `src/CRMEB/CRMEB-master/template/admin/README.md`
  - `src/CRMEB/CRMEB-master/template/admin/CHANGELOG.md`
  - `src/CRMEB/CRMEB-master/template/admin/LICENSE`
  - `src/CRMEB/CRMEB-master/template/admin/.eslintignore`
  - `src/CRMEB/CRMEB-master/template/admin/.eslintrc.js`
  - `src/CRMEB/CRMEB-master/template/admin/.prettierignore`
  - `src/CRMEB/CRMEB-master/template/admin/.prettierrc.js`
- Backend development/reference files:
  - `src/CRMEB/CRMEB-master/crmeb/.travis.yml`
  - `src/CRMEB/CRMEB-master/crmeb/FILE_GUIDE.md`
  - `src/CRMEB/CRMEB-master/crmeb/filetree.txt`
  - `src/CRMEB/CRMEB-master/crmeb/README.md`
- Non-runtime public setup artifacts:
  - `src/CRMEB/CRMEB-master/crmeb/public/install`
  - `src/CRMEB/CRMEB-master/crmeb/public/upgrade`
  - `src/CRMEB/CRMEB-master/crmeb/public/statics/mp_view`
- Composer vendor test directories under `src/CRMEB/CRMEB-master/crmeb/vendor`.

The first deletion batch removed 54 targets and 2883 nested items. The second deletion batch removed 13 additional targets and 63 nested items.

## Preserved

This round did not delete route files, controllers, services, DAO, models, database migrations, order/payment code, product-detail code, sign-in, member, assessment, or basic distribution/commission code.

It also did not rewrite `template/uni-app/pages.json`. That file contains uni-app comments and legacy encoding; route-level physical deletion should be done with a smaller manual patch per module family to avoid corrupting mini-program page registration.

## Verification

Frontend build:

```powershell
npm.cmd ci
npm.cmd run build
```

Result:

- Vite production build passed.
- Output was written to `src/CRMEB/CRMEB-master/crmeb/public/h5`.
- `npm ci` reported existing audit issues: 1 moderate and 1 high. No dependency updates were applied.

Backend checks:

```powershell
docker start crmeb
docker exec -w /var/www/crmeb crmeb php -l config/mvp.php
docker exec -w /var/www/crmeb crmeb php -l app/api/route/v1.php
docker exec -w /var/www/crmeb crmeb php -l app/api/route/pc.php
docker exec -w /var/www/crmeb crmeb php think clear
```

Result:

- `config/mvp.php`: no syntax errors.
- `app/api/route/v1.php`: no syntax errors.
- `app/api/route/pc.php`: no syntax errors.
- `php think clear`: `Clear Successed`.

Smoke tests:

```powershell
curl.exe -i --max-time 20 http://127.0.0.1:8080/api/product/detail/1
curl.exe -i --max-time 20 http://127.0.0.1:8080/api/pc/get_products
curl.exe -i --max-time 20 http://127.0.0.1:8080/api/pc/get_news_list
curl.exe -i --max-time 20 http://127.0.0.1:8080/adminapi/user/cancel_list
```

Result:

- Product detail returned HTTP 200 with `status:200`, `msg:"success"`, and `coupons:[]`.
- PC product list returned HTTP 200 with `status:200`.
- PC news list returned `status:400`, `msg:"MVP module disabled"`.
- Admin user cancellation returned `status:400`, `msg:"MVP module disabled"`.

## Remaining risk and next deletion candidates

The next meaningful deletion round should target one disabled feature family at a time, starting with mobile live/video or CMS/news pages. Before deleting those page directories, remove the exact entries from `template/uni-app/pages.json` by a small manual patch and run the mini-program build.

Do not delete coupon, order, payment, product, sign-in, member, assessment, or basic distribution services until a deeper dependency map proves they are not used by retained MVP flows.
