<?php

namespace app\services\education;

use app\dao\education\EducationAssessmentRecordDao;
use app\services\BaseServices;
use crmeb\exceptions\ApiException;

class EducationAssessmentRecordServices extends BaseServices
{
    public function __construct(EducationAssessmentRecordDao $dao)
    {
        $this->dao = $dao;
    }

    public function saveFromUser(array $user, array $data)
    {
        $answersJson = $this->normalizeAnswersJson($data['answers_json'] ?? []);
        $score = $this->normalizeScore($data['score'] ?? null);
        $record = [
            'uid' => (int)($user['uid'] ?? 0),
            'nickname' => (string)($user['nickname'] ?? ''),
            'mobile' => (string)($user['phone'] ?? $user['mobile'] ?? ''),
            'score' => $score,
            'result_text' => trim((string)$data['result_text']),
            'answers_json' => $answersJson,
        ];

        if ($record['uid'] <= 0) {
            throw new ApiException('请先登录');
        }
        if ($record['result_text'] === '') {
            throw new ApiException('请填写测评结果');
        }

        return $this->dao->save($record);
    }

    public function getAdminList(array $where): array
    {
        [$page, $limit] = $this->getPageValue();
        $field = 'id,uid,nickname,mobile,score,result_text,created_at,updated_at';
        return [
            'count' => $this->dao->count($where),
            'list' => $this->dao->getList($where, $field, $page, $limit),
        ];
    }

    public function getAdminDetail(int $id): array
    {
        $record = $this->dao->get($id);
        if (!$record) {
            throw new ApiException('测评记录不存在');
        }
        $data = $record->toArray();
        $decoded = json_decode($data['answers_json'] ?? '[]', true);
        $data['answers'] = json_last_error() === JSON_ERROR_NONE ? $decoded : [];
        return $data;
    }

    protected function normalizeScore($score): ?float
    {
        if ($score === '' || $score === null) {
            return null;
        }
        if (!is_numeric($score)) {
            throw new ApiException('测评分数格式错误');
        }
        return (float)$score;
    }

    protected function normalizeAnswersJson($answers): string
    {
        if (is_string($answers)) {
            $decoded = json_decode($answers, true);
            if (json_last_error() === JSON_ERROR_NONE) {
                return json_encode($decoded, JSON_UNESCAPED_UNICODE);
            }
            throw new ApiException('测评答案JSON格式错误');
        }

        return json_encode($answers ?: [], JSON_UNESCAPED_UNICODE);
    }
}
