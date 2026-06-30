@echo off
REM 商品有效期改造 - 本地验证脚本 (Windows)
REM 用法: 双击运行，或在命令行 cd 到本目录后执行 verify_validity.bat
setlocal enabledelayedexpansion
cd /d "%~dp0..\.."
echo === CRMEB 根目录: %cd%
echo.
echo [1/2] PHP 语法校验 (php -l)
set FAIL=0
for %%F in (
  "app\services\product\product\StoreProductServices.php"
  "app\services\order\StoreCartServices.php"
  "app\adminapi\controller\v1\product\StoreProduct.php"
) do (
  php -l %%F
  if errorlevel 1 set FAIL=1
)
echo.
echo [2/2] 有效期 行为 + 安全 测试
php tests\validity\validity_logic_test.php
if errorlevel 1 set FAIL=1
echo.
if "!FAIL!"=="0" (
  echo ============================
  echo  全部通过  ALL CHECKS PASSED
  echo ============================
) else (
  echo ############################
  echo  存在失败  CHECKS FAILED
  echo ############################
)
echo.
echo 提示: 应用数据库迁移 ^(在 crmeb 目录执行你的导入方式^):
echo   mysql -u USER -p DBNAME ^< upgrade\versions\20260626_product_validity_fields.sql
echo   ^(只执行 -- up 之前的 ALTER TABLE 部分; -- down 用于回滚^)
pause
endlocal
