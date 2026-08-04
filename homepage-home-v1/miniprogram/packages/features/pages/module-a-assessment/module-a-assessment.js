const { OPTIONS } = require("../../utils/module-a-results");

Page({
  data: {
    options: OPTIONS,
    selectedType: "",
    heroImage: "../../assets/images/module-a-characters.jpg"
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
  }
});
