const DEFAULT_AVATAR = '/assets/mine/default-wechat-avatar.svg'
const { getMiniappProfile, saveMiniappProfile } = require('../../../../api/mine')
const { USER_KEY } = require('../../../../utils/request')
const {
  validateAvatarImage,
  uploadAvatarToCloud,
  removeCloudAvatar
} = require('../../utils/profile-avatar')

Page({
  data: {
    loading: true,
    submitting: false,
    profile: {
      nickname: '',
      phone: '',
      avatarUrl: DEFAULT_AVATAR,
      originalAvatar: '',
      avatarChanged: false
    }
  },

  onLoad() {
    const cachedUser = wx.getStorageSync(USER_KEY) || {}
    this.applyProfile(cachedUser, false)
    this.loadProfile()
  },

  applyProfile(user, avatarChanged) {
    const storedNickname = String((user && user.nickname) || '').trim()
    this.setData({
      profile: {
        nickname: /^wx\d{6}$/i.test(storedNickname) ? '' : storedNickname,
        phone: String((user && user.phone) || ''),
        avatarUrl: String((user && user.avatar) || '') || DEFAULT_AVATAR,
        originalAvatar: String((user && user.avatar) || ''),
        avatarChanged: !!avatarChanged
      }
    })
  },

  loadProfile() {
    this.setData({ loading: true })
    getMiniappProfile()
      .then((response) => {
        const user = (response && response.data) || {}
        wx.setStorageSync(USER_KEY, user)
        this.applyProfile(user, false)
      })
      .catch((error) => {
        wx.showToast({
          title: (error && error.message) || '个人资料加载失败',
          icon: 'none'
        })
      })
      .finally(() => {
        this.setData({ loading: false })
      })
  },

  onProfileInput(e) {
    const field = e.currentTarget.dataset.field
    if (!field) return
    this.setData({
      [`profile.${field}`]: e.detail.value
    })
  },

  onChooseAvatar(e) {
    const avatarUrl = e.detail && e.detail.avatarUrl
    if (!avatarUrl) return

    validateAvatarImage(avatarUrl)
      .then(() => {
        this.setData({
          'profile.avatarUrl': avatarUrl,
          'profile.avatarChanged': true
        })
      })
      .catch((error) => {
        wx.showToast({
          title: (error && error.message) || '头像图片无效',
          icon: 'none'
        })
      })
  },

  onAvatarError() {
    if (this.data.profile.avatarChanged) return
    this.setData({ 'profile.avatarUrl': DEFAULT_AVATAR })
  },

  uploadSelectedAvatar() {
    const profile = this.data.profile || {}
    if (!profile.avatarChanged || !profile.avatarUrl) {
      return Promise.resolve('')
    }
    return uploadAvatarToCloud(profile.avatarUrl)
  },

  onSaveTap() {
    if (this.data.submitting || this.data.loading) return

    const profile = this.data.profile || {}
    const nickname = String(profile.nickname || '').trim()
    const phone = String(profile.phone || '').replace(/\s+/g, '')

    if (!nickname) {
      wx.showToast({ title: '请填写昵称', icon: 'none' })
      return
    }
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      wx.showToast({ title: '请填写真实有效的11位手机号', icon: 'none' })
      return
    }

    this.setData({ submitting: true })
    wx.showLoading({ title: '保存中' })

    let uploadedAvatar = ''
    const originalAvatar = String(profile.originalAvatar || '')

    this.uploadSelectedAvatar()
      .then((avatarFileId) => {
        uploadedAvatar = avatarFileId
        return saveMiniappProfile({
          nickname,
          phone,
          avatar_file_id: avatarFileId
        })
      })
      .then((response) => {
        const user = (response && response.data) || {}
        wx.setStorageSync(USER_KEY, user)
        this.applyProfile(user, false)
        if (uploadedAvatar && originalAvatar && originalAvatar !== uploadedAvatar) {
          removeCloudAvatar(originalAvatar)
        }
        wx.showToast({ title: '个人资料已更新', icon: 'success' })
      })
      .catch((error) => {
        if (uploadedAvatar) {
          removeCloudAvatar(uploadedAvatar)
        }
        wx.showToast({
          title: (error && error.message) || '个人资料保存失败',
          icon: 'none'
        })
      })
      .finally(() => {
        wx.hideLoading()
        this.setData({ submitting: false })
      })
  }
})
