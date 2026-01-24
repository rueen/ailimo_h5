/**
 * 微信 JSSDK 工具类
 */

import axios from 'axios'

/**
 * 判断是否在微信浏览器中
 * @returns {boolean}
 */
export function isWechat() {
  const ua = navigator.userAgent.toLowerCase()
  return /micromessenger/.test(ua)
}

/**
 * 获取微信 JSSDK 配置
 * @param {string} url - 当前页面完整 URL
 * @returns {Promise<object>} 配置对象
 */
async function getWechatConfig(url) {
  try {
    const response = await axios.get('/api/h5/wechat-js-config', {
      params: { url }
    })
    return response.data
  } catch (error) {
    console.error('获取微信配置失败:', error)
    throw error
  }
}

/**
 * 初始化微信 JSSDK
 * @param {object} options - 配置选项
 * @param {string} options.title - 分享标题
 * @param {string} options.desc - 分享描述
 * @param {string} options.imgUrl - 分享图片 URL（绝对路径）
 * @param {string} options.link - 分享链接（默认当前页）
 * @param {boolean} options.debug - 是否开启调试模式
 * @returns {Promise<void>}
 */
export async function initWechatShare(options = {}) {
  // 仅在微信浏览器中执行
  if (!isWechat()) {
    console.log('非微信浏览器，跳过分享配置')
    return
  }

  // 确保 wx 对象已加载
  if (typeof wx === 'undefined') {
    console.error('微信 JSSDK 未加载')
    return
  }

  const {
    title = '艾力默用户端',
    desc = '浙江艾力默生物技术有限公司 - 专业的科研服务平台',
    imgUrl = 'https://www.ailimolab.com/share-cover.png',
    link = location.href,
    debug = false
  } = options

  try {
    // 获取当前页面 URL（必须与签名 URL 一致）
    const url = location.href.split('#')[0]

    // 请求微信配置
    const config = await getWechatConfig(url)

    // 配置微信 JSSDK
    wx.config({
      debug,
      appId: config.appId,
      timestamp: config.timestamp,
      nonceStr: config.nonceStr,
      signature: config.signature,
      jsApiList: [
        'updateAppMessageShareData', // 分享给朋友
        'updateTimelineShareData'    // 分享到朋友圈
      ]
    })

    // 配置成功后设置分享内容
    wx.ready(() => {
      // 分享给朋友
      wx.updateAppMessageShareData({
        title,
        desc,
        link,
        imgUrl,
        success: () => {
          console.log('分享给朋友配置成功')
        },
        fail: (err) => {
          console.error('分享给朋友配置失败:', err)
        }
      })

      // 分享到朋友圈
      wx.updateTimelineShareData({
        title,
        link,
        imgUrl,
        success: () => {
          console.log('分享到朋友圈配置成功')
        },
        fail: (err) => {
          console.error('分享到朋友圈配置失败:', err)
        }
      })
    })

    // 配置失败处理
    wx.error((res) => {
      console.error('微信 JSSDK 配置失败:', res)
    })
  } catch (error) {
    console.error('初始化微信分享失败:', error)
  }
}

/**
 * 更新分享内容（在已配置的基础上更新）
 * @param {object} options - 分享配置
 */
export function updateWechatShare(options = {}) {
  if (!isWechat() || typeof wx === 'undefined') {
    return
  }

  const {
    title = '艾力默用户端',
    desc = '浙江艾力默生物技术有限公司 - 专业的科研服务平台',
    imgUrl = 'https://www.ailimolab.com/share-cover.png',
    link = location.href
  } = options

  wx.ready(() => {
    wx.updateAppMessageShareData({ title, desc, link, imgUrl })
    wx.updateTimelineShareData({ title, link, imgUrl })
  })
}
