# Repository Slimming - 2026-07-10

## Result after phase 1

- Total project size: about 224.0 MB -> 205.2 MB.
- Native mini program directory: about 11.4 MB -> 1.57 MB.
- Existing mini program smoke test remains green: 21 pages, 30 JavaScript files, and 28 JSON files.

## Result after admin pruning (2026-07-11)

- Total project size: about 224.0 MB originally -> 177.03 MB.
- Admin source: 845 files / 30.3 MB -> 305 files / 2.12 MB.
- Source-only scope after excluding PHP `vendor` and built `public/admin`: 1,707 files / 43.75 MB.
- The native mini program remains at 1.57 MB and all tests remain green.
- The existing `public/admin` build is intentionally unchanged. Rebuild it before deployment to publish the pruned admin source.

## Removed

- Retired CRMEB H5 storefront output: `crmeb/public/static` and `crmeb/public/index.html`.
- Unrelated editor-agent configuration: `.codebuddy` and `.trae`.
- Unreferenced mini program design previews and stale asset documentation.
- Superseded large PNG/JPEG source files after optimized replacements were verified.

## Optimized images

Seven large RGB illustrations were resized for mobile display and converted to high-quality progressive JPEG. Their combined size dropped from about 10.4 MB to about 0.9 MB. All page references were updated to the new `.jpg` files.

## Intentionally kept

- `crmeb/vendor` (about 102.8 MB): required for an immediately runnable PHP backend.
- `template/admin` (about 31.2 MB): editable admin frontend source.
- `crmeb/public/admin` (about 30.5 MB): built admin frontend used by the deployed backend.
- `crmeb/public/statics`: fonts and assets referenced by poster, watermark, and backend services.
- Database install and patch SQL files.

## Optional next cuts

Choose these only after deciding how this repository will be used:

1. Source-only repository: remove `crmeb/vendor`, keep `composer.lock`, and run `composer install --no-dev --optimize-autoloader` during setup/deployment. Saves about 102.8 MB.
2. Deployment-only backend: keep `crmeb/public/admin` and remove `template/admin` if admin UI development is no longer needed. Saves about 31.2 MB.
3. Admin-development repository: keep `template/admin` and rebuild `crmeb/public/admin` for deployment instead of storing the build output. Saves about 30.5 MB locally, but the admin page is unavailable until rebuilt.
4. Mini-program-only repository: remove the entire CRMEB tree only if the API is hosted and maintained elsewhere. The current mini program defaults to `http://127.0.0.1:8011` and calls the CRMEB API, so this is not currently safe.
