/**
 * 其他服务相关 API
 */

import request from '@/utils/request'

/**
 * 获取其他服务列表
 * @param {object} params - 查询参数
 * @param {number} params.page - 页码，默认1
 * @param {number} params.page_size - 每页数量，默认10
 * @returns {Promise}
 */
export function getOtherServices(params) {
  return request({
    url: '/h5/other-services',
    method: 'get',
    params
  })
}

/**
 * 获取其他服务详情
 * @param {number} id - 服务ID
 * @returns {Promise}
 */
export function getOtherServiceDetail(id) {
  return request({
    url: `/h5/other-services/${id}`,
    method: 'get'
  })
}
