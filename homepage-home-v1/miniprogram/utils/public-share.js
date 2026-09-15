const DEFAULT_IMAGE_URL = '/assets/home/homepage-background-clean.jpg'
const HOME_SHARE_OPTIONS = {
  title: '育心自主学习｜陪孩子找到适合自己的学习方法',
  path: '/pages/home/home'
}

function enableShareMenu({ timeline = true } = {}) {
  if (typeof wx.showShareMenu !== 'function') return

  wx.showShareMenu({
    withShareTicket: true,
    menus: timeline ? ['shareAppMessage', 'shareTimeline'] : ['shareAppMessage']
  })
}

function createShareAppMessage(options = HOME_SHARE_OPTIONS) {
  return {
    title: options.title,
    path: options.path,
    imageUrl: options.imageUrl || DEFAULT_IMAGE_URL
  }
}

function createShareTimeline(options) {
  return {
    title: options.title,
    query: options.query || '',
    imageUrl: options.imageUrl || DEFAULT_IMAGE_URL
  }
}

module.exports = {
  enableShareMenu,
  createShareAppMessage,
  createShareTimeline
}
