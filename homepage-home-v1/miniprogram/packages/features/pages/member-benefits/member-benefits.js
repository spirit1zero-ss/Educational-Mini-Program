const { getMemberPlans } = require('../../../../api/mine')

Page({
  data: {
    memberPriceText: '价格加载中',
    heroIcon: "/assets/mine/icon-member-benefit.svg",
    benefits: [
      {
        title: "三次直播课",
        desc: "围绕开营、内驱力、学科开窍，帮助家长抓住孩子自主学习的核心方法。",
        icon: "../../assets/module-2-logic/icons/calculation.png"
      },
      {
        title: "21天打卡陪跑",
        desc: "用连续陪跑和督导，把方法真正落到每天的学习行动里。",
        icon: "../../assets/module-2-logic/icons/equation-function.png"
      },
      {
        title: "3个月答疑支持",
        desc: "训练营结束后继续答疑，帮助家长处理执行过程中的真实问题。",
        icon: "../../assets/module-2-logic/icons/callout-star.png"
      },
      {
        title: "推广权益",
        desc: "成为训练营会员后，可生成专属海报，邀请好友报名获得推广奖励。",
        icon: "/assets/mine/icon-referral.svg"
      }
    ],
    serviceNotes: [
      "会员权益以后台开通状态为准，支付或兑换成功后自动生效。",
      "课程、打卡、答疑等服务由训练营老师和助教按开营安排执行。",
      "推广权益仅对已开通训练营会员开放，具体奖励以分销规则说明为准。"
    ]
  },

  onLoad() {
    getMemberPlans()
      .then((response) => {
        const plans = Array.isArray(response.data) ? response.data : []
        const plan = plans.find((item) => item && !item.isFree && item.mcId)
        this.setData({
          memberPriceText: plan ? (plan.priceText || `${plan.price}元`) : '暂未开放'
        })
      })
      .catch((error) => {
        console.warn('[member-benefits] load member price failed:', error)
        this.setData({ memberPriceText: '价格暂不可用' })
      })
  },

  onCampTap() {
    wx.navigateTo({
      url: "/packages/features/pages/module-5-camp/module-5-camp",
      fail: () => {
        wx.showToast({
          title: "训练营页面打开失败",
          icon: "none"
        });
      }
    });
  },

  onPayTap() {
    wx.navigateTo({
      url: "/packages/features/pages/camp-checkout/camp-checkout",
      fail: () => {
        wx.showToast({
          title: "支付页面打开失败",
          icon: "none"
        });
      }
    });
  }
});
