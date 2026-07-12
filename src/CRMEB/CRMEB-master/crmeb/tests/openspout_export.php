<?php

use crmeb\services\SpreadsheetExcelService;
use think\App;

require dirname(__DIR__) . '/vendor/autoload.php';
require_once dirname(__DIR__) . '/vendor/topthink/framework/src/helper.php';

new App(dirname(__DIR__));

$relativePath = SpreadsheetExcelService::instance()
    ->setExcelHeader(['用户ID', '昵称', '佣金'])
    ->setExcelTile('OpenSpout PHP 8.3 兼容测试', '兼容测试', '自动化测试')
    ->setExcelContent([
        [1, '测试用户', '88.50'],
        [2, '分销用户', '20.00'],
    ])
    ->excelSave('openspout-compat-test', 'xlsx', true);

$file = public_path() . str_replace('/', DIRECTORY_SEPARATOR, ltrim($relativePath, '/'));
if (!is_file($file) || filesize($file) === 0) {
    throw new RuntimeException('OpenSpout did not create a valid XLSX file.');
}

$archive = new ZipArchive();
if ($archive->open($file) !== true || $archive->locateName('xl/workbook.xml') === false) {
    throw new RuntimeException('Generated file is not a valid XLSX archive.');
}
$archive->close();

printf("OpenSpout XLSX export passed (%d bytes).\n", filesize($file));
unlink($file);
