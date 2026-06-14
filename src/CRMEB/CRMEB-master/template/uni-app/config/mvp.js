const MVP_ENABLED = true;

export const MVP_TRAINING_CAMP_KEYWORD = "训练营";
export const MVP_TRAINING_CAMP_CATEGORY_ID = 0;
export const MVP_TRAINING_CAMP_PRODUCT_IDS = [];

const HIDDEN_DDIY_COMPONENTS = [
  "bargain",
  "combination",
  "coupon",
  "home_paid_vip",
  "liveBroadcast",
  "newVip",
  "pointsMall",
  "presale",
  "seckill",
  "signIn",
];

const HIDDEN_LINK_KEYWORDS = [
  "activity/goods_bargain",
  "activity/bargain",
  "activity/goods_combination",
  "activity/goods_seckill",
  "annex/special",
  "columnGoods/live_list",
  "live",
  "points_mall",
  "short_video",
  "theme_id",
  "user_coupon",
  "user_get_coupon",
  "user_integral",
  "user_payment",
  "user_sgin",
  "user_vip",
  "vip_active",
  "vip_coupon",
  "vip_paid",
];

const HOME_ALLOWED_DDIY_COMPONENTS = [
  "blankPage",
  "goodList",
  "goodRecommend",
  "homeComb",
  "pageFoot",
  "richText",
  "swiperBg",
  "swipers",
  "titles",
];

const FOOTER_ALLOWED_LINKS = [
  "/pages/index/index",
  "/pages/user/index",
];

export function isMvpEnabled() {
  return MVP_ENABLED;
}

export function isMvpHiddenLink(link = "") {
  if (!MVP_ENABLED || !link) return false;
  return HIDDEN_LINK_KEYWORDS.some((keyword) => link.indexOf(keyword) !== -1);
}

export function isMvpDiyItemVisible(item = {}, options = {}) {
  if (!MVP_ENABLED) return !item || !item.isHide;
  if (!item || item.isHide) return false;
  if (HIDDEN_DDIY_COMPONENTS.includes(item.name)) return false;
  if (options.isHome && !HOME_ALLOWED_DDIY_COMPONENTS.includes(item.name)) {
    return false;
  }
  return true;
}

export function filterMvpFooterNavigation(data = {}) {
  if (!MVP_ENABLED || !data || !Array.isArray(data.menuList)) return data;
  return {
    ...data,
    menuList: data.menuList.filter((item) => {
      const link = item && item.link ? item.link.split("?")[0] : "";
      return FOOTER_ALLOWED_LINKS.includes(link) && !isMvpHiddenLink(link);
    }),
  };
}

export function applyMvpTrainingCampFilter(where = {}) {
  if (!MVP_ENABLED) return where;
  const next = { ...where };
  if (MVP_TRAINING_CAMP_CATEGORY_ID && !next.cid) {
    next.cid = MVP_TRAINING_CAMP_CATEGORY_ID;
  }
  if (MVP_TRAINING_CAMP_PRODUCT_IDS.length && !next.productId) {
    next.productId = MVP_TRAINING_CAMP_PRODUCT_IDS.join(",");
  }
  if (!next.cid && !next.productId && !next.keyword) {
    next.keyword = MVP_TRAINING_CAMP_KEYWORD;
  }
  return next;
}

export function disableMvpOrderMarketing(payload = {}) {
  if (!MVP_ENABLED) return payload;
  return {
    ...payload,
    couponId: 0,
    useIntegral: 0,
    bargainId: 0,
    combinationId: 0,
    seckill_id: 0,
  };
}

export const MVP_HOME_ENTRIES = [
  {
    title: "训练营商品",
    desc: "查看课程与训练营",
    url: "/pages/goods/goods_list/index?searchValue=训练营&title=训练营",
    type: "navigateTo",
  },
  {
    title: "入营测评",
    desc: "完成课前测评",
    url: "/pages/assessment/index",
    type: "navigateTo",
  },
  {
    title: "我的订单",
    desc: "查看报名与支付状态",
    url: "/pages/goods/order_list/index?status=9",
    type: "navigateTo",
  },
  {
    title: "分销/佣金",
    desc: "查看推广与佣金记录",
    url: "/pages/users/user_spread_user/index",
    type: "navigateTo",
  },
];
