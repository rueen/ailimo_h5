/**
 * 公司信息相关 API
 */

import request from '@/utils/request'
import { requestBlob } from '@/utils/request'

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

/**
 * 获取收费标准 xlsx 文件（后端代理 OSS，避免 CORS）
 * 后端需实现 GET /h5/price-list，从公司配置的 price_list URL 拉取 xlsx 并返回二进制
 * @returns {Promise<Blob>}
 */
export function getPriceListFile() {
  return requestBlob({
    url: '/h5/price-list',
    method: 'get'
  })
}
