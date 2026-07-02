const { INLINE_OPTIONS } = require("../../utils/module-b-results");

Page({
  data: {
    imageSrc: "../../assets/doc-images/ABC-04.jpeg",
    options: INLINE_OPTIONS
  },

  onSelect(event) {
    const type = event.currentTarget.dataset.type;
    const option = this.data.options.find((item) => item.type === type);
    const label = option ? option.title : `${type} 类型`;

    wx.showModal({
      title: "确认选择",
      content: `确定选择 ${type}：${label} 吗？确认后会显示对应解读。`,
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
