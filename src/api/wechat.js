/**
 * 微信相关 API
 */

import request from '@/utils/request'

/**
 * 获取微信 JSSDK 配置
 * @param {string} url - 当前页面完整 URL
 * @returns {Promise}
 */
export function getWechatJsConfig(url) {
  return request({
    url: '/h5/wechat-js-config',
    method: 'get',
    params: { url }
  })
}
