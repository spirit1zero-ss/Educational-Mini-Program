Page({
  data: {
    submitting: false,
    agreed: true,
    product: {
      title: "21天线上特训营",
      subtitle: "直播课 + 打卡陪跑 + 答疑服务",
      price: "399",
      originPrice: "599"
    },
    benefits: [
      {
        title: "三次直播",
        desc: "每周一次",
        icon: "../../assets/module-2-logic/icons/calculation.png"
      },
      {
        title: "21天陪跑",
        desc: "打卡督导",
        icon: "../../assets/module-2-logic/icons/equation-function.png"
      },
      {
        title: "答疑支持",
        desc: "3个月答疑",
        icon: "../../assets/module-2-logic/icons/callout-star.png"
      }
    ],
    notices: [
      "支付完成后，系统将记录您的训练营报名状态。",
      "后续由助教老师联系入群，并安排开营学习。",
      "如支付失败或取消，可返回本页重新发起支付。"
    ]
  },

  onToggleAgreement() {
    this.setData({
      agreed: !this.data.agreed
    });
  },

  onPayTap() {
    if (!this.data.agreed || this.data.submitting) return;

    this.setData({ submitting: true });
    wx.showToast({
      title: "支付接口待接入",
      icon: "none"
    });
    setTimeout(() => {
      this.setData({ submitting: false });
    }, 500);
  }
});
