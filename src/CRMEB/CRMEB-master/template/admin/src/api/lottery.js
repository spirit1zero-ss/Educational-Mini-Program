import request from '@/libs/request';

// Compatibility for legacy design components. Lottery routes are retired and return 404.
export function lotteryList(data) {
  return request({ url: 'marketing/lottery/list', method: 'get', params: data });
}
