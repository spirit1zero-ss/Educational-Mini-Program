export const MVP_ENABLED = true;

export function isMvpEnabled() {
  return MVP_ENABLED;
}

const HIDDEN_DASHBOARD_LINK_KEYWORDS = [
  '/cms/',
  '/marketing/store_coupon',
  '/marketing/coupon',
];

export function isMvpAdminLinkVisible(link = '') {
  if (!MVP_ENABLED || !link) return true;
  return !HIDDEN_DASHBOARD_LINK_KEYWORDS.some((keyword) => link.indexOf(keyword) !== -1);
}
