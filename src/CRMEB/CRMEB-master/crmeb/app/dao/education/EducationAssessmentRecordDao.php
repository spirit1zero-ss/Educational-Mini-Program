<?php

namespace app\dao\education;

use app\dao\BaseDao;
use app\model\education\EducationAssessmentRecord;

class EducationAssessmentRecordDao extends BaseDao
{
    protected function setModel(): string
    {
        return EducationAssessmentRecord::class;
    }

    public function getList(array $where, string $field = '*', int $page = 0, int $limit = 0): array
    {
        return $this->search($where)
            ->field($field)
            ->when($page && $limit, function ($query) use ($page, $limit) {
                $query->page($page, $limit);
            })
            ->order('id desc')
            ->select()
            ->toArray();
    }
}
