const { RESULT_MAP, SUBJECT_TRAITS } = require("../../utils/module-b-results");

const CAMP_PATH = "/packages/features/pages/module-5-camp/module-5-camp";

Page({
  data: {
    result: RESULT_MAP.A,
    subjectTraits: SUBJECT_TRAITS
  },

  onLoad(options) {
    const type = options && options.type ? String(options.type).toUpperCase() : "A";
    this.setData({
      result: RESULT_MAP[type] || RESULT_MAP.A
    });
  },

  onBack() {
    wx.navigateBack({
      fail: () => {
        wx.redirectTo({
          url: "/packages/features/pages/module-b-inline/module-b-inline"
        });
      }
    });
  },

  onHome() {
    wx.reLaunch({
      url: "/pages/home/home"
    });
  },

  onRestart() {
    wx.redirectTo({
      url: "/packages/features/pages/module-b-inline/module-b-inline"
    });
  },

  onCamp() {
    wx.navigateTo({
      url: CAMP_PATH,
      fail: () => {
        wx.showToast({
          title: "训练营页面打开失败",
          icon: "none"
        });
      }
    });
  }
});
