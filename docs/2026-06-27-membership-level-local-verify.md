# 会员等级改造 · 本地迁移验证方案（2026-06-27）

目标：在本地 Docker 环境验证「按累计购买商品件数自动升级（会员/高级会员/专家/合伙人）」改造，含数据库迁移、代码生效、自动化逻辑验证与回滚。

## 0. 环境前提

| 项 | 值 |
| --- | --- |
| 后端根目录（仓库） | `src/CRMEB/CRMEB-master/crmeb` |
| 编排目录 | `src/CRMEB/CRMEB-master/help/docker` |
| PHP 容器 | `crmeb_php`（代码挂载在卷 `crmeb_fast_code` → 容器内 `/var/www`） |
| MySQL 容器 | `crmeb_mysql`，库 `crmeb`，账号 `crmeb/123456`，表前缀 `eb_` |
| Redis 容器 | `crmeb_redis`，密码 `123456` |
| 访问地址 | 后台 `http://localhost:8011/admin/`（admin / crmeb123456） |

> 关键点：`docker-compose.yml` 用的是**外部卷**承载后端代码，仓库目录不会自动挂进容器。改动后端代码后**必须**同步进容器（下面脚本已处理），否则容器里跑的还是旧代码。

确认容器在运行：

```bash
docker ps --format '{{.Names}}\t{{.Status}}' | grep crmeb
```

## 1. 一键验证（推荐）

```bash
cd src/CRMEB/CRMEB-master/help/docker
bash verify_membership.sh
```

脚本依次完成：①把 3 个改动文件 + 验证脚本同步进 `crmeb_php`；②对 `crmeb_mysql` 执行 `membership_level_upgrade.sql`；③清理 runtime 与 Redis 配置缓存；④打印等级配置并运行自动化验证。

期望输出（节选）：

```
=== 当前会员等级配置 ===
id  name      grade  门槛(件数)  discount
1   会员       1      1          100
2   高级会员    2      20         100
3   专家       3      50         100
4   合伙人      4      100        100
...
场景               件数     期望     实际       结果
--------------------------------------------------------
首次购买 1 件        1       会员      会员        PASS
累计 20 件          20      高级会员   高级会员     PASS
累计 50 件          50      专家      专家        PASS
累计 100 件         100     合伙人     合伙人       PASS
退款回落到 50 件     50      专家      专家        PASS
退款回落到 0 件      0       无        无          PASS
--------------------------------------------------------
结果：PASS=6  FAIL=0
```

全部 PASS 即表示：首单成为会员、阈值升级、退款回落降级、清零四个核心逻辑均正确。

## 2. 分步手动执行（排查用）

### 2.1 备份数据库（强烈建议）

```bash
docker exec crmeb_mysql sh -lc 'mysqldump -ucrmeb -p123456 crmeb' > crmeb_backup_$(date +%Y%m%d%H%M).sql
```

### 2.2 同步改动代码进容器

```bash
SRC=../../crmeb
for f in app/services/user/UserLevelServices.php \
         app/services/order/StoreOrderServices.php \
         app/services/order/StoreOrderSuccessServices.php \
         level_verify.php; do
  docker cp "$SRC/$f" "crmeb_php:/var/www/$f"
done
```

### 2.3 执行数据库迁移

```bash
docker exec -i crmeb_mysql mysql -ucrmeb -p123456 crmeb \
  < ../../crmeb/public/install/membership_level_upgrade.sql
```

> 如果你的安装用的不是默认前缀 `eb_`，先查实际前缀：`docker exec crmeb_mysql sh -lc "mysql -ucrmeb -p123456 crmeb -e \"SHOW TABLES LIKE '%system\_user\_level'\""`，再把 SQL 里的 `eb_` 替换成你的前缀。

### 2.4 清理缓存（让新代码与配置生效）

```bash
docker exec crmeb_php sh -lc 'php /var/www/think clear || rm -rf /var/www/runtime/cache/* /var/www/runtime/temp/*'
docker exec crmeb_redis sh -lc "redis-cli -a 123456 -n 0 flushdb"
```

### 2.5 运行自动化验证脚本

```bash
docker exec crmeb_php php /var/www/level_verify.php          # 跑完自动清理测试数据
docker exec crmeb_php php /var/www/level_verify.php --keep   # 保留测试数据便于人工查看
```

## 3. 真实下单链路验证（可选，端到端）

自动化脚本直接调用 `UserLevelServices::detection`，覆盖核心逻辑。若要验证「支付成功事件 → 自动升级」的完整链路：

1. 后台或前端用一个测试账号下单并完成支付（本地可用余额支付）。
2. 支付成功后查询该用户等级：

```bash
docker exec -i crmeb_mysql mysql -ucrmeb -p123456 crmeb -e \
"SELECT u.uid,u.nickname,u.level,l.name,
        (SELECT IFNULL(SUM(total_num),0) FROM eb_store_order
         WHERE uid=u.uid AND paid=1 AND refund_status=0 AND is_del=0 AND is_system_del=0) AS bought_num
 FROM eb_user u LEFT JOIN eb_system_user_level l ON l.id=u.level
 WHERE u.uid = <测试uid>;"
```

`level` 应指向与 `bought_num` 匹配的等级；首单后应至少为「会员」。

## 4. 验证点清单

- [ ] 等级表只剩 4 个等级：会员/高级会员/专家/合伙人，门槛 1/20/50/100
- [ ] `member_func_status = 1`（用户等级功能已开启）
- [ ] 首次成功购买 → 自动成为「会员」
- [ ] 累计件数达 20/50/100 → 升到 高级会员/专家/合伙人
- [ ] 退款使累计件数回落到阈值以下 → 自动降级
- [ ] 自动化脚本 FAIL=0

## 5. 回滚

```bash
# 数据：恢复备份
cat crmeb_backup_YYYYMMDDHHMM.sql | docker exec -i crmeb_mysql mysql -ucrmeb -p123456 crmeb

# 代码：用 git 还原 3 个文件后重新同步进容器
git checkout -- src/CRMEB/CRMEB-master/crmeb/app/services/user/UserLevelServices.php \
                src/CRMEB/CRMEB-master/crmeb/app/services/order/StoreOrderServices.php \
                src/CRMEB/CRMEB-master/crmeb/app/services/order/StoreOrderSuccessServices.php
# 再执行 2.2 的 docker cp，并清缓存（2.4）
```

## 6. 常见问题

- **验证脚本提示 `member_func_status 未开启`**：迁移脚本没跑或缓存没清。重跑 2.3、2.4。
- **改了代码容器里没生效**：忘了 `docker cp` 同步（外部卷不会自动同步），或没清 runtime 缓存。
- **`php think clear` 报错**：忽略即可，脚本会回退为删除 runtime 缓存目录。
- **想长期免同步**：可加一个开发用 compose override，把 `../../crmeb` 直接 bind-mount 到 `/var/www`，改代码即时生效（见架构审查报告建议）。
