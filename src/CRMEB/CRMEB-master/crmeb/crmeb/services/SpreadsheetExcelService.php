<?php

namespace crmeb\services;

use OpenSpout\Common\Entity\Row;
use OpenSpout\Writer\XLSX\Writer;

/**
 * Lightweight XLSX export service backed by OpenSpout.
 *
 * The public fluent API is kept compatible with the previous implementation
 * so existing admin export controllers do not need to change.
 */
class SpreadsheetExcelService
{
    private static $instance;

    protected $header = [];

    protected $rows = [];

    protected $title = '';

    protected $sheetName = '';

    protected $info = '';

    protected static $path = '/phpExcel/';

    private function __construct()
    {
    }

    private function __clone()
    {
    }

    public static function instance()
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }

        self::$instance->reset();
        return self::$instance;
    }

    protected function reset()
    {
        $this->header = [];
        $this->rows = [];
        $this->title = '';
        $this->sheetName = '';
        $this->info = '';
    }

    public static function savePath()
    {
        $dayPath = rtrim(self::$path, '/') . '/' . date('Ym/d');
        $absolutePath = public_path() . str_replace('/', DIRECTORY_SEPARATOR, ltrim($dayPath, '/'));

        if (!is_dir($absolutePath) && !mkdir($absolutePath, 0700, true) && !is_dir($absolutePath)) {
            return false;
        }

        return $dayPath;
    }

    public function setExcelTile(string $title = '', string $name = '', $info = [])
    {
        if (is_array($title)) {
            $info = $title['info'] ?? $info;
            $name = $title['name'] ?? $name;
            $title = $title['title'] ?? '';
        }

        $this->title = $title ?: '导出数据';
        $this->sheetName = $this->sanitizeSheetName($name ?: '导出数据');
        $this->info = $this->formatInfo($info);
        return $this;
    }

    public function setExcelHeader(array $data)
    {
        $this->header = array_values($data);
        return $this;
    }

    public function setExcelContent($data = [])
    {
        $this->rows = is_array($data) ? $data : [];
        return $this;
    }

    /**
     * Save or stream an XLSX file.
     *
     * @return string|null Relative public path when saved, otherwise no return.
     */
    public function excelSave(string $fileName = '', string $suffix = 'xlsx', bool $isSave = false)
    {
        $fileName = $this->sanitizeFileName($fileName ?: date('YmdHis'));
        $suffix = strtolower($suffix ?: 'xlsx');

        // OpenSpout intentionally writes modern XLSX only. Keep old callers
        // working even when they still pass the legacy "xls" suffix.
        if ($suffix !== 'xlsx') {
            $suffix = 'xlsx';
        }

        $writer = new Writer();

        if ($isSave) {
            $directory = self::savePath();
            if ($directory === false) {
                throw new \RuntimeException('Unable to create spreadsheet export directory.');
            }

            $relativePath = $directory . '/' . $fileName . '.' . $suffix;
            $absolutePath = public_path() . str_replace('/', DIRECTORY_SEPARATOR, ltrim($relativePath, '/'));
            $writer->openToFile($absolutePath);
        } else {
            $writer->openToBrowser($fileName . '.' . $suffix);
        }

        $sheet = $writer->getCurrentSheet();
        if ($this->sheetName !== '') {
            $sheet->setName($this->sheetName);
        }

        if ($this->title !== '') {
            $writer->addRow(Row::fromValues([$this->title]));
        }
        if ($this->info !== '') {
            $writer->addRow(Row::fromValues([$this->info]));
        }
        if ($this->header !== []) {
            $writer->addRow(Row::fromValues($this->normalizeRow($this->header)));
        }

        foreach ($this->rows as $row) {
            $writer->addRow(Row::fromValues($this->normalizeRow((array)$row)));
        }

        $writer->close();
        $this->reset();

        if ($isSave) {
            return $relativePath;
        }

        exit;
    }

    protected function normalizeRow(array $row)
    {
        return array_map(static function ($value) {
            if ($value === null || is_scalar($value)) {
                return $value;
            }
            return json_encode($value, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        }, array_values($row));
    }

    protected function formatInfo($info)
    {
        if (is_string($info)) {
            return $info;
        }

        if (!is_array($info)) {
            return '';
        }

        $name = $info['name'] ?? ($info[0] ?? '');
        $site = $info['site'] ?? ($info[1] ?? '');
        $phone = $info['phone'] ?? ($info[2] ?? '');

        return trim(sprintf(
            '操作人：%s 导出日期：%s 地址：%s 电话：%s',
            $name,
            date('Y-m-d'),
            $site,
            $phone
        ));
    }

    protected function sanitizeSheetName(string $name)
    {
        $name = preg_replace('/[\\\\\/?*\[\]:]/u', '_', $name);
        return mb_substr($name ?: '导出数据', 0, 31);
    }

    protected function sanitizeFileName(string $name)
    {
        $name = preg_replace('/[\\\\\/:*?"<>|]/u', '_', $name);
        return trim($name, ". \t\n\r\0\x0B") ?: date('YmdHis');
    }
}
