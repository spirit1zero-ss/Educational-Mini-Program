const { INLINE_OPTIONS } = require("../../utils/module-b-results");

Page({
  data: {
    imageSrc: "../../assets/doc-images/ABC-04.jpeg",
    options: INLINE_OPTIONS
  },

  onSelect(event) {
    const type = event.currentTarget.dataset.type;

    wx.showModal({
      title: `确认选择 ${type}`,
      content: "确认后会显示对应解读。",
      confirmText: "确认",
      cancelText: "再看看",
      confirmColor: "#1f6b57",
      success: (res) => {
        if (res.confirm) {
          wx.navigateTo({
            url: `/pages/module-b-result/module-b-result?type=${type}`
          });
        }
      }
    });
  }
});
