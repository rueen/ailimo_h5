/**
 * 公司信息相关 API
 */

import request from '@/utils/request'

/**
 * 获取公司信息
 * @returns {Promise}
 */
export function getCompanyInfo() {
  return request({
    url: '/h5/company-info',
    method: 'get'
  })
}
