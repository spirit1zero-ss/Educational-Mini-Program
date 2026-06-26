# 2026-06-18 MVP mobile terminal DIY public interface slimming audit

## This time's goal

Complete the MVP disabling protection of the public DIY data interface on the mobile terminal. At the current stage, DIY code, routing files, and mini program page structures are not deleted, and non-MVP homepage decoration interfaces are only intercepted at `enable_page_diy=false`.

## Positioning results

| Project | Location | Conclusion |
| --- | --- | --- |
| v1 DIY public interface | `src/CRMEB/CRMEB-master/crmeb/app/api/route/v1.php` | Exists `diy/get_diy/[:id]` |
| v2 DIY public interface | `src/CRMEB/CRMEB-master/crmeb/app/api/route/v2.php` | Exists `diy/get_diy/[:name]`, `diy/get_version/[:name]`, `diy/get_store_status`, `diy/color_change/:name` |
| MVP API protection | `src/CRMEB/CRMEB-master/crmeb/app/api/middleware/MvpRouteBlockMiddleware.php` | Mounted in v1/v2 API routing group |
| MVP configuration | `src/CRMEB/CRMEB-master/crmeb/config/mvp.php` | `enable_page_diy=false`, this time the public DIY data interface rules are completed |

## This change

Added in `api_route_block_patterns.enable_page_diy`:

- `diy/get_diy`
- `diy/get_version`
- `diy/get_store_status`

The original `diy/color_change` remains unchanged.

## preserve boundaries

The following capabilities are not affected by this change:

- H5 MVP homepage fixed entrance.
- Training camp products, product details, ordering, WeChat payment, and payment callbacks.
- Secondary distribution relationships and commission records.
- Evaluation records.
- Check-in entrance and check-in display: `diy/sign` has been reserved in the API whitelist.
- Member center, member status, member rights.

## Docker verification

PHP syntax check:

```bash
docker exec -w /var/www/crmeb crmeb-local php -l config/mvp.php
docker exec -w /var/www/crmeb crmeb-local php think clear
```

Disable interface spot testing:

```bash
curl -i http://127.0.0.1:8080/api/diy/get_diy
curl -i http://127.0.0.1:8080/api/v2/diy/get_diy
curl -i http://127.0.0.1:8080/api/v2/diy/get_version
curl -i http://127.0.0.1:8080/api/v2/diy/get_store_status
curl -i http://127.0.0.1:8080/api/v2/diy/color_change/red
```

Expected results:

```json
{"status":400,"msg":"MVP module disabled"}
```

Keep interface sampling:

```bash
curl -i http://127.0.0.1:8080/api/v2/diy/sign
curl -i http://127.0.0.1:8080/api/sign/config
curl -i http://127.0.0.1:8080/api/user/member/card/index
```

Expected results:

- Does not return `MVP module disabled`.
- In the non-login environment, the original login state error of CRMEB can be returned.

## Risk point

- If the home page of the old version of the mini program still relies heavily on `diy/get_diy`, it will return MVP interception results after disabling it; the current MVP target is a fixed entrance and no longer relies on DIY decoration home page.
- `diy/sign` must continue to be retained because the check-in page may rely on this interface.
- Before actually deleting the DIY module, you need to check the `template/uni-app/subpackage/diyComponents`, background `diy` page, theme module and database decoration data.
