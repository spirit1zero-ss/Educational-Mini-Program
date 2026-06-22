# 2026-06-17 CRMEB MVP Weight Loss Candidate List

## This time's goal

This document is used to record the deletion candidate list and hierarchical annotations for subsequent slimming down of CRMEB MVP. At the current stage, we are only doing a document inventory, and we are not deleting code, modifying routes, adjusting background menus, or changing the database.

This slimming boundary is based on the current interface functions of H5 and the core closed loop of CRMEB MVP:

- H5 home page, training camp, evaluation, personal center, invitation, team, commission center.
- Mini program login, products, product details, orders, WeChat payment, payment callbacks.
- Secondary distribution relationships, commission records, and backend viewing.
- Assessment records, sign-ins, and membership functions are retained.

## Grading rules

| Level | Meaning | Recommended actions |
| --- | --- | --- |
| P0 must be reserved | MVP core link or the user explicitly requires it to be reserved | Reserved first |
| P1 gives priority to deleting candidates | The current MVP is not needed, the entrance is hidden or has a high degree of independence | Delete first |
| P2 Delete candidates with caution | May be coupled with orders, users, distribution, points, and backend configuration | Secondary dependency check required |
| P3 post-processing | Database, deep services, official frameworks, built products, etc. | Hide first or post-process |

## H5 current functional boundaries

| Feature name | Rating | Is it required by the current MVP | Candidate paths | Removal risk | Recommended actions |
| --- | --- | --- | --- | --- | --- |
| H5 Homepage | P0 | Yes | `src/pages/Home.jsx` | Deletion will destroy the first screen entrance | Keep first |
| Training camp list/details entry | P0 | Yes | `src/pages/Camp.jsx`, `src/api/training.js` | Deletion will destroy the product and payment front link | Keep first |
| Evaluation entrance and results page | P0 | Yes | `src/pages/HeartAssessment.jsx`, `src/pages/SubjectAssessment.jsx`, results page | Deletion will destroy the evaluation MVP | Keep first |
| Personal Center | P0 | Yes | `src/pages/Profile.jsx` | Deletion will destroy the user, order, and commission entry | Keep first |
| My training camp | P0 | Yes | `src/pages/MyCamp.jsx` | Deletion will affect registration/order status viewing | Keep first |
| Invite friends, teams, commissions | P0 | Yes | `src/pages/Invite.jsx`, `Team.jsx`, `Commission.jsx` | Deletion will destroy distribution acceptance | Keep first |
| H5 demo mock data | P2 | Partially required | `src/data/mockData.js` | When the backend is not logged in/no data, it is still used for backend display | Secondary dependency check is required |

## Mini program candidate

| Feature name | Rating | Is it required by the current MVP | Candidate paths | Removal risk | Recommended actions |
| --- | --- | --- | --- | --- | --- |
| WeChat login | P0 | Yes | `template/uni-app/pages/users/wechat_login` | Deletion will destroy the mini program login | Keep first |
| Product list, product details, ordering | P0 | Yes | `template/uni-app/pages/goods*`, `order_addcart` | Deletion will destroy the training camp product purchase | Keep first |
| Evaluation page | P0 | Yes | `template/uni-app/pages/assessment`, `api/education.js` | Deletion will destroy the evaluation record submission | Keep first |
| Distribution/Commission Page | P0 | Yes | `pages/users/user_spread_user`, `user_spread_money`, `user_spread_code` | Deletion will break distribution acceptance | Keep first |
| Sign in | P0 | Yes | `pages/users/user_sgin`, `user_sgin_list` | User explicitly requests to retain, may rely on points flow | Reserve first |
| Member Center | P0 | Yes | `pages/users/user_vip`, `user_vip_areer`, `pages/annex/vip_*` | User explicitly requests to retain, may rely on member rights/status | Reserve first |
| Flash sale | P1 | No | `pages/activity/goods_seckill*` | Hidden by MVP configuration, independent active link | Delete first |
| Group buying | P1 | No | `pages/activity/goods_combination*` | The active order logic may be referenced, please remove the entry before deleting | Delete first |
| Bargain | P1 | No | `pages/activity/bargain`, `goods_bargain*` | The active order logic may be referenced, please remove the entry before deleting | Delete first |
| Pre-sale | P1 | No | `pages/activity/presell*` | Dynamically coupled with product details activity | Delete first |
| Lottery/event marketing | P1 | No | `pages/activity/poster-poster`, marketing related pages | Non-MVP links | Delete first |
| Coupon Marketing Page | P1 | No | `pages/users/user_coupon`, `user_get_coupon` | Order offer fields have been cleaned up under MVP, but backend coupons may still exist | Delete first |
| Points mall gameplay | P1 | No | `pages/points_mall` | Points account and points flow that sign-in depends on cannot be deleted | Delete first |
| CMS/Information/Special Topics | P1 | No | `pages/extension`, `pages/columnGoods` | Non-training camp purchase link | Delete first |
| DIY sub-package | P1 | No | `subpackage/diyComponents` | The MVP entry has been fixed on the homepage, please confirm that it is not referenced by the current homepage | Delete first |
| Address, invoice, balance, collection, browsing history, payment | P2 | Not needed yet | `pages/users/user_address*`, `user_invoice*`, `user_money`, `user_payment`, `user_goods_collection`, `visit_list`, `payment_on_behalf` | May be reused by orders, payments, and user centers | Secondary dependency check required |
| Store/Writing/Merchant Registration/Offline Payment | P2 | Not needed yet | `pages/admin`, `pages/annex/offline_*`, `pages/annex/settled` | May affect backend store and order write-off configuration | Secondary dependency check required |

## Backend front-end candidate

| Feature name | Rating | Is it required by the current MVP | Candidate paths | Removal risk | Recommended actions |
| --- | --- | --- | --- | --- | --- |
| User, product, order | P0 | Yes | `template/admin/src/pages/user`, `product`, `order` | Backend acceptance core | Reserve first |
| Financial Commission | P0 | Yes | `template/admin/src/pages/finance` | Commission Record View Core | Keep First |
| Evaluation record | P0 | Yes | `template/admin/src/pages/education` | Evaluation record view core | Keep first |
| Sign-in background configuration/record | P0 | Yes | Back-end user/points/sign-in related pages | The user explicitly requests to retain, and the path needs to be accurately positioned twice | Reserve first |
| Member background configuration/view | P0 | Yes | `template/admin/src/pages/user/level`, member configuration related pages | The user explicitly requests to retain, which may be coupled with the user level and equity configuration | Reserve first |
| Marketing module | P1 | No | `template/admin/src/pages/marketing`, `router/modules/marketing.js` | You need to confirm the menu permission synchronization before deleting | Delete first |
| CMS | P1 | No | `template/admin/src/pages/cms`, `router/modules/cms.js` | Non-MVP background capabilities | Delete first |
| Application Decoration/Diy | P1 | No | `template/admin/src/pages/app`, `router/modules/app.js` | Home page decoration may still be referenced by the background menu | Delete first |
| Customer Service | P1 | No | `template/admin/src/pages/kefu` | Independent background module | Delete first |
| Statistics large screen/chart demonstration | P1 | No | `template/admin/src/pages/statistic`, `router/modules/echarts.js` | Non-core acceptance | Delete first |
| Agent/Business Department Senior Management | P2 | Some parts are not required | `template/admin/src/pages/agent`, `division` | Basic secondary distribution must be retained and cannot be deleted as a whole | Secondary dependency check is required |
| Settings/System/Permissions | P3 | Yes | `template/admin/src/pages/system`, `setting` | Basic capabilities for background operation, cannot be deleted first | Keep first |

## Backend API, Service and Model Candidates

| Feature name | Rating | Is it required by the current MVP | Candidate paths | Removal risk | Recommended actions |
| --- | --- | --- | --- | --- | --- |
| User, product, order, payment, WeChat | P0 | Yes | `app/api/controller/v1/user`, `store`, `order`, `wechat`, `services/pay`, `services/order` | MVP main link | Reserve first |
| Payment callback, order payment successful, commission generation | P0 | Yes | `PayController`, `NotifyListener`, `PayNotifyServices`, `StoreOrderSuccessServices`, `StoreOrderTakeServices` | Deletion will destroy the payment closed loop | Keep first |
| Evaluation record | P0 | Yes | `app/api/controller/v1/education`, `app/adminapi/controller/v1/education`, `services/education` | Evaluation MVP core | Reserve first |
| Sign-in basic link | P0 | Yes | Sign-in, points flow, and user points related services | Users clearly request retention, and may support growth incentives | Reserve first |
| Basic membership link | P0 | Yes | Services related to membership, user level, and member rights | Users explicitly request to retain | Reserve first |
| Event Marketing | P1 | No | `app/api/controller/v1/activity`, event-related services/model/dao | May be dynamically referenced by product details | Delete first |
| Backend marketing routing | P1 | No | `app/adminapi/route/marketing.php`, `live.php` | Menu permissions need to be synchronized before deletion | Delete first |
| CMS/Diy | P1 | No | `app/adminapi/route/cms.php`, `diy.php`, related services/model/dao | Backend decoration and content module | Delete first |
| Customer Service API | P1 | No | `app/kefuapi`, `app/adminapi/controller/v1/kefu` | Independent modules, but may be referenced by the background menu | Delete first |
| External open API | P1 | No | `app/outapi` | Not related to MVP main link | Delete first |
| Coupon Marketing | P1 | No | coupon related services/model/route | The order may still have a coupon field, please be careful when deleting it physically on the back end | Delete first |
| Points mall gameplay | P1 | No | points mall related services/model/route | Only delete the mall gameplay, not the points account and points flow | Delete first |
| Agent/Business Unit/Employee Commission | P2 | Partially unnecessary | `app/adminapi/route/agent.php`, agent/division related controller/services/model | Basic spread/brokerage must be retained | Secondary dependency check required |
| Store, merchant, write-off, logistics expansion | P2 | Not needed yet | merchant, freight, store staff, offline/writeoff related modules | Product orders may reference distribution and store configuration | Secondary dependency check required |
| Database tables and migration | P3 | Post-processing | `upgrade/versions`, install SQL, existing business tables | Direct deletion of tables has the highest risk | Post-processing |
| vendor, core framework, official installation and upgrade | P3 | Yes | `vendor`, `install`, `upgrade`, ThinkPHP core configuration | Deletion will destroy operation or upgrade | Keep first |

## Static build products and local running products

| Feature name | Rating | Is it required by the current MVP | Candidate paths | Removal risk | Recommended actions |
| --- | --- | --- | --- | --- | --- |
| H5 build product | P3 | Regenerable | `dist`, `crmeb/public/h5` | If used for deployment, the delivery method needs to be confirmed first | Post-processing |
| Mini program preview build product | P3 | Confirmation required | `crmeb/public/statics/mp_view`, `template/uni-app/dist` | May be used for background preview or delivery import | Post-processing |
| CRMEB runtime/log/install.lock | P3 | No | `crmeb/runtime`, `public/install.lock`, log files | Local running products, should not be submitted | Post-processing |
| Docker MySQL data | P3 | No | `help/docker/mysql` | Local database, should not be submitted | Post-processing |

## Recommended execution order

1. First freeze the P0 list and confirm that payment, orders, distribution, commissions, evaluations, sign-ins, and members are all on the reserved list.
2. The first round only processes the front-end entrance and pages of P1: front-end pages corresponding to event marketing, CMS, DIY, customer service, and outapi.
3. The second round deals with P1 backend routing and services, but every time you delete a module, you have to run the build and core interface smoke first.
4. The third round of processing P2: agents/business departments, store write-offs, address invoice balances, etc. need to be searched item by item for dependencies.
5. Final processing of P3: database tables, build products, installation upgrade scripts and deep framework files.

## Acceptance and regression requirements

After the document is generated, perform static checking:

```bash
git diff --check
```

Before you actually implement weight loss, at least return to:

```bash
npm run build
```

Mini program:

```bash
cd src/CRMEB/CRMEB-master/template/uni-app
npm run build:mp-weixin
```

Docker background verification:

```bash
docker start crmeb-local
docker exec -w /var/www/crmeb crmeb-local php think clear
curl -i http://127.0.0.1:8080/adminapi/auth
```

Business return checklist:

- WeChat applet login is available.
- The training camp products are visible and product details can be opened.
- Able to create orders and initiate WeChat payment.
- The order can become paid after the payment callback.
- After confirmation of receipt, first-level and second-level commission records can be generated.
- Users, orders, products, reviews, distribution, and commissions can be viewed in the background.
- Sign-in entrance, sign-in success, and sign-in records are available.
- Member center, member status, and member rights display are available.

## clear reservation principle

- Sign-in and membership are reserved functions of MVP, and related entrances, interfaces, backend pages and basic data links must not be deleted in subsequent downsizing.
- The points mall can be a candidate for deletion, but the points account, points flow, and points display that the sign-in depends on must be retained first.
- The distribution module cannot be deleted as a whole, but can only be split into basic second-level distribution/commission and advanced agents/business units.
- Payment, order state machine, and commission generation rules will not be modified in the first stage of slimming down.
- At this stage, only a candidate list is generated and code deletion is not performed.

