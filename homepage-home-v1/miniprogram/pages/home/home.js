Page({
  data: {
    safeTopStyle: 'height: 88px;',
    safeBottom: 0,
    bottomPlaceholderStyle: 'height: 118rpx;',
    modules: [
      {
        key: 'knowledge',
        badge: '叶',
        title: '知识',
        subtitle: '学科性格开窍法',
        tone: 'green',
        icon: '/assets/home/reference-module-leaf.png',
        indicatorIcon: '/assets/home/home-tap-arrow-green.png',
        path: '/packages/features/pages/module-2-logic/module-2-logic'
      },
      {
        key: 'habit',
        badge: '茎',
        title: '习惯',
        subtitle: 'SOP高效作业法',
        tone: 'blue',
        icon: '/assets/home/reference-module-clipboard.png',
        indicatorIcon: '/assets/home/home-tap-arrow-blue.png',
        path: '/packages/features/pages/module-3-habit/module-3-habit'
      },
      {
        key: 'drive',
        badge: '根',
        title: '内驱',
        subtitle: '慧眼读心赋能法',
        tone: 'orange',
        icon: '/assets/home/reference-module-heart.png',
        indicatorIcon: '/assets/home/home-tap-arrow-orange.png',
        path: '/packages/features/pages/module-4-drive/module-4-drive'
      }
    ],
    actions: [
      {
        key: 'subject-test',
        title: '一张图让孩子学科开窍',
        description: '启发灵感，让学习更加生动有趣',
        action: '测评',
        tone: 'green',
        icon: '/assets/home/reference-icon-subject.png',
        indicatorIcon: '/assets/home/home-tap-arrow-green.png',
        path: '/packages/features/pages/module-a-assessment/module-a-assessment'
      },
      {
        key: 'habit-tool',
        title: '一张图养成作业好习惯',
        description: '运用工具，让流程更加科学高效',
        action: '下载',
        tone: 'blue',
        icon: '/assets/home/reference-icon-habit.png',
        indicatorIcon: '/assets/home/home-tap-arrow-blue.png',
        path: '/packages/features/pages/module-b-table/module-b-table'
      },
      {
        key: 'heart-test',
        title: '一张图让家长懂孩子心',
        description: '读懂孩子，让内心更有自信力量',
        action: '测评',
        tone: 'orange',
        icon: '/assets/home/reference-icon-heart.png',
        indicatorIcon: '/assets/home/home-tap-arrow-orange.png',
        path: '/packages/features/pages/module-b-inline/module-b-inline'
      },
      {
        key: 'camp',
        title: '21天训练营计划',
        description: '21天陪伴式训练，见证孩子的成长蜕变',
        action: '去查看',
        tone: 'green',
        solid: true,
        icon: '/assets/home/reference-icon-camp.png',
        indicatorIcon: '/assets/home/home-tap-arrow-white.png',
        path: '/packages/features/pages/module-5-camp/module-5-camp'
      }
    ],
    tabs: [
      {
        key: 'home',
        label: '首页',
        icon: '/assets/mine/tab-home.svg',
        activeIcon: '/assets/mine/tab-home-active.svg',
        path: '/pages/home/home'
      },
      {
        key: 'mine',
        label: '我的',
        icon: '/assets/mine/tab-mine.svg',
        activeIcon: '/assets/mine/tab-mine-active.svg',
        path: '/pages/mine/mine'
      },
      {
        key: 'offline',
        label: '线下',
        icon: '/assets/mine/tab-offline.svg',
        activeIcon: '/assets/mine/tab-offline-active.svg',
        path: '/pages/offline/offline'
      }
    ]
  },

  onLoad() {
    this.setSafeAreaMetrics()
  },

  setSafeAreaMetrics() {
    try {
      const info = typeof wx.getWindowInfo === 'function'
        ? wx.getWindowInfo()
        : wx.getSystemInfoSync()
      const menuButton = typeof wx.getMenuButtonBoundingClientRect === 'function'
        ? wx.getMenuButtonBoundingClientRect()
        : null
      const safeArea = info.safeArea || {}
      const screenHeight = Number(info.screenHeight) || Number(info.windowHeight) || 0
      const statusBarHeight = Number(info.statusBarHeight) || Number(safeArea.top) || 0
      const menuBottom = menuButton && Number(menuButton.bottom)
        ? Number(menuButton.bottom)
        : statusBarHeight + 40
      const safeBottom = Math.max(screenHeight - (Number(safeArea.bottom) || screenHeight), 0)
      const safeTop = Math.max(menuBottom + 8, statusBarHeight + 48)

      this.setData({
        safeTopStyle: `height: ${safeTop}px;`,
        safeBottom,
        bottomPlaceholderStyle: `height: calc(118rpx + ${safeBottom}px);`
      })
    } catch (error) {
      this.setData({
        safeTopStyle: 'height: 88px;',
        safeBottom: 0,
        bottomPlaceholderStyle: 'height: 118rpx;'
      })
    }
  },

  openPath(path, redirect = false) {
    if (!path) return

    const navigate = redirect ? wx.redirectTo : wx.navigateTo
    navigate({
      url: path,
      fail: () => {
        wx.showToast({
          title: '页面建设中',
          icon: 'none'
        })
      }
    })
  },

  onModuleTap(event) {
    const index = Number(event.currentTarget.dataset.index)
    const item = this.data.modules[index]
    this.openPath(item && item.path)
  },

  onActionTap(event) {
    const index = Number(event.currentTarget.dataset.index)
    const item = this.data.actions[index]
    this.openPath(item && item.path)
  },

  onTabTap(event) {
    const index = Number(event.currentTarget.dataset.index)
    const item = this.data.tabs[index]

    if (!item || item.key === 'home') return
    this.openPath(item.path, true)
  }
})
