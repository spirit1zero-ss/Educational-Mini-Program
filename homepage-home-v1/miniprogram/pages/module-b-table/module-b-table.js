Page({
  data: {
    tableDocPath: "assets/module-b-table/sop-homework-table.docx",
    tableFileUrl: "",
    iconBase: "../../assets/module-2-logic/icons/"
  },

  onDownloadTable() {
    if (this.data.tableFileUrl) {
      this.downloadRemoteTable();
      return;
    }

    this.openBundledTable();
  },

  openBundledTable() {
    const fileSystem = wx.getFileSystemManager();
    const targetPath = `${wx.env.USER_DATA_PATH}/sop-homework-table.docx`;

    wx.showLoading({
      title: "准备文件"
    });

    fileSystem.readFile({
      filePath: this.data.tableDocPath,
      success: (readResult) => {
        fileSystem.writeFile({
          filePath: targetPath,
          data: readResult.data,
          success: () => {
            this.openDocument(targetPath);
          },
          fail: () => {
            this.showOpenError();
          }
        });
      },
      fail: () => {
        this.showOpenError();
      }
    });
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
        this.showOpenError();
      }
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
