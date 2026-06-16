import request from '@/libs/request';

export function assessmentRecordList(params) {
  return request({
    url: 'education/assessment_records',
    method: 'get',
    params,
  });
}

export function assessmentRecordDetail(id) {
  return request({
    url: `education/assessment_records/${id}`,
    method: 'get',
  });
}
