const MODULE_A_PATH = '/pages/module-a-assessment/module-a-assessment'
const MODULE_2_LOGIC_PATH = '/pages/module-2-logic/module-2-logic'
const MODULE_3_HABIT_PATH = '/pages/module-3-habit/module-3-habit'
const MODULE_4_DRIVE_PATH = '/pages/module-4-drive/module-4-drive'
const MODULE_5_CAMP_PATH = '/pages/module-5-camp/module-5-camp'
const MODULE_B_TABLE_PATH = '/pages/module-b-table/module-b-table'
const MODULE_B_PATH = '/pages/module-b-inline/module-b-inline'
const MINE_PATH = '/pages/mine/mine'

Page({
  data: {
    navStyle: '',
    scrollStyle: '',
    modules: [
      {
        key: 'subject',
        title: '学科开窍',
        subtitle: '学科性格开窍法',
        className: 'module-card--top',
        path: MODULE_2_LOGIC_PATH
      },
      {
        key: 'habit',
        title: '学习习惯',
        subtitle: 'SOP高效作业法',
        className: 'module-card--middle',
        path: MODULE_3_HABIT_PATH
      },
      {
        key: 'drive',
        title: '内驱力',
        subtitle: '慧眼读心赋能法',
        className: 'module-card--bottom',
        path: MODULE_4_DRIVE_PATH
      }
    ],
    actions: [
      {
        key: 'subject-test',
        title: '一张图让孩子学科开窍',
        desc: '启发灵感，让学习更加生动有趣',
        actionText: '去测评',
        type: 'subject',
        path: MODULE_A_PATH
      },
      {
        key: 'heart-test',
        title: '一张图让家长读懂孩子心',
        desc: '读懂孩子，让内心更有自信力量',
        actionText: '去测评',
        type: 'heart',
        path: MODULE_B_PATH
      },
      {
        key: 'sop-download',
        title: '一张图养成作业好习惯',
        desc: '运用工具，让流程更加科学高效',
        actionText: '下载',
        type: 'download',
        path: MODULE_B_TABLE_PATH
      }
    ],
    tabs: [
      { key: 'home', text: '首页' },
      { key: 'mine', text: '我的' },
      { key: 'offline', text: '线下' }
    ]
  },

  onLoad() {
    this.setNavigationMetrics()
  },

  setNavigationMetrics() {
    const fallbackNavHeight = 88
    try {
      const system = wx.getSystemInfoSync()
      const menu = wx.getMenuButtonBoundingClientRect()
      const navHeight = menu.bottom + 12
      const rightPadding = Math.max(system.windowWidth - menu.left + 12, 96)

      this.setData({
        navStyle: `height:${navHeight}px;padding-top:${menu.top}px;padding-right:${rightPadding}px;`,
        scrollStyle: `height:calc(100vh - ${navHeight}px - 120rpx);`
      })
    } catch (error) {
      this.setData({
        navStyle: `height:${fallbackNavHeight}px;padding-top:44px;padding-right:110px;`,
        scrollStyle: `height:calc(100vh - ${fallbackNavHeight}px - 120rpx);`
      })
    }
  },

  openPath(path) {
    if (!path) {
      wx.showToast({
        title: '页面建设中',
        icon: 'none'
      })
      return
    }

    wx.navigateTo({
      url: path,
      fail: () => {
        wx.showToast({
          title: '页面建设中',
          icon: 'none'
        })
      }
    })
  },

  onModuleTap(e) {
    const item = e.currentTarget.dataset.item
    if (!item) return
    this.openPath(item.path)
  },

  onActionTap(e) {
    const item = e.currentTarget.dataset.item
    if (!item) return

    this.openPath(item.path)
  },

  onCampTap() {
    wx.navigateTo({
      url: MODULE_5_CAMP_PATH,
      fail: () => {
        wx.showToast({
          title: '页面建设中',
          icon: 'none'
        })
      }
    })
  },

  onTabTap(e) {
    const key = e.currentTarget.dataset.key
    if (key === 'mine') {
      wx.redirectTo({
        url: MINE_PATH,
        fail: () => {
          wx.showToast({
            title: '页面建设中',
            icon: 'none'
          })
        }
      })
      return
    }

    if (key !== 'home') {
      wx.showToast({
        title: '页面建设中',
        icon: 'none'
      })
    }
  }
})
