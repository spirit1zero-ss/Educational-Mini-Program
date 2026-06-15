import { crmebAssetUrl, crmebRequest } from './crmebClient.js';
import { commissionRecords, invite, team, user } from '../data/mockData.js';

const money = (value) => {
  const number = Number(value || 0);
  return `¥${number.toLocaleString('zh-CN', { maximumFractionDigits: 2 })}`;
};

function productName(product) {
  return product.store_name || product.title || product.name || '自主学习训练营';
}

function normalizeProduct(product) {
  return {
    id: product.id,
    title: productName(product),
    price: money(product.price),
    rawPrice: Number(product.price || 0),
    image: crmebAssetUrl(product.image || product.cover || ''),
    sales: product.sales || product.ficti || 0,
    startTime: product.camp_start_time || product.start_time || '',
    endTime: product.camp_end_time || product.end_time || '',
    deliveryType: product.camp_delivery_type || 'online',
    source: product
  };
}

function isTrainingProduct(product) {
  const name = productName(product);
  const category = product.cate_name || product.category_name || product.category || '';
  const keyword = `${name} ${category}`;
  return Boolean(product.is_training_camp) || keyword.includes('训练营') || keyword.includes('訓練營');
}

function pickList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.list)) return data.list;
  if (Array.isArray(data?.products)) return data.products;
  if (Array.isArray(data?.productList)) return data.productList;
  if (Array.isArray(data?.list?.data)) return data.list.data;
  return [];
}

export async function getTrainingProducts() {
  const data = await crmebRequest('products?keyword=%E8%AE%AD%E7%BB%83%E8%90%A5&page=1&limit=20');
  const list = pickList(data);
  const trainingList = list.filter(isTrainingProduct);
  return (trainingList.length ? trainingList : list).map(normalizeProduct);
}

export async function getTrainingProductDetail(id) {
  const data = await crmebRequest(`product/detail/${id}`);
  const storeInfo = data.storeInfo || data.store_info || data;
  return normalizeProduct(storeInfo);
}

export async function getCurrentUser() {
  const data = await crmebRequest('user');
  const info = data.userInfo || data.user_info || data;
  const spreadCount = info.spread_count || info.spreadCount || 0;
  return {
    ...user,
    name: info.nickname || info.real_name || info.phone || user.name,
    level: info.level_name || info.vip_name || user.level,
    avatar: crmebAssetUrl(info.avatar) || user.avatar,
    stats: [
      { label: '累计测评', value: info.assessment_count ? `${info.assessment_count}次` : user.stats[0].value },
      { label: '训练营', value: info.camp_count ? `${info.camp_count}期` : user.stats[1].value },
      { label: '邀请好友', value: spreadCount ? `${spreadCount}人` : user.stats[2].value },
      { label: '团队人数', value: info.team_count || spreadCount ? `${info.team_count || spreadCount}人` : user.stats[3].value }
    ]
  };
}

export async function getCommissionSummary() {
  const data = await crmebRequest('commission');
  return {
    total: money(data.brokerage_price || data.total_brokerage || data.total || 0),
    available: money(data.now_money || data.extract_price || data.available || 0)
  };
}

export async function getCommissionRecords() {
  const data = await crmebRequest('spread/commission/3?page=1&limit=20');
  const list = pickList(data);
  return list.map((item) => ({
    title: item.title || item.mark || item.pm_name || '佣金记录',
    amount: money(item.number || item.price || item.amount || 0),
    date: item.add_time || item.create_time || item.time || ''
  }));
}

export async function getInviteInfo() {
  const data = await crmebRequest('user/spread_info');
  const userInfo = data.userInfo || data.user_info || data.user || {};
  return {
    ...invite,
    code: data.spread_code || userInfo.uid || data.uid || invite.code,
    invited: data.spread_count || userInfo.spread_count || data.count || invite.invited,
    reward: money(data.brokerage_price || userInfo.brokerage_price || data.reward || 0)
  };
}

export async function getTeamStats() {
  const first = await crmebRequest('spread/people', {
    method: 'POST',
    body: JSON.stringify({ grade: 0, sort: '', keyword: '' })
  });
  const second = await crmebRequest('spread/people', {
    method: 'POST',
    body: JSON.stringify({ grade: 1, sort: '', keyword: '' })
  });
  const firstCount = first.count || first.total || pickList(first).length || 0;
  const secondCount = second.count || second.total || pickList(second).length || 0;

  return [
    { label: '一级用户人数', value: String(firstCount || team[0].value) },
    { label: '二级用户人数', value: String(secondCount || team[1].value) },
    { label: '团队总人数', value: String(firstCount + secondCount || team[2].value) },
    { label: '累计佣金', value: team[3].value }
  ];
}
