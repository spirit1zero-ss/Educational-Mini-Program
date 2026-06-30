Component({
  properties: {
    title: {
      type: String,
      value: ""
    },
    showBack: {
      type: Boolean,
      value: false
    },
    showHome: {
      type: Boolean,
      value: false
    },
    homeUrl: {
      type: String,
      value: "/pages/home/home"
    }
  },

  data: {
    navStyle: "",
    navBarStyle: "",
    homeStyle: ""
  },

  lifetimes: {
    attached() {
      let menuButton = null
      let systemInfo = {
        statusBarHeight: 44,
        windowWidth: 375
      }

      try {
        const app = getApp && getApp()
        menuButton = app && app.globalData ? app.globalData.menuButton : null
      } catch (error) {
        menuButton = null
      }

      try {
        systemInfo = wx.getSystemInfoSync()
      } catch (error) {
        systemInfo = {
          statusBarHeight: 44,
          windowWidth: 375
        }
      }

      if (!menuButton && wx.getMenuButtonBoundingClientRect) {
        try {
          menuButton = wx.getMenuButtonBoundingClientRect()
        } catch (error) {
          menuButton = null
        }
      }

      const statusBarHeight = systemInfo.statusBarHeight || 44
      const windowWidth = systemInfo.windowWidth || 375
      const capsuleTop = menuButton && menuButton.top ? menuButton.top : statusBarHeight + 4
      const capsuleHeight = menuButton && menuButton.height ? menuButton.height : 32
      const capsuleBottom = menuButton && menuButton.bottom ? menuButton.bottom : statusBarHeight + 40
      const capsuleLeft = menuButton && menuButton.left ? menuButton.left : windowWidth - 96
      const rightPadding = windowWidth - capsuleLeft + 12
      const homeRightInset = Math.max(rightPadding - 12, 0)

      this.setData({
        navStyle: `height:${capsuleBottom + 8}px;`,
        navBarStyle: [
          `padding-top:${capsuleTop}px`,
          `--nav-bar-height:${capsuleHeight}px`,
          "--nav-bar-background-color:rgba(247, 250, 245, 0.96)",
          "--nav-bar-title-text-color:#1d2b26",
          "--nav-bar-title-font-size:15px",
          "--nav-bar-icon-color:#1f6b57",
          "--nav-bar-text-color:#1f6b57",
          "--font-weight-bold:700",
          "--padding-md:12px"
        ].join(";"),
        homeStyle: `margin-right:${homeRightInset}px;`
      })
    }
  },

  methods: {
    onBack() {
      const pages = getCurrentPages ? getCurrentPages() : []

      if (pages.length > 1) {
        wx.navigateBack({ delta: 1 })
        return
      }

      wx.reLaunch({ url: this.data.homeUrl })
    },

    onHome() {
      wx.reLaunch({ url: this.data.homeUrl })
    }
  }
})
