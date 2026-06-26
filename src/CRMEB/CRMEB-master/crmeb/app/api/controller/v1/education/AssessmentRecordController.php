<?php

namespace app\api\controller\v1\education;

use app\Request;
use app\api\validate\education\AssessmentRecordValidate;
use app\services\education\EducationAssessmentRecordServices;

class AssessmentRecordController
{
    protected $services;

    public function __construct(EducationAssessmentRecordServices $services)
    {
        $this->services = $services;
    }

    public function save(Request $request)
    {
        $data = $request->postMore([
            ['score', null],
            ['result_text', ''],
            ['answers_json', []],
        ]);
        validate(AssessmentRecordValidate::class)->check($data);
        $record = $this->services->saveFromUser($request->user()->toArray(), $data);
        return app('json')->success('提交成功', $record->toArray());
    }
}
