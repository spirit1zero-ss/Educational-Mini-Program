# Backend Slimming - 2026-07-06

## Goal

Reduce the CRMEB backend surface for the native mini program before launch.

## Removed or Closed

- Removed PC API routing and controllers.
- Removed legacy v2 API routing and controllers.
- Replaced the broad v1 route file with a mini program allowlist.
- Removed legacy storefront API controllers for store, cart, product, user center, refund, and old order flows.
- Removed legacy WeChat/H5 API controllers that are not used by the native mini program.
- Removed the external `outapi` app, including MCP/open API endpoints.
- Removed external API push listener, service, DAO, and model classes.
- Removed no-op external API push event calls from shared order and user services.
- Removed old mobile storefront entry `public/mobile.html`.
- Removed the remaining old mobile storefront entry `public/index.html` and its compiled `public/static` bundle.
- Removed old storefront page bundles under `public/pages/activity`, `columnGoods`, `goods`, `points_mall`, and `users`.
- Added Nginx 404 blocks for `/outapi`, `/mobile.html`, `/index.html`, `/static`, and removed old storefront page paths to avoid frontend fallback returning 200.

## Kept

- Native mini program login: `/api/miniapp/auth/login`.
- Native mini program mine, referral, redeem code, member plan, member order, and order list APIs.
- Education assessment record API.
- Payment and transfer notify callbacks.
- Minimal public support endpoints: `/api/index` and `/api/site_config`.
- Admin API and admin frontend assets.
- Shared services, models, DAO, payment, user, WeChat, and member-card logic used internally by the mini program.

## Rollback

This change is intentionally separate from the previous security hardening commit. If a removed legacy API is unexpectedly needed, revert only the backend slimming commit and keep the security hardening commit.
