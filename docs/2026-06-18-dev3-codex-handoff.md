# CRMEB MVP slimming dev3 handover document
## Document language convention
Subsequently added or updated handover, audit, and verification records under `docs/` will use Chinese by default. Commands, paths, interfaces, configuration names, JSON fields, status codes, and submission information examples remain in their original text to avoid affecting replication execution and troubleshooting.
## Read here first: work to be continued on another computer
The core of this handover document is not to let another computer re-plan the project, but to let Codex on the other computer continue to complete the MVP slimming that is currently unfinished.
Do not initiate mass physical deletions at this time. Please continue to press "Small rounds of soft slimming" to complete the remaining entrances and interface residues. After each round, it must be submitted and pushed to `dev3`, and then stopped to wait for user confirmation.
### The most important unfinished tasks at the moment
1. Handle the remaining coupons in the product details response.
   - Phenomenon: `/api/product/detail/1` still returns the `coupons` field.
   - Target: Product details no longer bring out coupon data in MVP mode.
   - Requirements: Only leave blank or hide `coupons` when `enable_coupon=false`, do not delete the coupon service, do not change the order logic, and do not affect the opening of product details.
2. Continue to check whether there are non-MVP entrances in the front desk/H5/mini program.
   - Prioritize checking coupons, customer service, live broadcasts, short videos, CMS, points mall gameplay, stores, self-pickup, write-off, pre-sales, flash sales, group buying, and bargaining.
   - Only hide the entrance or add MVP interception, do not delete it physically.
3. Continue to check whether there are non-MVP menus or buttons in the background.
   - Prioritize checking product details, product editing, user details, decoration page, marketing page, and settings page.
   - Do not repeat changes that have been processed, read `docs/2026-06-18-mvp-slimming-*.md` first.
4. Continue to complete the MVP interception on the interface side.
   - If the front-end entrance has been hidden, but the interface can still directly access non-MVP functions, priority should be given to back-end MVP interception.
   - Don't delete route files, use existing MVP middleware or config switches first.
5. Add or update an audit document in each round.
   - Documentation is placed in `docs/`.
   - Write down clearly what was processed in this round, what was not processed, verification commands, and risk points.
### Directly implement the recommendations in the next round
It is recommended to do the following in the next round:
```text
Hide the coupons response field in the product detail API when MVP mode is enabled.
```

Execution order:
1. Use `rg` to locate the product details interface and `coupons` to assign the location.
2. Find the existing MVP configuration reading method and reuse `enable_coupon=false` first.
3. Minimal changes in product details response assembly: MVP sets `coupons=[]` or does not return this field when coupons are disabled.
4. Do not change the order, payment, commission, or delete the coupon list.
5. Run Docker to verify:
```powershell
docker exec -w /var/www/crmeb crmeb-local php think clear
curl.exe -i --max-time 20 http://127.0.0.1:8080/api/product/detail/1
curl.exe -i --max-time 20 http://127.0.0.1:8080/adminapi/marketing/coupon/released
```

6. Confirm that the product details are still `status:200`, and the coupon interface still returns `MVP module disabled`.
7. Add an audit document, submit and push `dev3`, and then wait for user confirmation.
### Things not to do right now
- Do not physically remove the module.
- Do not clean the database tables.
- Do not rewrite payments.
- Do not change the order state machine.
- Do not delete codes related to check-in, membership, secondary distribution, and commission.
- Don't work on multiple modules at once.
## Handover purpose
Users need to switch to another computer to continue development. This branch is used to transfer the current local project status to the Codex on another computer.
New branch:
- `dev3`

Current work focus:
- Only do CRMEB MVP soft slimming.
- Each round must be stopped to allow the user to confirm before proceeding to the next round.
- At the current stage, the code is not physically deleted, the payment is not changed, and the order state machine is not destroyed.
## Another computer takes over
```powershell
git fetch origin
git checkout dev3
```

If there is no `dev3` locally:
```powershell
git fetch origin
git checkout -b dev3 origin/dev3
```

## Current context
Latest handover submission:
- `13a3a55a fix: hide MVP diy coupon config entries`

Before this submission, the project had completed multiple rounds of MVP soft slimming, with the main direction being to hide or block non-MVP entries rather than delete files.
Important rules:
- Keep the check-in function.
- Retain membership functions.
- Retain users, products, orders, WeChat payment, payment callbacks, secondary distribution, commissions, evaluations, and background core viewing.
- Don't rewrite payments.
- Does not destroy the order state machine.
- No batch physical deletion is performed.
- Only one clear range is processed in each round, and it waits for user confirmation after submission and push.
## Completed slimming direction
Completed multiple rounds of soft slimming, coverage includes:
- Optional entrance hiding on user side.
- DIY optional entrance hiding for old version users.
- The optional ability entrance is hidden on the settlement page.
- Optional user routing interception in the backend.
- Offline store/verification/offline payment related routing interception.
- Advanced distribution/agent/business department related route interception.
- Mobile merchants manage route interception.
- Block DIY public interfaces on the mobile terminal while retaining sign-in related interfaces.
- Customer service and kefuapi related route interception.
- The advanced entrance to the backend homepage is hidden.
- The backend product and user marketing entrances are hidden.
- The coupon entrance of the new editing page of the backend products is hidden.
- The user details coupon tab in the background is hidden.
- The backend DIY/decoration coupon configuration entrance is hidden.
Relevant audit documents are in `docs/2026-06-18-mvp-slimming-*.md`.
## The latest round of specific changes
The latest round is the closure of the background DIY/decoration coupon configuration:
- `src/CRMEB/CRMEB-master/template/admin/src/components/mobileConfig/c_custom_component.vue`
  - Filter `coupon` in custom component `selectType` in MVP mode.
  - If `coupon` is selected for historical data, it will be downgraded to `user`.
  - The coupon data source, coupon selector, and coupon filters are no longer displayed.
- `src/CRMEB/CRMEB-master/template/admin/src/components/mobilePage/home_custom_component.vue`
  - Historical `coupon` custom component degradation preview in MVP mode.
  - `fetchCouponList()` Adds a guarantee and no longer requests the coupon list.
- `src/CRMEB/CRMEB-master/template/admin/src/pages/setting/devise/diyIndex.vue`
  - Filter independent coupon components in the left component panel in MVP mode.
Audit documents:
- `docs/2026-06-18-mvp-slimming-admin-diy-coupon-config-audit.md`

## Next round of suggestions
In the next round, it is recommended not to expand the scope, but to prioritize one clear small point:
### Suggested next round: Coupon field in product details response
Found during Docker verification:
- `GET http://127.0.0.1:8080/api/product/detail/1`
- Return `status:200`
- But the response data still contains the historical `coupons` field.
It is recommended to locate the location where `coupons` is generated by the product details interface in the next round, and handle it with minimal changes in MVP mode:
- Does not affect the opening of product details.
- Does not affect order creation.
- Does not affect member prices, product specifications, and inventory.
- Does not affect orders, payments, payment callbacks, and commissions.
- Hide or null the coupon data in the product detail response only when `enable_coupon=false`.
Note: This may involve the backend product details service, do not delete the coupon service or database fields.
## Local verification command
Backend front-end construction:
```powershell
cd src/CRMEB/CRMEB-master/template/admin
npm run build
```

Docker backend clear cache:
```powershell
docker exec -w /var/www/crmeb crmeb-local php think clear
```

Core interface returns:
```powershell
curl.exe -i --max-time 20 http://127.0.0.1:8080/api/product/detail/1
curl.exe -i --max-time 20 http://127.0.0.1:8080/adminapi/marketing/coupon/released
```

expect:
- The product details interface returns `HTTP/1.1 200 OK`, JSON `status:200`.
- The background coupon interface returns `{"status":400,"msg":"MVP module disabled"}`.
Code inspection:
```powershell
git diff --check
git status --short --branch
```

## Known non-blocking hints
In the background, `npm run build` currently displays existing warnings:
- `mini-css-extract-plugin` CSS order warning.
- The resource size exceeds the recommended limit.
- `Browserslist` data is older.
These warnings exist before and after the current round of slimming. As long as the build exit code is 0, it is not considered a failure in this round.
Git may prompt:
- `LF will be replaced by CRLF`
- `There are too many unreachable loose objects`

The former is a Windows line break prompt; the latter is a warehouse maintenance prompt. Unless explicitly requested by the user, do not do warehouse cleaning during slimming rounds.
## How to hand over to the next Codex
1. Read this document and the most recent round of corresponding audit documents first.
2. Choose only a small range in each round.
3. Locate files and existing logic before making changes.
4. Priority is given to using the existing `mvp` configuration switch.
5. Perform soft hiding or soft interception without physical deletion.
6. You must run the local verification command.
7. Add or update the corresponding docs audit document.
8. After submitting and pushing, stop and wait for the user to confirm the next round.
## Don’t delete the function by mistake
These are MVP retention capabilities:
- Log in with WeChat applet.
- Backend user list.
- MVP homepage entrance.
- Training camp products and product details.
- Create an order.
- WeChat Pay.
- Payment callback.
- The order becomes paid.
- Secondary distribution relationship binding.
- Secondary commission record generation.
- View backend users, orders, products, reviews, distribution, and commissions.
- Sign in.
- Membership.
## Key Risks
- The original module of CRMEB is deeply coupled, and many advanced capabilities such as coupons, balances, points, stores, and distribution will appear indirectly through products, users, and order services.
- Dependencies must be checked before physical deletion. Do not delete the directory directly.
- The product details interface may still bring out the historical marketing field, which is a candidate for the next round, but be careful not to affect the normal product purchase link.
- The distribution module cannot be deleted as a whole, only basic second-level distribution/commission and advanced agents/business units can be distinguished.
- Sign-in may depend on the underlying flow of points, and the underlying ability of points cannot be deleted directly.
## Complete execution plan before physical deletion
In this section, the Codex of another computer can be used directly as a task runbook. The goal is to complete a "proof of deletability" before moving onto physical deletion. Before completing the acceptance of this section, deleting directories, deleting database tables, deleting core service classes, or deleting routing files is not allowed.
### General principles
1. Continue to use each round of confirmation mechanism: after completing each round of planning, code, verification, submission, and push, you must stop and wait for user confirmation.
2. Only process one module family in each round, such as "Coupon Display Residual", "Customer Service Module" and "Live Broadcast Module". Do not batch delete across modules.
3. Complete the soft slimming stabilization period before physical deletion to confirm that the MVP core link is still operational.
4. Any candidate for deletion must first demonstrate that it is not dependent on MVP retention capabilities.
5. For modules associated with database tables, order fields, user fields, and product fields, only hiding, blanking, bypassing, and document marking are allowed first, and direct deletion of tables is not allowed.
### Phase 0: Takeover environment confirmation
implement:
```powershell
git fetch origin
git checkout -b dev3 origin/dev3
git status --short --branch
```

confirm:
- The current branch is `dev3`.
- The working tree is clean.
- The latest commit contains this handover document.
If Docker verification is required:
```powershell
docker ps
docker exec -w /var/www/crmeb crmeb-local php think clear
```

If the Docker container does not exist, do not change the code yet, but first confirm the local running mode with the user.
### Phase 1: Generate dependency map before physical deletion
Don't delete any files yet. First use `rg` to create a dependency map.
It is recommended to check these high-risk keywords first:
```powershell
rg -n "coupon|coupon|store_coupon" src/CRMEB/CRMEB-master
rg -n "bargain|bargain" src/CRMEB/CRMEB-master
rg -n "combination|group buying" src/CRMEB/CRMEB-master
rg -n "seckill|flash sale" src/CRMEB/CRMEB-master
rg -n "presale|presale" src/CRMEB/CRMEB-master
rg -n "live|live streaming|wechat_live" src/CRMEB/CRMEB-master
rg -n "kefu|customer service|customer" src/CRMEB/CRMEB-master
rg -n "diy|get_diy|page builder" src/CRMEB/CRMEB-master
rg -n "store|verification|self pickup|offline" src/CRMEB/CRMEB-master
rg -n "agent|division|spread|brokerage" src/CRMEB/CRMEB-master
```

Each module organizes at least:
- Front page path.
-Backend page path.
- API routing path.
- Service/Dao/Model path.
- Database table name or field name.
- Whether it is referenced by orders, products, users, payments, distribution, check-ins, and members.
- Whether there is currently an MVP switch.
- Whether there is currently any backend interception.
- Whether there is currently a front-end hidden.
Output documentation suggestions:
- `docs/2026-06-18-mvp-physical-delete-dependency-map.md`

### Phase 2: Establish deletion candidate ranking list
After relying on the map, grade according to the following criteria.
#### D0 prohibits deletion
These cannot be candidates for physical deletion:
- Log in with WeChat.
- User basic table, user list, user details core information.
- Basic product capabilities, product details, SKU, and inventory.
- Order creation, order payment, order state machine.
- WeChat payment, payment callback, and refund related infrastructure.
- Secondary distribution relationships, commission records, and commission background viewing.
- Evaluation records.
- Sign-in entrance, sign-in records, and the underlying flow of points that sign-in relies on.
- Member center, member status, member rights, and member backend configuration.
- Backend users, orders, products, reviews, distribution, commissions, check-ins, and member viewing.
#### D1 can give priority to physical deletion candidates
It can be deleted only when the following conditions are met:
- Already configured to be soft-hidden or soft-blocked by MVP.
- Not called by D0 module.
- Build and Docker core interface still pass after removal.
Candidates:
- Live broadcast/WeChat live broadcast independent page and decoration components.
- Independent entrance for short videos.
- CMS has an independent entrance to article topics, provided that the training camp product details do not rely on articles.
- Independent lottery gameplay.
- Customer service independent front-end floating window and kefuapi, provided there is no order after-sales portal dependency.
- MCP/outapi samples and open interface samples, if not required for operation.
#### D2 can only be removed at the edge first, not the whole thing.
These modules have state machine or core field coupling:
- Coupons: There may be fields left in orders, product details, user details, and product editing.
- Flash sales, group buying, bargaining, and pre-sales: product services may have activity tags and price logic.
- Balance: Payment, refund, and user account flow may depend on it.
- Points Mall: Signing in may depend on the underlying points ability. You can only delete the mall gameplay, but not the underlying points.
- Store, self-pickup, write-off: order delivery method and write-off status may be coupled.
- Invoice: Order field may be present.
- Advanced distribution, agents, and business units: only advanced capabilities can be removed, but basic secondary distribution and commissions cannot be deleted.
- Address: Creating an order may depend on the address and cannot be deleted directly.
#### D3 post-cleanup
These must be done last:
- Database tables are physically deleted.
- Migration script cleanup.
- install/upgrade script cleanup.
- vendor/framework/official core directory cropping.
- Old build product cleanup.
### Phase 3: Pre-removal checklist for each module
Each module must be ticked one by one before physical deletion.
Module name:
- For example: coupons, customer service, live broadcast, CMS, stores, pre-sales.
Check items:
- Confirmed module does not belong to D0.
- It has been confirmed that the module is not called by WeChat login.
- Confirmed module is not called by required fields of product details.
- Confirmed module is not called by creating order.
- Confirmed module is not being called by payment and payment callbacks.
- Confirmed module is not called by the order state machine.
- It has been confirmed that the module is not bound and called by the secondary distribution relationship.
- Confirmed module is not being called by commission generation.
- Confirmed module is not being called by check-in.
- Confirmed that the module is not called by members.
- Confirmed that the backend menu is hidden or disabled.
- Confirmed that the front-end portal is hidden or disabled.
- Confirmed that the backend interface has MVP interception or can be safely removed.
- Test commands have been confirmed to cover core links.
- docs audit documentation has been written.
If any item cannot be confirmed, the module can only continue to be soft slimmed down and cannot be physically deleted.
### Phase 4: Recommended physical removal sequence
Don't start with a backend service or database. Recommended order:
1. Delete or disable static sample files, demo files, and abandoned documents without references.
2. Delete the front-end pages that have been confirmed not to be referenced.
3. Delete the front-end components that are confirmed not to be referenced.
4. Delete the front-end routing configuration that has been confirmed not to be referenced.
5. Delete the backend routing entries that are confirmed not to be referenced.
6. Delete the Controller method that is confirmed to have no caller.
7. Delete the Service/Dao/Model that has been confirmed to have no caller.
8. Finally, evaluate the database tables and migration scripts.
Each step must be run to build or interface regression, and it is not allowed to accumulate many deletions before verifying.
### Phase 5: Minimum execution template for each round of physical deletion
Each round of tasks is executed in this format.
#### 1. Define scope
Example:
```text
This round only handles the standalone customer-service floating entry and the kefuapi sample entry; it does not handle order after-sales, user messages, or backend order remarks.
```

#### 2. Locate existing logic
implement:
```powershell
rg -n "kefu|customer service|customerService" src/CRMEB/CRMEB-master/template/uni-app src/CRMEB/CRMEB-master/template/admin src/CRMEB/CRMEB-master/crmeb
```

Record:
- Entry file.
- Routing files.
- caller.
- Whether there is already an MVP interception.
#### 3. Determine whether it can be physically deleted
If it only appears in the disabled entry, you can enter the deletion candidate.
If it is referenced by orders, payments, users, products, members, check-ins, and distribution, stop physically deleting it and only perform soft hiding.
#### 4. Perform minimal deletion
Only delete files that are explicitly not referenced by the current module.
prohibit:
- Easily delete other files in the same directory.
- Easily change order, payment, user, and product core services.
- Delete database tables easily.
#### 5. Verification
Minimum execution:
```powershell
git diff --check
cd src/CRMEB/CRMEB-master/template/admin
npm run build
docker exec -w /var/www/crmeb crmeb-local php think clear
curl.exe -i --max-time 20 http://127.0.0.1:8080/api/product/detail/1
curl.exe -i --max-time 20 http://127.0.0.1:8080/adminapi/marketing/coupon/released
```

If the change involves mini programs or H5:
```powershell
cd src/CRMEB/CRMEB-master/template/uni-app
npm run build:mp-weixin
```

If there are no dependencies or the command fails, record the reason for the failure and do not fake the pass.
#### 6. Write documentation
New or updated:
```text
docs/2026-06-18-mvp-physical-delete-<module>-audit.md
```

Must write:
- Delete range this round.
- Delete file list.
- Reason for not deleting.
- Verify commands and results.
- Risk points.
- Rollback mode.
#### 7. Submit push
Submit information suggestions:
```text
chore: remove MVP-disabled <module> files
```

Push:
```powershell
git push origin HEAD:dev3
```

Stop after pushing and wait for user confirmation.
### Phase 6: Return paths that must be preserved
After each physical deletion, at least confirm:
- Product details can be opened.
- Can create orders.
- WeChat payment can be initiated, or at least the payment creation interface will not report an error due to deletion.
- The payment callback processing logic file has not been changed.
- The order payment success status update logic has not been changed.
- The secondary distribution relationship reading logic has not been changed.
- Commission generation logic has not been changed.
- Backend user list is accessible.
- The backend order list is accessible.
- Backend product list is accessible.
- Backend distribution/commission viewing does not report errors.
- The sign-in entrance and sign-in interface are not affected.
- Member Center and Member Backend configurations are not affected.
### Phase 7: Recommended follow-up task queue
It is recommended that the other computer continue in the following order, doing only one item at a time.
1. Product details response `coupons` field closing: only left blank or hidden in MVP mode, without deleting the bottom layer of the coupon.
2. Live broadcast/short video independent component dependency check: If there is no D0 dependency, it will be included in the first batch of physical deletion candidates.
3. Customer service independent entrance and kefuapi dependency troubleshooting: After confirming that it does not affect the order after-sales, physical deletion will be considered.
4. CMS / article / topic dependency check: After confirming that the training camp product details are not dependent, consider physical deletion.
5. Check the activity fields of flash sales/group buying/bargaining/pre-sale products: remove the remaining product details and list responses first, and do not delete the services yet.
6. Store / write-off / offline payment troubleshooting: Only enter the deletion candidate after confirming that the order delivery method is not dependent.
7. Troubleshooting points mall gameplay: only delete mall gameplay candidates and keep the points flow that depends on sign-in.
8. Advanced distribution screening: only delete candidates with advanced capabilities such as agents, business units, and employee commissions, and retain secondary distribution and commissions.
9. Database table cleaning plan: Only write the plan, do not execute it, wait until the core link is stable.
### Phase 8: Final acceptance threshold before physical deletion
The first round of actual file deletion is allowed only if the following conditions are met:
- There is already a dependent map document.
- A list of candidates for deletion has been created.
- Confirmed D0 reserve list.
- It is confirmed that this round module is not called by D0.
- There is a rollback strategy in place.
- There is already a local Docker verification path.
- The user expressly replies consenting to physical deletion.
Before the user explicitly agrees, continue to only perform software slimming, documentation and dependency troubleshooting.