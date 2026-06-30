#!/usr/bin/env bash
# ============================================================
# 会员等级改造 - 本地迁移验证一键脚本
# 在仓库的 src/CRMEB/CRMEB-master/help/docker 目录下运行：
#   bash verify_membership.sh
# 前提：docker 已运行，且 crmeb_php / crmeb_mysql / crmeb_redis 容器存在
# 作用：①同步改动代码到容器 ②执行数据库迁移 ③清理缓存 ④运行自动化验证
# ============================================================
set -euo pipefail

# 容器名（与 docker-compose.yml 一致）
PHP_C="crmeb_php"
DB_C="crmeb_mysql"
REDIS_C="crmeb_redis"

# 数据库连接（与 docker-compose.yml 一致）
DB_USER="crmeb"
DB_PASS="123456"
DB_NAME="crmeb"
REDIS_PASS="123456"

# 仓库内后端根目录（相对本脚本：help/docker -> ../../crmeb）
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SRC="$SCRIPT_DIR/../../crmeb"
# 容器内后端根目录（nginx root=/var/www/public，故后端根=/var/www）
DST="//var/www"

echo "=== 1/4 同步改动代码到容器 $PHP_C ==="
FILES=(
  "app/services/user/UserLevelServices.php"
  "app/services/order/StoreOrderServices.php"
  "app/services/order/StoreOrderSuccessServices.php"
  "level_verify.php"
)
for f in "${FILES[@]}"; do
  docker cp "$SRC/$f" "$PHP_C:$DST/$f"
  echo "  -> $f"
done

echo "=== 2/4 执行数据库迁移（membership_level_upgrade.sql）==="
docker exec -i "$DB_C" mysql --default-character-set=utf8mb4 -u"$DB_USER" -p"$DB_PASS" "$DB_NAME" \
  < "$SRC/public/install/membership_level_upgrade.sql"
echo "  迁移完成"

echo "=== 3/4 清理缓存（runtime + redis 配置缓存）==="
docker exec "$PHP_C" sh -lc "php $DST/think clear >/dev/null 2>&1 || rm -rf $DST/runtime/cache/* $DST/runtime/temp/* 2>/dev/null || true"
docker exec "$REDIS_C" sh -lc "redis-cli -a '$REDIS_PASS' -n 0 flushdb >/dev/null 2>&1 || true"
echo "  缓存已清理"

echo "=== 当前会员等级配置 ==="
docker exec -i "$DB_C" mysql -u"$DB_USER" -p"$DB_PASS" "$DB_NAME" -e \
  "SELECT id,name,grade,exp_num AS '门槛(件数)',discount FROM eb_system_user_level WHERE is_del=0 AND is_show=1 ORDER BY exp_num;"

echo "=== 4/4 运行自动化验证 ==="
docker exec "$PHP_C" php "$DST/level_verify.php"

echo "=== 验证流程结束 ==="
