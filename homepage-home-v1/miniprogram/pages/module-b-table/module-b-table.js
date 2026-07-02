Page({
  data: {
    tableDocPath: "../../assets/module-b-table/sop-homework-table.docx",
    tableFileUrl: "",
    iconBase: "../../assets/module-2-logic/icons/"
  },

  onDownloadTable() {
    if (this.data.tableFileUrl) {
      this.downloadRemoteTable();
      return;
    }

    this.openDocument(this.data.tableDocPath);
  },

  downloadRemoteTable() {
    wx.showLoading({
      title: "下载中"
    });

    wx.downloadFile({
      url: this.data.tableFileUrl,
      success: (res) => {
        if (res.statusCode === 200 && res.tempFilePath) {
          this.openDocument(res.tempFilePath);
          return;
        }

        wx.hideLoading();
        wx.showToast({
          title: "下载失败",
          icon: "none"
        });
      },
      fail: () => {
        wx.hideLoading();
        wx.showToast({
          title: "下载失败",
          icon: "none"
        });
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
      fail: () => {
        wx.hideLoading();
        wx.showModal({
          title: "无法打开文件",
          content: "当前环境无法直接打开表格，请上传到服务器后配置下载地址再测试真机下载。",
          showCancel: false,
          confirmText: "知道了"
        });
      }
    });
  }
});
