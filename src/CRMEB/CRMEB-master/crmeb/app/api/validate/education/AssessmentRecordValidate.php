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

namespace app\api\validate\education;

use think\Validate;

class AssessmentRecordValidate extends Validate
{
    protected $rule = [
        'score' => 'checkScore',
        'result_text' => 'require|max:500',
        'answers_json' => 'checkAnswersJson',
    ];

    protected $message = [
        'result_text.require' => '请填写测评结果',
        'result_text.max' => '测评结果最多不能超过500个字符',
    ];

    protected function checkScore($value)
    {
        if ($value === '' || $value === null) {
            return true;
        }

        return is_numeric($value) ? true : '测评分数格式错误';
    }

    protected function checkAnswersJson($value)
    {
        if ($value === '' || $value === null) {
            return true;
        }

        if (is_array($value)) {
            return true;
        }

        if (is_string($value)) {
            json_decode($value, true);
            return json_last_error() === JSON_ERROR_NONE ? true : '测评答案JSON格式错误';
        }

        return '测评答案JSON格式错误';
    }
}
