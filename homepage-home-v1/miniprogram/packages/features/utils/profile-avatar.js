const MAX_AVATAR_BYTES = 1000000
const CLOUD_AVATAR_PREFIX = 'member-avatars'

function detectImageExtension(buffer) {
  const bytes = new Uint8Array(buffer || new ArrayBuffer(0))
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return 'jpg'
  }
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return 'png'
  }
  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return 'webp'
  }
  return ''
}

function validateAvatarImage(filePath) {
  return new Promise((resolve, reject) => {
    if (!filePath) {
      reject(new Error('请选择头像图片'))
      return
    }

    wx.getFileInfo({
      filePath,
      success: (info) => {
        const size = Number(info.size || 0)
        if (!size || size > MAX_AVATAR_BYTES) {
          reject(new Error('头像图片不能超过1MB'))
          return
        }

        wx.getFileSystemManager().readFile({
          filePath,
          success: (result) => {
            const extension = detectImageExtension(result.data)
            if (!extension) {
              reject(new Error('头像仅支持 JPG、PNG 或 WebP 图片'))
              return
            }
            resolve({ extension, size })
          },
          fail: () => reject(new Error('头像文件读取失败，请重新选择'))
        })
      },
      fail: () => reject(new Error('头像文件读取失败，请重新选择'))
    })
  })
}

function buildCloudPath(extension) {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const random = Math.random().toString(36).slice(2, 10)
  return `${CLOUD_AVATAR_PREFIX}/${year}/${month}/${Date.now()}-${random}.${extension}`
}

function uploadAvatarToCloud(filePath) {
  if (!wx.cloud || typeof wx.cloud.uploadFile !== 'function') {
    return Promise.reject(new Error('微信云存储暂不可用'))
  }

  return validateAvatarImage(filePath)
    .then(({ extension }) => wx.cloud.uploadFile({
      cloudPath: buildCloudPath(extension),
      filePath
    }))
    .then((result) => {
      const fileID = String((result && result.fileID) || '')
      if (!isCloudAvatar(fileID)) {
        throw new Error('头像上传结果无效')
      }
      return fileID
    })
}

function isCloudAvatar(fileID) {
  return /^cloud:\/\/[^/]+\/member-avatars\/\d{4}\/\d{2}\/[a-zA-Z0-9-]+\.(jpg|png|webp)$/i.test(String(fileID || ''))
}

function removeCloudAvatar(fileID) {
  if (!isCloudAvatar(fileID) || !wx.cloud || typeof wx.cloud.deleteFile !== 'function') {
    return Promise.resolve()
  }

  return wx.cloud.deleteFile({ fileList: [fileID] }).catch(() => undefined)
}

module.exports = {
  MAX_AVATAR_BYTES,
  validateAvatarImage,
  uploadAvatarToCloud,
  removeCloudAvatar,
  isCloudAvatar
}
