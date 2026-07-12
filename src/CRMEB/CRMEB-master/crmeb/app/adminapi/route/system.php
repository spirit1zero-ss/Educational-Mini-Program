<?php
// +----------------------------------------------------------------------
// | CRMEB [ CRMEB赋能开发者，助力企业发展 ]
// +----------------------------------------------------------------------
// | Copyright (c) 2016~2026 https://www.crmeb.com All rights reserved.
// +----------------------------------------------------------------------
// | Licensed CRMEB并不是自由软件，未经许可不能去掉CRMEB相关版权
// +----------------------------------------------------------------------
// | Author: CRMEB Team <admin@crmeb.com>
// +----------------------------------------------------------------------

use think\facade\Route;

/**
 * 维护 相关路由
 */
Route::group('system', function () {

    /** 存储配置 */
    Route::group(function () {
        //云存储列表
        Route::get('config/storage/save_type/:type', 'v1.setting.SystemStorage/uploadType')->name('SystemStorageUploadType')->option(['real_name' => '选择存储方式']);
        //云存储列表
        Route::get('config/storage', 'v1.setting.SystemStorage/index')->name('SystemStorageIndex')->option(['real_name' => '云存储列表']);
        //获取云存储创建表单
        Route::get('config/storage/create/:type', 'v1.setting.SystemStorage/create')->name('SystemStorageCreate')->option(['real_name' => '获取云存储创建表单']);
        //获取云存储配置表单
        Route::get('config/storage/form/:type', 'v1.setting.SystemStorage/getConfigForm')->name('getConfigForm')->option(['real_name' => '获取云存储配置表单']);
        //获取云存储配置
        Route::get('config/storage/config', 'v1.setting.SystemStorage/getConfig')->name('SystemStorageConfig')->option(['real_name' => '获取云存储配置']);
        //保存云存储配置
        Route::post('config/storage/config', 'v1.setting.SystemStorage/saveConfig')->name('SystemStorageSaveConfig')->option(['real_name' => '保存云存储配置']);
        //同步云存储列表
        Route::put('config/storage/synch/:type', 'v1.setting.SystemStorage/synch')->name('SystemStorageSynch')->option(['real_name' => '同步云存储列表']);
        //获取修改云存储域名表单
        Route::get('config/storage/domain/:id', 'v1.setting.SystemStorage/getUpdateDomainForm')->name('getUpdateDomainForm')->option(['real_name' => '获取修改云存储域名表单']);
        //修改云存储域名
        Route::post('config/storage/domain/:id', 'v1.setting.SystemStorage/updateDomain')->name('updateDomain')->option(['real_name' => '修改云存储域名']);
        //保存云存储数据
        Route::post('config/storage/:type', 'v1.setting.SystemStorage/save')->name('SystemStorageSave')->option(['real_name' => '保存云存储数据']);
        //删除云存储
        Route::delete('config/storage/:id', 'v1.setting.SystemStorage/delete')->name('SystemStorageDelete')->option(['real_name' => '删除云存储']);
        //修改云存储状态
        Route::put('config/storage/status/:id', 'v1.setting.SystemStorage/status')->name('SystemStorageStatus')->option(['real_name' => '修改云存储状态']);
    })->option(['parent' => 'system', 'cate_name' => '存储配置']);

    /** 系统日志 */
    Route::group(function () {
        //系统日志
        Route::get('log', 'v1.system.SystemLog/index')->name('SystemLog')->option(['real_name' => '系统日志']);
        //系统日志管理员搜索条件
        Route::get('log/search_admin', 'v1.system.SystemLog/search_admin')->option(['real_name' => '系统日志管理员搜索条件']);
    })->option(['parent' => 'system', 'cate_name' => '系统日志']);


    /** 数据备份 */
    Route::group(function () {
        //数据所有表
        Route::get('backup', 'v1.system.SystemDatabackup/index')->option(['real_name' => '数据库所有表']);
        //数据备份详情
        Route::get('backup/read', 'v1.system.SystemDatabackup/read')->option(['real_name' => '数据备份详情']);
        //更新数据表或者表字段备注
        Route::post('database/update_mark', 'v1.system.SystemDatabackup/updateMark')->option(['real_name' => '更新数据表或者表字段备注']);
        //数据备份 优化表
        Route::put('backup/optimize', 'v1.system.SystemDatabackup/optimize')->option(['real_name' => '数据备份优化表']);
        //数据备份 修复表
        Route::put('backup/repair', 'v1.system.SystemDatabackup/repair')->option(['real_name' => '数据备份修复表']);
        //数据备份 备份表
        Route::put('backup/backup', 'v1.system.SystemDatabackup/backup')->option(['real_name' => '数据备份备份表']);
        //备份记录
        Route::get('backup/file_list', 'v1.system.SystemDatabackup/fileList')->option(['real_name' => '数据库备份记录']);
        //删除备份记录
        Route::delete('backup/del_file', 'v1.system.SystemDatabackup/delFile')->option(['real_name' => '删除数据库备份记录']);
        //导入备份记录表
        Route::post('backup/import', 'v1.system.SystemDatabackup/import')->option(['real_name' => '导入数据库备份记录']);
        //下载备份记录表
        //Route::get('backup/download', 'v1.system.SystemDatabackup/downloadFile');
    })->option(['parent' => 'system', 'cate_name' => '数据备份']);

    /** 缓存维护 */
    Route::group(function () {
        //清除缓存
        Route::get('refresh_cache/cache', 'v1.system.Clear/refresh_cache')->option(['real_name' => '清除系统缓存']);
        //清除日志
        Route::get('refresh_cache/log', 'v1.system.Clear/delete_log')->option(['real_name' => '清除系统日志']);
    })->option(['parent' => 'system', 'cate_name' => '缓存维护']);

    /** 定时任务 */
    Route::group(function () {
        //定时任务列表
        Route::get('crontab/list', 'v1.system.SystemCrontab/getTimerList')->option(['real_name' => '定时任务列表']);
        //定时任务类型
        Route::get('crontab/mark', 'v1.system.SystemCrontab/getMarkList')->option(['real_name' => '定时任务类型']);
        //定时任务详情
        Route::get('crontab/info/:id', 'v1.system.SystemCrontab/getTimerInfo')->option(['real_name' => '定时任务详情']);
        //定时任务添加编辑
        Route::post('crontab/save', 'v1.system.SystemCrontab/saveTimer')->option(['real_name' => '定时任务添加编辑']);
        //删除定时任务
        Route::delete('crontab/del/:id', 'v1.system.SystemCrontab/delTimer')->option(['real_name' => '删除定时任务']);
        //定时任务是否开启开关
        Route::get('crontab/set_open/:id/:is_open', 'v1.system.SystemCrontab/setTimerStatus')->option(['real_name' => '定时任务是否开启开关']);
    })->option(['parent' => 'system', 'cate_name' => '定时任务']);

    /** 自定事件 */
    Route::group(function () {
        //定时任务列表
        Route::get('event/list', 'v1.system.SystemEvent/getEventList')->option(['real_name' => '自定事件列表']);
        //定时任务类型
        Route::get('event/mark', 'v1.system.SystemEvent/getMarkList')->option(['real_name' => '自定事件类型']);
        //定时任务详情
        Route::get('event/info/:id', 'v1.system.SystemEvent/getEventInfo')->option(['real_name' => '自定事件详情']);
        //定时任务添加编辑
        Route::post('event/save', 'v1.system.SystemEvent/saveEvent')->option(['real_name' => '自定事件添加编辑']);
        //删除定时任务
        Route::delete('event/del/:id', 'v1.system.SystemEvent/delEvent')->option(['real_name' => '删除自定事件']);
        //定时任务是否开启开关
        Route::get('event/set_open/:id/:is_open', 'v1.system.SystemEvent/setEventStatus')->option(['real_name' => '自定事件是否开启开关']);
    })->option(['parent' => 'system', 'cate_name' => '自定事件']);

    /** 系统路由 */
    Route::group(function () {
        //同步路由接口
        Route::get('route/sync_route/[:appName]', 'v1.setting.SystemRoute/syncRoute')->option(['real_name' => '同步路由']);
        //获取路由tree行数据
        Route::get('route/tree', 'v1.setting.SystemRoute/tree')->option(['real_name' => '获取路由tree']);
        //权限路由
        Route::delete('route/:id', 'v1.setting.SystemRoute/delete')->option(['real_name' => '删除路由权限']);
        //查看路由权限
        Route::get('route/:id', 'v1.setting.SystemRoute/read')->option(['real_name' => '查看路由权限']);
        //保存路由权限
        Route::post('route/:id', 'v1.setting.SystemRoute/save')->option(['real_name' => '保存路由权限']);
        //路由分类
        Route::resource('route_cate', 'v1.setting.SystemRouteCate')->except(['read'])->option([
            'real_name' => [
                'index' => '获取路由分类列表',
                'create' => '获取创建路由分类表单',
                'save' => '保存路由分类',
                'edit' => '获取修改路由分类表单',
                'update' => '修改路由分类',
                'delete' => '删除路由分类'
            ],
        ]);
    })->option(['parent' => 'system', 'cate_name' => '系统路由']);

})->middleware([
    \app\http\middleware\AllowOriginMiddleware::class,
    \app\adminapi\middleware\AdminAuthTokenMiddleware::class,
    \app\adminapi\middleware\AdminCheckRoleMiddleware::class,
    \app\adminapi\middleware\AdminLogMiddleware::class
])->option(['mark' => 'system', 'mark_name' => '系统维护']);
