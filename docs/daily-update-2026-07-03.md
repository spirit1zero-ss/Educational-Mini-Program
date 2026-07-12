# 2026-07-03 Project Update

## Scope

This update records the native mini program cleanup, registration entry adjustment, local Docker database rebuild, and smoke-test status for the `dev2` branch.

## Code Changes

- The `Mine` page registration card now opens the dedicated registration payment page at `/pages/camp-checkout/camp-checkout`.
- The retired surface contract test was removed because it targeted old CRMEB/uni-app surfaces that are no longer part of this mini program delivery.
- The mini program `npm test` command now runs a maintained smoke test instead of the deleted retired-surface contract.

## Smoke Test Coverage

The new smoke test checks:

- Mini program business JavaScript syntax.
- Mini program JSON parsing.
- `app.json` page registration completeness.
- Required `.js`, `.wxml`, `.json`, and `.wxss` files for every registered page.
- Fixed page navigation references point to registered pages.

Manual verification during the rebuild also confirmed:

- `offline.wxml` exists and is registered.
- Protected mini program backend endpoints return `401 请登录` without a token.
- `/api/index` responds successfully after MySQL and Redis are available.

## Docker Database Rebuild

The old local `crmeb_mysql` container referenced a deleted untracked bind mount:

`src/CRMEB/CRMEB-master/help/docker/mysql/data`

The replacement container now uses the named Docker volume:

`crmeb_mysql_data`

Rebuild summary:

- Recreated `crmeb_mysql` with the original MySQL image and credentials.
- Imported `public/install/crmeb.sql`.
- Imported the `up` portion of local upgrade SQL files.
- Verified `159` tables in the `crmeb` database.
- Verified key project tables:
  - `eb_miniapp_member_referrer_locks`
  - `eb_education_assessment_records`

## Current Known Gaps

- The registration payment page currently opens correctly, but the final WeChat payment call is still not wired. The page shows a payment placeholder, and the backend member order endpoint creates an order but does not yet return `wx.requestPayment` parameters.
- Public deployment cleanup is still recommended for CRMEB public installer and backup admin assets before production release.
