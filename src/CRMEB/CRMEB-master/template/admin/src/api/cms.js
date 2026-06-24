import request from '@/libs/request';

// Compatibility for legacy design components. The CMS routes are retired and return 404.
export function cmsListApi(data) {
  return request({ url: 'cms/cms', method: 'get', params: data });
}

export function categoryListApi(params) {
  return request({ url: 'cms/category', method: 'GET', params });
}
