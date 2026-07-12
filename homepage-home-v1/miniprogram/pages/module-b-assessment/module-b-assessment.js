const { OPTIONS } = require("../../utils/module-b-results");

Page({
  data: {
    options: OPTIONS,
    selectedType: "",
    heroImage: "../../assets/doc-images/ABC-04.jpg"
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
      url: `/pages/module-b-result/module-b-result?type=${selectedType}`
    });
  }
});
