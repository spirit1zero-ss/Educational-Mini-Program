const { OPTIONS } = require("../../utils/module-b-results");
const { applyCloudAssets, restoreLocalAsset } = require("../../utils/cloud-assets");

const LOCAL_ASSETS = {
  heroImage: "../../assets/doc-images/ABC-04.jpg"
};

const CLOUD_ASSET_FIELDS = {
  heroImage: "assessment.subjectChildren"
};

Page({
  data: {
    options: OPTIONS,
    selectedType: "",
    heroImage: LOCAL_ASSETS.heroImage
  },

  onLoad() {
    applyCloudAssets(this, CLOUD_ASSET_FIELDS);
  },

  onCloudImageError(event) {
    restoreLocalAsset(this, event, LOCAL_ASSETS);
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
      url: `/packages/features/pages/module-b-result/module-b-result?type=${selectedType}`
    });
  }
});
