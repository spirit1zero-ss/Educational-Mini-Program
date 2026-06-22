const MVP_ENABLED = true;

export const MVP_TRAINING_CAMP_KEYWORD = "训练营";
export const MVP_TRAINING_CAMP_CATEGORY_ID = 0;
export const MVP_TRAINING_CAMP_PRODUCT_IDS = [];

const HIDDEN_DDIY_COMPONENTS = [
  "articleList",
  "bargain",
  "combination",
  "coupon",
  "customerService",
  "liveBroadcast",
  "news",
  "pointsMall",
  "presale",
  "promotionList",
  "seckill",
  "videos",
];

const HIDDEN_LINK_KEYWORDS = [
  "activity/goods_bargain",
  "activity/bargain",
  "activity/goods_combination",
  "activity/goods_details",
  "activity/goods_seckill",
  "activity/presell",
  "annex/special",
  "columnGoods/HotNewGoods",
  "columnGoods/live_list",
  "extension/customer_list",
  "extension/news",
  "goods/lottery",
  "live",
  "points_mall",
  "short_video",
  "theme_id",
  "user_coupon",
  "user_get_coupon",
  "user_integral",
  "user_goods_collection",
  "user_invoice",
  "user_money",
  "user_payment",
  "visit_list",
  "message_center",
  "message_system",
  "payment_on_behalf",
  "receive_gift",
  "receive_gifts_status",
  "user_cancellation",
];

const HOME_ALLOWED_DDIY_COMPONENTS = [
  "blankPage",
  "goodList",
  "goodRecommend",
  "home_paid_vip",
  "homeComb",
  "newVip",
  "pageFoot",
  "richText",
  "signIn",
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
  if (MVP_TRAINING_CAMP_PRODUCT_IDS.length) {
    next.productId = MVP_TRAINING_CAMP_PRODUCT_IDS.join(",");
    next.cid = 0;
    next.keyword = "";
    return next;
  }
  if (MVP_TRAINING_CAMP_CATEGORY_ID) {
    next.cid = MVP_TRAINING_CAMP_CATEGORY_ID;
    next.productId = "";
    next.keyword = "";
    return next;
  }
  next.cid = 0;
  next.productId = "";
  next.keyword = MVP_TRAINING_CAMP_KEYWORD;
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
    discountId: 0,
    advanceId: 0,
    pinkId: 0,
    seckill_id: 0,
  };
}

export function isMvpTrainingCampProduct(product = {}) {
  if (!MVP_ENABLED) return true;
  const productId = String(product.id || product.product_id || "");
  if (MVP_TRAINING_CAMP_PRODUCT_IDS.length) {
    return MVP_TRAINING_CAMP_PRODUCT_IDS.map(String).includes(productId);
  }
  if (MVP_TRAINING_CAMP_CATEGORY_ID) {
    const cateIds = Array.isArray(product.cate_id)
      ? product.cate_id
      : String(product.cate_id || product.cid || "")
          .split(",")
          .filter(Boolean);
    return cateIds.map(String).includes(String(MVP_TRAINING_CAMP_CATEGORY_ID));
  }
  return String(product.store_name || product.title || "").indexOf(MVP_TRAINING_CAMP_KEYWORD) !== -1;
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
