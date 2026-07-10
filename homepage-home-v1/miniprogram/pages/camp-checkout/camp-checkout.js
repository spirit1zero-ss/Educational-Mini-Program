const { createTrainingCampMemberOrder } = require('../../api/mine')
const CAMP_ORDERS_PATH = '/pages/camp-orders/camp-orders'

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
    wx.showLoading({ title: "创建订单中" });

    createTrainingCampMemberOrder({
      payType: "weixin"
    })
      .then((response) => {
        wx.hideLoading();
        const order = response.data || {};
        const reused = order.status === 'pending_reused';
        wx.showModal({
          title: reused ? "已有待支付订单" : "订单已创建",
          content: order.orderId
            ? `订单号：${order.orderId}\n请到订单页继续支付`
            : "支付接口待接入",
          showCancel: true,
          confirmText: "去订单页",
          cancelText: "稍后",
          success: (result) => {
            if (result.confirm) {
              wx.navigateTo({
                url: CAMP_ORDERS_PATH
              });
            }
          }
        });
      })
      .catch((error) => {
        wx.hideLoading();
        wx.showToast({
          title: (error && error.message) || "订单创建失败",
          icon: "none"
        });
      })
      .then(() => {
        this.setData({ submitting: false });
      });
  },

  onPaymentSuccess() {
    wx.showModal({
      title: "报名成功",
      content: "请完善会员登记信息，方便老师后续跟进。",
      confirmText: "去填写",
      cancelText: "稍后",
      success: (result) => {
        if (result.confirm) {
          wx.navigateTo({
            url: "/pages/member-registration/member-registration?from=pay_success"
          });
        }
      }
    });
  }
});
