<?php

namespace app\services\miniapp;

use app\services\BaseServices;
use crmeb\exceptions\ApiException;
use think\facade\Db;

class OfflineLocationServices extends BaseServices
{
    public function publicList(): array
    {
        $rows = Db::name('miniapp_offline_location')
            ->where('is_del', 0)
            ->where('is_show', 1)
            ->order('sort desc,id asc')
            ->select()
            ->toArray();

        return array_map([$this, 'formatRow'], $rows);
    }

    public function adminList(array $where): array
    {
        [$page, $limit, $defaultLimit] = $this->getPageValue();
        $limit = $limit ?: $defaultLimit;
        $query = Db::name('miniapp_offline_location')->where('is_del', 0);
        $keyword = trim((string)($where['keyword'] ?? ''));

        if ($keyword !== '') {
            $query->whereLike('name|city|address|phone', '%' . $keyword . '%');
        }
        if (($where['is_show'] ?? '') !== '') {
            $query->where('is_show', (int)$where['is_show']);
        }

        $count = (clone $query)->count();
        $rows = $query
            ->order('sort desc,id desc')
            ->page($page ?: 1, $limit)
            ->select()
            ->toArray();

        return [
            'list' => array_map([$this, 'formatRow'], $rows),
            'count' => $count,
        ];
    }

    public function save(int $id, array $input): array
    {
        $data = $this->validateInput($input);
        $data['update_time'] = time();

        if ($id > 0) {
            $exists = Db::name('miniapp_offline_location')
                ->where('id', $id)
                ->where('is_del', 0)
                ->find();
            if (!$exists) {
                throw new ApiException('线下地址不存在或已经删除');
            }
            Db::name('miniapp_offline_location')->where('id', $id)->update($data);
        } else {
            $data['add_time'] = time();
            $id = (int)Db::name('miniapp_offline_location')->insertGetId($data);
        }

        $row = Db::name('miniapp_offline_location')->where('id', $id)->find();
        return $this->formatRow($row ?: []);
    }

    public function delete(int $id): bool
    {
        if ($id <= 0) {
            throw new ApiException('线下地址参数错误');
        }
        $exists = Db::name('miniapp_offline_location')
            ->where('id', $id)
            ->where('is_del', 0)
            ->find();
        if (!$exists) {
            throw new ApiException('线下地址不存在或已经删除');
        }

        return Db::name('miniapp_offline_location')->where('id', $id)->update([
            'is_del' => 1,
            'is_show' => 0,
            'update_time' => time(),
        ]) > 0;
    }

    private function validateInput(array $input): array
    {
        $name = trim((string)($input['name'] ?? ''));
        $city = trim((string)($input['city'] ?? ''));
        $address = trim((string)($input['address'] ?? ''));
        if ($name === '' || mb_strlen($name, 'UTF-8') > 50) {
            throw new ApiException('请填写线下地址名称，最多50个字');
        }
        if ($city === '' || mb_strlen($city, 'UTF-8') > 30) {
            throw new ApiException('请填写城市，最多30个字');
        }
        if ($address === '' || mb_strlen($address, 'UTF-8') > 200) {
            throw new ApiException('请填写详细地址，最多200个字');
        }

        $latitude = (float)($input['latitude'] ?? 0);
        $longitude = (float)($input['longitude'] ?? 0);
        if (($latitude !== 0.0 || $longitude !== 0.0)
            && ($latitude < -90 || $latitude > 90 || $longitude < -180 || $longitude > 180)) {
            throw new ApiException('经纬度范围不正确');
        }

        return [
            'name' => $name,
            'city' => $city,
            'address' => $address,
            'phone' => mb_substr(trim((string)($input['phone'] ?? '')), 0, 30, 'UTF-8'),
            'business_hours' => mb_substr(trim((string)($input['business_hours'] ?? '')), 0, 100, 'UTF-8'),
            'service' => mb_substr(trim((string)($input['service'] ?? '')), 0, 200, 'UTF-8'),
            'status_text' => mb_substr(trim((string)($input['status_text'] ?? '营业中')), 0, 20, 'UTF-8'),
            'latitude' => $latitude,
            'longitude' => $longitude,
            'sort' => max(0, min(9999, (int)($input['sort'] ?? 0))),
            'is_show' => empty($input['is_show']) ? 0 : 1,
        ];
    }

    private function formatRow(array $row): array
    {
        return [
            'id' => (int)($row['id'] ?? 0),
            'name' => (string)($row['name'] ?? ''),
            'city' => (string)($row['city'] ?? ''),
            'address' => (string)($row['address'] ?? ''),
            'phone' => (string)($row['phone'] ?? ''),
            'businessHours' => (string)($row['business_hours'] ?? ''),
            'service' => (string)($row['service'] ?? ''),
            'status' => (string)($row['status_text'] ?? ''),
            'latitude' => (float)($row['latitude'] ?? 0),
            'longitude' => (float)($row['longitude'] ?? 0),
            'sort' => (int)($row['sort'] ?? 0),
            'isShow' => (int)($row['is_show'] ?? 0),
            'updateTime' => !empty($row['update_time']) ? date('Y-m-d H:i:s', (int)$row['update_time']) : '',
        ];
    }
}
