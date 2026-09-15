const { OPTIONS } = require("../../utils/module-a-results");
const {
  enableShareMenu,
  createShareAppMessage,
  createShareTimeline
} = require("../../../../utils/public-share");

const SHARE_OPTIONS = {
  title: "学科开窍测评｜看看孩子更接近哪种学习特点",
  path: "/packages/features/pages/module-a-assessment/module-a-assessment",
  imageUrl: "/packages/features/assets/images/module-a-characters.jpg"
};

Page({
  data: {
    options: OPTIONS,
    selectedType: "",
    heroImage: "../../assets/images/module-a-characters.jpg"
  },

  onLoad() {
    enableShareMenu();
  },

  onBack() {
    wx.navigateBack({
      fail: () => {
        wx.redirectTo({
          url: "/pages/home/home"
        });
      }
    });
  },

  onHome() {
    wx.reLaunch({
      url: "/pages/home/home"
    });
  },

  onSelect(event) {
    this.setData({
      selectedType: event.detail.type
    });
  },

  onViewResult() {
    const { selectedType } = this.data;
    if (!selectedType) return;

    wx.navigateTo({
      url: `/packages/features/pages/module-a-result/module-a-result?type=${selectedType}`
    });
  },

  onShareAppMessage() {
    return createShareAppMessage(SHARE_OPTIONS);
  },

  onShareTimeline() {
    return createShareTimeline(SHARE_OPTIONS);
  }
});
