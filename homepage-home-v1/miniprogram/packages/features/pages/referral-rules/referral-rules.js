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
        desc: "符合后台结算条件后，奖励进入收益记录并支持后续提现。"
      }
    ],
    rules: [
      {
        title: "谁可以推广",
        desc: "已开通训练营会员的用户可以生成专属推广海报并参与邀请奖励。"
      },
      {
        title: "奖励如何计算",
        desc: "奖励比例、结算周期、可提现金额以后端配置和订单状态为准。"
      },
      {
        title: "哪些情况不计入",
        desc: "退款订单、异常订单、重复绑定或后台判定无效的邀请不计入有效奖励。"
      }
    ],
    notices: [
      "页面展示为前端说明文案，最终奖励金额以后台统计为准。",
      "邀请记录、我的收益和训练营订单将作为后续核对入口。",
      "如需调整奖励比例，只需要后端返回配置后替换本页规则数据。"
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
