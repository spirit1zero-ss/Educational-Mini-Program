import request from '@/libs/request';

export function routineSyncTemplate() {
  return request({ url: 'app/routine/syncSubscribe', method: 'GET' });
}

export function wechatSyncTemplate() {
  return request({ url: 'app/wechat/syncSubscribe', method: 'GET' });
}

export function routineCIUpload(data) {
  return request({ url: 'app/routine/ci/upload', method: 'post', data });
}

export function cityList() {
  return request({ url: 'setting/city/full_list', method: 'GET' });
}
