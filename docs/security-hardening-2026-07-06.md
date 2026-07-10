# 2026-07-06 Security Hardening

## Scope

This pass addresses the concrete pre-launch security items identified during the mini program review.

## Changes

- Removed public access to the CRMEB installer by deleting `crmeb/public/install`.
- Added an nginx config under `crmeb/deploy/nginx/default.conf` with explicit `404` blocks for `/install` and `/admin_backup`.
- Preserved database bootstrap SQL outside the public web root:
  - `crmeb/database/install/crmeb.sql`
  - `crmeb/database/install/membership_level_upgrade.sql`
- Moved the upgrade `.env` template dependency out of `public/install`:
  - `crmeb/database/install/env.template`
- Removed the public admin backup directory `crmeb/public/admin_backup_*`.
- Disabled local debug flags in `crmeb/.env`.
- Added an allowlist for mini program referral poster pages. Unsupported page values now fall back to `pages/home/home`.

## Remaining Production Checks

- Confirm production `.env` also has debug disabled.
- Confirm Nginx/PHP points only at `crmeb/public` and no backup directories are deployed.
- Confirm mini program API domains are HTTPS and configured in the WeChat platform.
