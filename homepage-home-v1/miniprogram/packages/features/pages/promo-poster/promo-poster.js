const POSTER_CANVAS_ID = 'promoPosterCanvas'
const CANVAS_WIDTH = 670
const CANVAS_HEIGHT = 1110
const CANVAS_PIXEL_RATIO = 2
const POSTER_BG = '/packages/features/assets/promo-poster/promo-poster-bg.jpg'
const POSTER_BG_CANVAS_SOURCES = [
  '../../assets/promo-poster/promo-poster-bg.jpg',
  '/packages/features/assets/promo-poster/promo-poster-bg.jpg'
]
const { getMemberPlans } = require('../../../../api/mine')

function resolveImageSource(src) {
  if (!/^https?:\/\//i.test(src)) {
    return Promise.resolve(src)
  }

  return new Promise((resolve, reject) => {
    wx.getImageInfo({
      src,
      success: (result) => resolve(result.path || src),
      fail: reject
    })
  })
}

function getCanvasNode(page) {
  return new Promise((resolve, reject) => {
    wx.createSelectorQuery()
      .in(page)
      .select(`#${POSTER_CANVAS_ID}`)
      .fields({ node: true, size: true })
      .exec((result) => {
        const target = result && result[0]

        if (!target || !target.node) {
          const error = new Error('promo poster canvas node not found')
          console.error('[promo-poster] canvas node failed:', error)
          reject(error)
          return
        }

        resolve(target.node)
      })
  })
}

function loadCanvasImage(canvas, sources, fallbackWidth, fallbackHeight) {
  const candidates = (Array.isArray(sources) ? sources : [sources]).filter(Boolean)

  return new Promise((resolve, reject) => {
    if (!candidates.length) {
      reject(new Error('canvas image source is empty'))
      return
    }

    const image = canvas.createImage()
    let index = 0
    const loadNext = (error) => {
      if (error) {
        console.warn('[promo-poster] canvas image retry:', candidates[index - 1], error)
      }

      if (index >= candidates.length) {
        console.error('[promo-poster] canvas image load failed:', candidates[candidates.length - 1], error)
        reject(error)
        return
      }

      const source = candidates[index]
      index += 1
      resolveImageSource(source)
        .then((resolvedSource) => {
          image.src = resolvedSource
        })
        .catch(loadNext)
    }

    image.onload = () => {
      resolve({
        image,
        width: image.width || fallbackWidth,
        height: image.height || fallbackHeight
      })
    }
    image.onerror = loadNext
    loadNext()
  })
}

function addRoundRectPath(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2)

  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + width - r, y)
  ctx.quadraticCurveTo(x + width, y, x + width, y + r)
  ctx.lineTo(x + width, y + height - r)
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height)
  ctx.lineTo(x + r, y + height)
  ctx.quadraticCurveTo(x, y + height, x, y + height - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

function fillRoundRect(ctx, x, y, width, height, radius, color) {
  addRoundRectPath(ctx, x, y, width, height, radius)
  ctx.fillStyle = color
  ctx.fill()
}

function strokeRoundRect(ctx, x, y, width, height, radius, color, lineWidth) {
  addRoundRectPath(ctx, x, y, width, height, radius)
  ctx.strokeStyle = color
  ctx.lineWidth = lineWidth
  ctx.stroke()
}

function drawText(ctx, text, x, y, size, color, align) {
  ctx.fillStyle = color
  ctx.font = `normal ${size}px sans-serif`
  ctx.textAlign = align || 'left'
  ctx.textBaseline = 'top'
  ctx.fillText(text, x, y)
}

function setShadow(ctx, offsetX, offsetY, blur, color) {
  ctx.shadowOffsetX = offsetX
  ctx.shadowOffsetY = offsetY
  ctx.shadowBlur = blur
  ctx.shadowColor = color
}

function drawCoverImage(ctx, image, x, y, width, height) {
  const sourceRatio = image.width / image.height
  const targetRatio = width / height
  let drawWidth = width
  let drawHeight = height
  let dx = x
  let dy = y

  if (sourceRatio > targetRatio) {
    drawWidth = height * sourceRatio
    dx = x - (drawWidth - width) / 2
  } else {
    drawHeight = width / sourceRatio
    dy = y - (drawHeight - height) / 2
  }

  ctx.save()
  ctx.beginPath()
  ctx.rect(x, y, width, height)
  ctx.clip()
  ctx.drawImage(image.image, dx, dy, drawWidth, drawHeight)
  ctx.restore()
}

Page({
  data: {
    navStyle: '',
    scrollStyle: '',
    posterBg: POSTER_BG,
    codeImage: '',
    sharePath: '',
    shareImagePath: '',
    posterSaving: false,
    memberPrice: '--',
    memberUid: 'A10293',
    benefits: [
      {
        icon: '/assets/mine/icon-promo-poster.svg',
        title: '3次',
        desc: '直播课'
      },
      {
        icon: '/assets/mine/icon-camp-order.svg',
        title: '21天',
        desc: '打卡陪跑'
      },
      {
        icon: '/assets/mine/icon-member-benefit.svg',
        title: '老师',
        desc: '答疑支持'
      }
    ]
  },

  onLoad(options) {
    this.setNavigationMetrics()
    this.showShareMenu()
    this.memberPlanTask = this.loadMemberPlan()

    if (options && options.uid) {
      this.setData({ memberUid: options.uid })
    }

    if (options && options.codeUrl) {
      const codeImage = decodeURIComponent(options.codeUrl)
      this.setData({ codeImage })
    }

    if (options && options.sharePath) {
      this.setData({ sharePath: decodeURIComponent(options.sharePath) })
    }
  },

  loadMemberPlan() {
    return getMemberPlans()
      .then((response) => {
        const plans = Array.isArray(response.data) ? response.data : []
        const plan = plans.find((item) => item && !item.isFree && item.mcId)
        if (!plan || !plan.price) {
          throw new Error('会员价格暂未配置')
        }

        this.setData({ memberPrice: String(plan.price) })
      })
      .catch((error) => {
        console.warn('[promo-poster] load member price failed:', error)
        this.setData({ memberPrice: '--' })
      })
  },

  showShareMenu() {
    if (!wx.showShareMenu) {
      return
    }

    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    })
  },

  onReady() {
    Promise.resolve(this.memberPlanTask).then(() => {
      if (this.data.memberPrice === '--') return
      setTimeout(() => {
        this.preparePosterImage()
      }, 300)
    })
  },

  setNavigationMetrics() {
    const fallbackNavHeight = 88
    try {
      const windowInfo = wx.getWindowInfo ? wx.getWindowInfo() : wx.getSystemInfoSync()
      const menu = wx.getMenuButtonBoundingClientRect()
      const navHeight = menu.bottom + 12
      const rightPadding = Math.max(windowInfo.windowWidth - menu.left + 12, 96)

      this.setData({
        navStyle: `height:${navHeight}px;padding-top:${menu.top}px;padding-right:${rightPadding}px;`,
        scrollStyle: `height:calc(100vh - ${navHeight}px);`
      })
    } catch (error) {
      this.setData({
        navStyle: `height:${fallbackNavHeight}px;padding-top:44px;padding-right:110px;`,
        scrollStyle: `height:calc(100vh - ${fallbackNavHeight}px);`
      })
    }
  },

  onBackTap() {
    wx.navigateBack({
      fail: () => {
        wx.redirectTo({ url: '/pages/mine/mine' })
      }
    })
  },

  onSaveTap() {
    if (this.data.posterSaving) {
      return
    }

    if (this.data.memberPrice === '--') {
      wx.showToast({
        title: '价格加载失败，请稍后重试',
        icon: 'none'
      })
      this.memberPlanTask = this.loadMemberPlan()
      return
    }

    this.setData({ posterSaving: true })
    wx.showLoading({ title: '生成海报中' })

    this.createPosterImage(true)
      .then((filePath) => this.savePosterToAlbum(filePath))
      .catch((error) => {
        console.error('[promo-poster] create poster failed:', error)
        wx.hideLoading()
        wx.showToast({
          title: '海报生成失败',
          icon: 'none'
        })
      })
      .then(() => {
        this.setData({ posterSaving: false })
      })
  },

  preparePosterImage() {
    this.createPosterImage(false).catch((error) => {
      console.warn('[promo-poster] prepare share image failed:', error)
    })
  },

  createPosterImage(force) {
    if (!force && this.data.shareImagePath) {
      return Promise.resolve(this.data.shareImagePath)
    }

    if (!this.data.codeImage) {
      return Promise.reject(new Error('missing mini program code image'))
    }

    return getCanvasNode(this).then((canvas) => Promise.all([
      loadCanvasImage(canvas, POSTER_BG_CANVAS_SOURCES, 1024, 1792),
      loadCanvasImage(canvas, this.data.codeImage, 220, 220)
    ]).then(([posterBg, codeImage]) => new Promise((resolve, reject) => {
      canvas.width = CANVAS_WIDTH * CANVAS_PIXEL_RATIO
      canvas.height = CANVAS_HEIGHT * CANVAS_PIXEL_RATIO

      const ctx = canvas.getContext('2d')
      ctx.save()
      ctx.scale(CANVAS_PIXEL_RATIO, CANVAS_PIXEL_RATIO)
      this.drawPosterCanvas(ctx, posterBg, codeImage)
      ctx.restore()

      setTimeout(() => {
        wx.canvasToTempFilePath({
          canvas,
          width: CANVAS_WIDTH,
          height: CANVAS_HEIGHT,
          destWidth: CANVAS_WIDTH * CANVAS_PIXEL_RATIO,
          destHeight: CANVAS_HEIGHT * CANVAS_PIXEL_RATIO,
          fileType: 'png',
          quality: 1,
          success: (result) => {
            this.setData({ shareImagePath: result.tempFilePath })
            resolve(result.tempFilePath)
          },
          fail: (error) => {
            console.error('[promo-poster] canvasToTempFilePath failed:', error)
            reject(error)
          }
        })
      })
    })))
  },

  drawPosterCanvas(ctx, posterBg, codeImage) {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
    ctx.fillStyle = '#fbfdf8'
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
    drawCoverImage(ctx, posterBg, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    fillRoundRect(ctx, 34, 42, 172, 44, 22, 'rgba(255, 250, 240, 0.92)')
    strokeRoundRect(ctx, 34, 42, 172, 44, 22, 'rgba(201, 154, 67, 0.32)', 1)
    drawText(ctx, '会员专属邀请', 56, 53, 22, '#9a6f22')

    drawText(ctx, '21天自主学习训练营', 34, 114, 54, '#183327')
    drawText(ctx, '让孩子从被催着学，到主动会学', 34, 198, 34, '#245c4a')
    drawText(ctx, '直播课 + 打卡陪跑 + 答疑服务', 34, 254, 25, '#647168')

    this.drawBenefitPanel(ctx)
    this.drawPriceCard(ctx)
    this.drawReferralPanel(ctx, codeImage)
  },

  drawBenefitPanel(ctx) {
    const x = 34
    const y = 574
    const width = 602
    const height = 104
    const itemWidth = width / 3
    const items = this.data.benefits

    setShadow(ctx, 0, 10, 24, 'rgba(47, 107, 67, 0.08)')
    fillRoundRect(ctx, x, y, width, height, 24, 'rgba(255, 255, 255, 0.92)')
    setShadow(ctx, 0, 0, 0, 'rgba(0, 0, 0, 0)')
    strokeRoundRect(ctx, x, y, width, height, 24, 'rgba(47, 107, 67, 0.1)', 1)

    items.forEach((item, index) => {
      const startX = x + itemWidth * index
      if (index > 0) {
        ctx.strokeStyle = 'rgba(47, 107, 67, 0.12)'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(startX, y + 22)
        ctx.lineTo(startX, y + height - 22)
        ctx.stroke()
      }

      fillRoundRect(ctx, startX + 22, y + 24, 56, 56, 28, '#eef5e8')
      drawText(ctx, item.title, startX + 92, y + 24, 27, '#245c4a')
      drawText(ctx, item.desc, startX + 92, y + 58, 23, '#245c4a')
    })
  },

  drawPriceCard(ctx) {
    const x = 34
    const y = 702
    const width = 602
    const height = 144

    setShadow(ctx, 0, 12, 26, 'rgba(25, 84, 56, 0.16)')
    fillRoundRect(ctx, x, y, width, height, 24, '#23613f')
    setShadow(ctx, 0, 0, 0, 'rgba(0, 0, 0, 0)')
    strokeRoundRect(ctx, x, y, width, height, 24, 'rgba(221, 184, 99, 0.72)', 2)

    drawText(ctx, '特惠报名价', x + 28, y + 28, 24, 'rgba(255, 239, 189, 0.95)')
    const priceText = this.data.memberPrice
    const priceSize = priceText.length >= 5 ? 44 : (priceText.length === 4 ? 52 : 62)
    drawText(ctx, priceText, x + 28, y + 58, priceSize, '#ffd682')
    const priceWidth = ctx.measureText(priceText).width
    drawText(ctx, '元', x + 36 + priceWidth, y + 86, 26, '#fff6d4')

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(x + 218, y + 26)
    ctx.lineTo(x + 218, y + height - 26)
    ctx.stroke()

    drawText(ctx, '科学方法，培养自主学习力', x + 252, y + 38, 24, '#fff8dc')
    drawText(ctx, '家长省心，孩子更有成长力', x + 252, y + 82, 24, '#fff8dc')
  },

  drawReferralPanel(ctx, codeImage) {
    const x = 34
    const y = 870
    const width = 602
    const height = 190

    setShadow(ctx, 0, 10, 24, 'rgba(47, 107, 67, 0.08)')
    fillRoundRect(ctx, x, y, width, height, 24, 'rgba(255, 255, 255, 0.92)')
    setShadow(ctx, 0, 0, 0, 'rgba(0, 0, 0, 0)')

    drawText(ctx, `推荐人 UID：${this.data.memberUid}`, x + 28, y + 48, 30, '#1f2a24')
    drawText(ctx, '好友报名后，您可获得推广奖励', x + 28, y + 94, 22, '#6e7a72')

    fillRoundRect(ctx, x + width - 178, y + 22, 150, 148, 22, '#ffffff')
    ctx.drawImage(codeImage.image, x + width - 158, y + 36, 110, 110)
    drawText(ctx, '扫码报名', x + width - 140, y + 148, 22, '#1f2a24')
  },

  savePosterToAlbum(filePath) {
    return new Promise((resolve) => {
      wx.saveImageToPhotosAlbum({
        filePath,
        success: () => {
          wx.hideLoading()
          wx.showToast({
            title: '已保存到相册',
            icon: 'success'
          })
          resolve()
        },
        fail: (error) => {
          console.error('[promo-poster] saveImageToPhotosAlbum failed:', error)
          wx.hideLoading()
          this.handleSaveImageFail(error)
          resolve()
        }
      })
    })
  },

  handleSaveImageFail(error) {
    const message = error && error.errMsg ? error.errMsg : ''
    const denied = message.indexOf('auth deny') >= 0 || message.indexOf('authorize no response') >= 0

    if (!denied) {
      wx.showToast({
        title: '保存失败，请重试',
        icon: 'none'
      })
      return
    }

    wx.showModal({
      title: '需要相册权限',
      content: '请允许保存图片到相册后，再保存推广海报。',
      confirmText: '去设置',
      success: (result) => {
        if (result.confirm) {
          wx.openSetting()
        }
      }
    })
  },

  onShareAppMessage() {
    return {
      title: '21天自主学习训练营',
      path: this.data.sharePath || `/pages/home/home?ref=${encodeURIComponent(this.data.memberUid)}`,
      imageUrl: this.data.shareImagePath || this.data.posterBg
    }
  },

  onShareTimeline() {
    return {
      title: '21天自主学习训练营',
      query: `ref=${encodeURIComponent(this.data.memberUid)}`,
      imageUrl: this.data.shareImagePath || this.data.posterBg
    }
  }
})
