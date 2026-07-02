@echo off
REM 管理后台 构建 + 部署脚本 (Windows)
REM 作用: 构建 template/admin 并部署到 crmeb/public/admin (会先备份原目录)
REM 用法: 双击运行，或命令行 cd 到本目录后执行 build_deploy_admin.bat
setlocal
cd /d "%~dp0"
echo === 目录: %cd%
echo.
echo [1/3] 安装依赖(若已安装可跳过, 出错再手动 npm install)
if not exist node_modules (
  call npm install || goto :err
)
echo.
echo [2/3] 构建生产包 (vue-cli-service build)
call npm run build || goto :err
if not exist dist\index.html (
  echo 构建产物 dist\index.html 不存在, 构建可能失败
  goto :err
)
echo.
echo [3/3] 部署到 crmeb\public\admin (先备份)
set TARGET=..\..\crmeb\public\admin
set STAMP=%date:~0,4%%date:~5,2%%date:~8,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set STAMP=%STAMP: =0%
if exist "%TARGET%" (
  echo 备份 %TARGET% -> %TARGET%_backup_%STAMP%
  move "%TARGET%" "%TARGET%_backup_%STAMP%" >nul
)
mkdir "%TARGET%" 2>nul
xcopy /E /I /Y dist\* "%TARGET%\" >nul
echo.
echo ============================
echo  部署完成 DEPLOY DONE
echo  访问后台清缓存刷新即可看到: 商品类型=长期有效/有限期, 分类只有VIP
echo ============================
goto :eof
:err
echo.
echo ############################
echo  失败 BUILD/DEPLOY FAILED
echo ############################
exit /b 1
