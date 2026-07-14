Page({
  data: {
    tableFileId: "cloud://prod-d0ge2jwpgc0db67eb.7072-prod-d0ge2jwpgc0db67eb-1453312076/sop-homework-table.docx",
    iconBase: "../../assets/module-2-logic/icons/"
  },

  onDownloadTable() {
    this.downloadCloudTable();
  },

  downloadCloudTable() {
    wx.showLoading({
      title: "下载中"
    });

    wx.cloud.downloadFile({
      fileID: this.data.tableFileId,
      success: (res) => {
        if (res.tempFilePath) {
          this.openDocument(res.tempFilePath);
          return;
        }

        this.showDownloadError();
      },
      fail: (error) => {
        console.error("Download table failed", error);
        this.showDownloadError();
      }
    });
  },

  openDocument(filePath) {
    wx.showLoading({
      title: "打开中"
    });

    wx.openDocument({
      filePath,
      fileType: "docx",
      showMenu: true,
      success: () => {
        wx.hideLoading();
      },
      fail: (error) => {
        console.error("Open table failed", error);
        this.showOpenError();
      }
    });
  },

  showDownloadError() {
    wx.hideLoading();
    wx.showModal({
      title: "下载失败",
      content: "表格下载失败，请检查网络后重试。",
      showCancel: false,
      confirmText: "知道了"
    });
  },

  showOpenError() {
    wx.hideLoading();
    wx.showModal({
      title: "无法打开文件",
      content: "表格文件打开失败，请稍后重试或更换设备。",
      showCancel: false,
      confirmText: "知道了"
    });
  }
});
