export const MVP_ENABLED = true;

export function isMvpEnabled() {
  return MVP_ENABLED;
}

const HIDDEN_DASHBOARD_LINK_KEYWORDS = [
  '/cms/',
  '/marketing/store_coupon',
  '/marketing/coupon',
];

const DISABLED_MARKETING_ACTIVITIES = ['bargain', 'combination', 'seckill'];

export function isMvpAdminLinkVisible(link = '') {
  if (!MVP_ENABLED || !link) return true;
  return !HIDDEN_DASHBOARD_LINK_KEYWORDS.some((keyword) => link.indexOf(keyword) !== -1);
}

export function isMvpCouponEnabled() {
  return !MVP_ENABLED;
}

export function isMvpMarketingActivityEnabled(type = '') {
  if (!MVP_ENABLED) return true;
  return !DISABLED_MARKETING_ACTIVITIES.includes(type);
}
