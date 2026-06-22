# 2026-06-18 MVP Advanced Distribution Routing Weight Loss Audit

## This time's goal

Retain the basic secondary distribution and commission links necessary for MVP, while blocking advanced distribution entrances such as agents, business units, employee commissions, and distribution level tasks. At the current stage, the code will not be deleted, the commission generation logic will not be changed, and the payment callback closed loop will not be changed.

## Positioning results

| Project | Location | Conclusion |
| --- | --- | --- |
| Basic distribution binding | `src/CRMEB/CRMEB-master/crmeb/app/api/route/v1.php` | `user/spread` needs to be reserved for user superior relationship binding |
| Basic distribution details | `src/CRMEB/CRMEB-master/crmeb/app/api/route/v1.php` | `spread/people`, `spread/order`, `spread/commission`, `spread/count`, `spread/banner` need to be retained |
| Commission Center | `src/CRMEB/CRMEB-master/crmeb/app/api/route/v1.php` | `commission` Required to Reserve |
| Advanced agent | `src/CRMEB/CRMEB-master/crmeb/app/api/route/v1.php` | `agent/*` belongs to the advanced ability of agent/employee commission distribution |
| Business unit orders | `src/CRMEB/CRMEB-master/crmeb/app/api/route/v1.php` | `division/order` belongs to the advanced distribution capabilities of the business unit |
| Distribution level tasks | `src/CRMEB/CRMEB-master/crmeb/app/api/route/v2.php` | `v2/agent/level_list`, `v2/agent/level_task_list` belong to advanced distribution display |

## This change

- Added MVP switch:
  - `enable_advanced_distribution=false`
- Add in `api_route_force_block_patterns.enable_advanced_distribution`:
  - `agent/`
  - `v2/agent/`
- Add in `api_route_block_patterns.enable_advanced_distribution`:
  - `division/order`

`agent/` uses forced disabling priority to avoid future mismatches with the basic distribution whitelist. The base `spread/*` and `commission` are still retained in the whitelist.

## preserve boundaries

The following MVP core links are not affected by this change:

- After the payment is successful, read/bind the user's superior relationship.
- Secondary distribution commission generation.
- User Commission Center: `commission`.
- Promotional users, promotion orders, commission details: `spread/*`.
- Invitation poster: `spread/banner`.
- Backend distribution and commission viewing.

## Docker verification

PHP syntax check:

```bash
docker exec -w /var/www/crmeb crmeb-local php -l config/mvp.php
docker exec -w /var/www/crmeb crmeb-local php think clear
```

Disable interface spot testing:

```bash
curl -i http://127.0.0.1:8080/api/agent/apply/info
curl -i http://127.0.0.1:8080/api/agent/get_staff_list
curl -i http://127.0.0.1:8080/api/v2/agent/level_list
curl -i -X POST http://127.0.0.1:8080/api/division/order
```

Expected results:

```json
{"status":400,"msg":"MVP module disabled"}
```

Keep interface sampling:

```bash
curl -i http://127.0.0.1:8080/api/commission
curl -i http://127.0.0.1:8080/api/spread/count/1
curl -i http://127.0.0.1:8080/api/spread/commission/1
curl -i -X POST http://127.0.0.1:8080/api/user/spread
```

Expected results:

- Does not return `MVP module disabled`.
- In the non-login environment, the original login state error of CRMEB can be returned.

## Risk point

- Agents/Business Departments and basic secondary distribution share some user fields. Currently, only interface interception is performed, and no database or model deletion is performed.
- `division/order` belongs to the business department promotion order and is not equivalent to the basic `spread/order`; the basic promotion order will continue to be retained.
- If you want to enable advanced agents or divisions later, just open `enable_advanced_distribution` or narrow down the corresponding rules.
