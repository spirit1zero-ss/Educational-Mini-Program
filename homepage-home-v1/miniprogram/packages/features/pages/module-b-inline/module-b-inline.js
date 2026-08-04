const { INLINE_OPTIONS } = require("../../utils/module-b-results");
const { applyCloudAssets, restoreLocalAsset } = require("../../utils/cloud-assets");

const LOCAL_ASSETS = {
  imageSrc: "../../assets/doc-images/ABC-04.jpg"
};

const CLOUD_ASSET_FIELDS = {
  imageSrc: "assessment.subjectChildren"
};

Page({
  data: {
    imageSrc: LOCAL_ASSETS.imageSrc,
    options: INLINE_OPTIONS
  },

  onLoad() {
    applyCloudAssets(this, CLOUD_ASSET_FIELDS);
  },

  onCloudImageError(event) {
    restoreLocalAsset(this, event, LOCAL_ASSETS);
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
            url: `/packages/features/pages/module-b-result/module-b-result?type=${type}`
          });
        }
      }
    });
  }
});
