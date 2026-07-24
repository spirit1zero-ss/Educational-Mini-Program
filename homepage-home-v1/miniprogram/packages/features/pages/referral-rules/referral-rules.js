Page({
  data: {
    heroIcon: "/assets/mine/icon-referral.svg",
    steps: [
      {
        title: "生成专属海报",
        desc: "训练营会员可在“我的”页面生成带 UID 的推广海报。"
      },
      {
        title: "好友扫码报名",
        desc: "好友通过你的海报进入小程序并完成训练营报名。"
      },
      {
        title: "后台记录关系",
        desc: "系统根据邀请码、UID 或分享路径记录邀请关系。"
      },
      {
        title: "奖励结算提现",
        desc: "奖励先进入待结算，后台审核通过后变为可提现。"
      }
    ],
    rules: [
      {
        title: "谁可以推广",
        desc: "已开通训练营会员的用户可以生成专属推广海报并参与邀请奖励。"
      },
      {
        title: "奖励如何计算",
        desc: "一级返佣按身份固定为120、150、200或300元，二级返佣统一为20元。"
      },
      {
        title: "身份与初始名额",
        desc: "普通会员、盟友、代理、合伙人的团队初始名额分别展示为1、30、50、200。"
      },
      {
        title: "哪些情况不计入",
        desc: "退款订单、异常订单、重复绑定或后台判定无效的邀请不计入有效奖励。"
      }
    ],
    notices: [
      "终端客户统一在线支付399元，订单款进入公司账户，推广人只获得对应返佣。",
      "退款、异常订单、无效邀请会撤销对应团队人数和佣金。",
      "提现手续费按申请金额的0.6%计算，已提现展示实际到账净额。"
    ]
  },

  onPosterTap() {
    wx.navigateTo({
      url: "/packages/features/pages/promo-poster/promo-poster",
      fail: () => {
        wx.showToast({
          title: "推广海报打开失败",
          icon: "none"
        });
      }
    });
  }
});
