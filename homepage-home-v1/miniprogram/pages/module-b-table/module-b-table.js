const TABLE_CACHE_VERSION = "v1";
const TABLE_CACHE_PATH = `${wx.env.USER_DATA_PATH}/sop-homework-table-${TABLE_CACHE_VERSION}.docx`;

const DOWNLOAD_STATES = {
  idle: {
    isBusy: false,
    actionText: "打开",
    statusText: "首次打开将下载并缓存到小程序",
    barTitle: "点击下载表格",
    barSubtitle: "打开后可通过右上角保存或转发"
  },
  cached: {
    isBusy: false,
    actionText: "打开",
    statusText: "已缓存到小程序，点击可再次打开",
    barTitle: "打开已下载表格",
    barSubtitle: "可通过右上角保存或转发"
  },
  checking: {
    isBusy: true,
    actionText: "准备中",
    statusText: "正在检查本地文件",
    barTitle: "正在准备文件",
    barSubtitle: "请稍候"
  },
  downloading: {
    isBusy: true,
    actionText: "下载中",
    statusText: "正在从云存储下载",
    barTitle: "正在下载表格",
    barSubtitle: "请勿重复点击"
  },
  opening: {
    isBusy: true,
    actionText: "打开中",
    statusText: "文件已就绪，正在打开",
    barTitle: "下载完成，正在打开",
    barSubtitle: "请稍候"
  },
  error: {
    isBusy: false,
    actionText: "重试",
    statusText: "下载失败，请点击重试",
    barTitle: "重新下载表格",
    barSubtitle: "请检查网络后重试"
  }
};

Page({
  data: {
    tableFileId: "cloud://prod-d0ge2jwpgc0db67eb.7072-prod-d0ge2jwpgc0db67eb-1453312076/sop-homework-table.docx",
    iconBase: "../../assets/module-2-logic/icons/",
    downloadState: "idle",
    ...DOWNLOAD_STATES.idle
  },

  onLoad() {
    this.refreshCacheState();
  },

  onDownloadTable() {
    if (this.data.isBusy) {
      wx.showToast({
        title: "文件正在处理中",
        icon: "none"
      });
      return;
    }

    this.setDownloadState("checking");

    wx.getFileSystemManager().access({
      path: TABLE_CACHE_PATH,
      success: () => {
        this.openDocument(TABLE_CACHE_PATH, true);
      },
      fail: () => {
        this.downloadCloudTable();
      }
    });
  },

  refreshCacheState() {
    wx.getFileSystemManager().access({
      path: TABLE_CACHE_PATH,
      success: () => this.setDownloadState("cached"),
      fail: () => this.setDownloadState("idle")
    });
  },

  downloadCloudTable() {
    this.setDownloadState("downloading");

    wx.showLoading({
      title: "正在下载",
      mask: true
    });

    wx.cloud.downloadFile({
      fileID: this.data.tableFileId,
      success: (res) => {
        if (res.tempFilePath) {
          this.cacheAndOpenDocument(res.tempFilePath);
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

  cacheAndOpenDocument(tempFilePath) {
    wx.getFileSystemManager().copyFile({
      srcPath: tempFilePath,
      destPath: TABLE_CACHE_PATH,
      success: () => {
        this.openDocument(TABLE_CACHE_PATH, true);
      },
      fail: (error) => {
        console.error("Cache table failed", error);
        this.openDocument(tempFilePath, false);
      }
    });
  },

  openDocument(filePath, isCachedFile) {
    wx.hideLoading();
    this.setDownloadState("opening");

    wx.showLoading({
      title: "正在打开",
      mask: true
    });

    wx.openDocument({
      filePath,
      fileType: "docx",
      showMenu: true,
      success: () => {
        wx.hideLoading();
        this.setDownloadState(isCachedFile ? "cached" : "idle");
      },
      fail: (error) => {
        console.error("Open table failed", error);
        if (isCachedFile) {
          this.removeInvalidCache();
          return;
        }

        this.showOpenError(false);
      }
    });
  },

  removeInvalidCache() {
    wx.getFileSystemManager().unlink({
      filePath: TABLE_CACHE_PATH,
      complete: () => {
        this.showOpenError(true);
      }
    });
  },

  setDownloadState(state) {
    this.setData({
      downloadState: state,
      ...DOWNLOAD_STATES[state]
    });
  },

  showDownloadError() {
    wx.hideLoading();
    this.setDownloadState("error");
    wx.showModal({
      title: "下载失败",
      content: "表格下载失败，请检查网络后重试。",
      showCancel: false,
      confirmText: "知道了"
    });
  },

  showOpenError(cacheRemoved) {
    wx.hideLoading();
    this.setDownloadState(cacheRemoved ? "idle" : "error");
    wx.showModal({
      title: "无法打开文件",
      content: cacheRemoved
        ? "本地缓存已失效，请重新点击下载。"
        : "表格文件打开失败，请稍后重试或更换设备。",
      showCancel: false,
      confirmText: "知道了"
    });
  }
});
