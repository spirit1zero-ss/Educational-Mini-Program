<?php

namespace app\model\education;

use crmeb\basic\BaseModel;
use crmeb\traits\ModelTrait;

class EducationAssessmentRecord extends BaseModel
{
    use ModelTrait;

    protected $pk = 'id';

    protected $name = 'education_assessment_records';

    protected $autoWriteTimestamp = 'datetime';

    protected $createTime = 'created_at';

    protected $updateTime = 'updated_at';

    protected $type = [
        'score' => 'float',
    ];

    public function searchUidAttr($query, $value)
    {
        if ($value !== '' && $value !== null) {
            $query->where('uid', (int)$value);
        }
    }

    public function searchNicknameAttr($query, $value)
    {
        if ($value !== '') {
            $query->whereLike('nickname', '%' . $value . '%');
        }
    }

    public function searchMobileAttr($query, $value)
    {
        if ($value !== '') {
            $query->whereLike('mobile', '%' . $value . '%');
        }
    }

    public function searchDataAttr($query, $value)
    {
        if (is_array($value) && count($value) === 2 && $value[0] && $value[1]) {
            $query->whereTime('created_at', 'between', $value);
        }
    }
}
