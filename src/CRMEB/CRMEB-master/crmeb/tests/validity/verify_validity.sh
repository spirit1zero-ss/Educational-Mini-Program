#!/usr/bin/env bash
# 商品有效期改造 - 本地验证脚本 (Linux/Mac)
# 用法: bash tests/validity/verify_validity.sh
set -u
cd "$(dirname "$0")/../.." || exit 1
echo "=== CRMEB 根目录: $(pwd)"
echo
fail=0
echo "[1/2] PHP 语法校验 (php -l)"
for f in \
  app/services/product/product/StoreProductServices.php \
  app/services/order/StoreCartServices.php \
  app/adminapi/controller/v1/product/StoreProduct.php ; do
  if ! php -l "$f"; then fail=1; fi
done
echo
echo "[2/2] 有效期 行为 + 安全 测试"
if ! php tests/validity/validity_logic_test.php; then fail=1; fi
echo
if [ "$fail" -eq 0 ]; then
  echo "============================"
  echo " 全部通过  ALL CHECKS PASSED"
  echo "============================"
else
  echo "############################"
  echo " 存在失败  CHECKS FAILED"
  echo "############################"
fi
echo
echo "提示: 应用数据库迁移:"
echo "  mysql -u USER -p DBNAME < upgrade/versions/20260626_product_validity_fields.sql"
exit $fail
