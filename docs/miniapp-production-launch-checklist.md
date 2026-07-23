# 小程序正式上线切换清单

这份清单用于把 dev3 开发测试环境安全切换到正式环境。上线时逐项勾选，不要直接复制开发环境配置。

## 一、开发测试阶段（dev3）

- [ ] 微信开发者工具至少“上传”过一个包含 `pages/home/home` 的开发版本。
- [ ] dev3 使用当前小程序的 AppID 与 AppSecret，密钥只保存在云平台。
- [ ] dev3 小程序码配置为开发版：

```text
PHP_MINIAPP_CODE_ENV_VERSION=develop
PHP_MINIAPP_CODE_CHECK_PATH=false
```

- [ ] 扫描邀请二维码能够打开开发版首页，并携带 `ref=会员UID`。
- [ ] 邀请二维码由接口以内联数据返回并写入小程序本地临时文件，不依赖云容器的 `/uploads` 地址。
- [ ] 使用两个微信账号完成“邀请 → 登录 → 支付 → 永久会员 → 返佣一次”的完整测试。

## 二、正式发布前

- [ ] 小程序代码已上传、提交审核并正式发布，正式版本确实包含 `pages/home/home`。
- [ ] 微信公众平台的服务器域名、业务域名和下载文件域名已经配置为正式 HTTPS 域名。
- [ ] 正式服务的 AppID 必须与小程序工程一致：`wx0adfb6f4fa0286e1`。
- [ ] 正式 AppSecret 是上述 AppID 的最新密钥，不是 XPay AppKey、商户密钥或 Offer ID。
- [ ] 虚拟支付正式道具已发布，产品 ID 与服务端配置一致。
- [ ] 训练营正式价格已经从测试价恢复，微信道具价格、后台会员方案价格和支付页展示价格一致。
- [ ] 虚拟支付数据库补丁已执行，确认存在以下唯一索引：
  - `uniq_out_trade_no`
  - `uniq_active_order_key`
- [ ] 已执行 `crmeb/database/patches/2026-07-22-training-camp-admin-cleanup.sql`，后台已获得报名记录删除权限，并隐藏不用的旧会员菜单。
- [ ] 正式数据库已备份。

### 提现配置

- [ ] 后台已开启微信提现到零钱（`weixin_extract_type=1`）。
- [ ] 已配置微信支付 V3 商户号、APIv3 密钥、商户证书/平台公钥和转账场景 ID。
- [ ] `routine_appId` 与当前正式小程序 AppID 一致，`pay_weixin_mchid` 与发起商家转账的商户号一致。
- [ ] 微信商户平台已开通“商家转账”能力，并确认当前业务场景允许“推广奖励/劳务报酬”。
- [ ] 提现最低金额和手续费已在后台设置，测试环境不要沿用正式大额参数。

## 三、正式环境变量

上线时必须把开发版小程序码配置切换为正式版：

```text
PHP_MINIAPP_APP_ID=wx0adfb6f4fa0286e1
PHP_MINIAPP_APP_SECRET=正式小程序AppSecret
PHP_MINIAPP_CODE_ENV_VERSION=release
PHP_MINIAPP_CODE_CHECK_PATH=true

PHP_XPAY_ENABLED=true
PHP_XPAY_ENV=0
PHP_XPAY_OFFER_ID=正式OfferID
PHP_XPAY_PRODUCTION_APP_KEY=正式AppKey
PHP_XPAY_TRAINING_CAMP_PRODUCT_ID=正式道具ID

PHP_CACHE_DRIVER=file
PHP_SESSION_TYPE=file
```

注意事项：

- [ ] 环境变量的值不带引号，不带首尾空格。
- [ ] AppSecret 和 AppKey 使用云平台的密钥类型保存，不写入 Git。
- [ ] 修改环境变量后重新部署或重启服务，不能只保存配置。
- [ ] 确认正式环境没有使用 `develop`、`trial`、沙箱 AppKey 或测试道具 ID。
- [ ] 当前短期不使用 Redis；`PHP_CACHE_DRIVER=file` 时支付锁会直接依赖数据库事务和唯一索引。

## 四、发布后验收

- [ ] 新生成的邀请二维码扫码后打开正式版首页，而不是开发版或体验版。
- [ ] 二维码中的邀请人 UID 正确，受邀用户登录后绑定正确上级。
- [ ] 未支付的受邀用户显示“待转化”，支付并取得训练营权益后才显示“已报名”。
- [ ] 同一订单连续点击支付不会产生第二笔有效支付单。
- [ ] 微信重复回调不会重复发放永久会员或重复返佣。
- [ ] 支付成功后用户立即成为永久会员。
- [ ] 一级、二级返佣比例与后台配置一致，并且每级只生成一条佣金记录。
- [ ] “我的收益”金额与后台 `user_brokerage` 记录一致。
- [ ] 提现申请后只生成一笔“审核中”记录，连续点击不会重复扣减余额。
- [ ] 后台拒绝提现后余额自动退回；后台通过后，小程序能显示并完成“确认收款”。
- [ ] 微信商家转账回调到达后，提现记录 `state` 最终变为 `SUCCESS`。
- [ ] 退款继续执行人工流程：微信后台退款并完成支付核对后，在“训练营订单”中执行“撤销会员”；系统自动关闭该用户会员/分销资格并扣回本订单尚可扣回的佣金。
- [ ] 退款用户不能继续生成邀请二维码、绑定新下级或申请提现。
- [ ] 有未完成提现的用户不能直接注销；报名登记删除后用户可以重新填写，历史订单仍保留。
- [ ] 云日志没有以下持续错误：
  - `miniapp_member_invite_code_wechat_failed`
  - `miniapp_member_invite_code_failed`
  - `payment_lock_redis_unavailable`
  - 虚拟支付签名、发货确认或对账失败

## 五、紧急回退

- [ ] 支付出现系统性异常时，先设置 `PHP_XPAY_ENABLED=false` 并重新部署，阻止新支付。
- [ ] 保留订单、微信支付流水和服务日志，不直接删除失败订单。
- [ ] 回滚到上一个稳定服务版本后，再逐单执行支付核对与权益补发。
- [ ] 二维码异常时不要改成开发版配置救急；正式环境始终保持 `release + check_path=true`。

## 六、上线完成记录

```text
小程序正式版本：
后台服务版本/提交号：
数据库补丁执行时间：
正式道具 ID：
正式价格：
验收测试订单号：
上线操作人：
上线时间：
```
