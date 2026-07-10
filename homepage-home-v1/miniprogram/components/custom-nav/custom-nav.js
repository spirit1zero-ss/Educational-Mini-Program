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
    navRowStyle: ""
  },

  lifetimes: {
    attached() {
      let menuButton = null
      let systemInfo = {
        statusBarHeight: 44
      }

      try {
        const app = getApp && getApp()
        menuButton = app && app.globalData ? app.globalData.menuButton : null
      } catch (error) {
        menuButton = null
      }

      try {
        if (wx.getWindowInfo) {
          systemInfo = wx.getWindowInfo()
        }
      } catch (error) {
        systemInfo = {
          statusBarHeight: 44
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
      const capsuleTop = menuButton && menuButton.top ? menuButton.top : statusBarHeight + 4
      const capsuleHeight = menuButton && menuButton.height ? menuButton.height : 32
      const capsuleBottom = menuButton && menuButton.bottom ? menuButton.bottom : statusBarHeight + 40

      this.setData({
        navStyle: `height:${capsuleBottom + 8}px;`,
        navBarStyle: `padding-top:${capsuleTop}px;`,
        navRowStyle: `height:${capsuleHeight}px;`
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
