export function isCoreScopeEnabled() {
  return true;
}

const RETIRED_DASHBOARD_LINK_KEYWORDS = [
  '/cms/',
  '/marketing/store_coupon',
  '/marketing/coupon',
];

const RETIRED_MARKETING_ACTIVITIES = ['bargain', 'combination', 'seckill'];
const PRODUCT_EXTRAS_ENABLED = false;
const STORE_PICKUP_ENABLED = false;

export function isRetainedAdminLink(link = '') {
  if (!link) return true;
  return !RETIRED_DASHBOARD_LINK_KEYWORDS.some((keyword) => link.indexOf(keyword) !== -1);
}

export function isCouponAvailable() {
  return false;
}

export function isMarketingActivityAvailable(type = '') {
  return !RETIRED_MARKETING_ACTIVITIES.includes(type);
}

export function areProductExtrasAvailable() {
  return PRODUCT_EXTRAS_ENABLED;
}

export function isStorePickupAvailable() {
  return STORE_PICKUP_ENABLED;
}
