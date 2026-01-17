/**
 * 订单管理相关 API
 */

import request from '@/utils/request'

/**
 * 获取我的所有订单
 * @param {object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.page_size - 每页数量
 * @param {string} params.type - 订单类型
 * @param {number} params.status - 状态
 * @param {string} params.start_date - 开始日期
 * @param {string} params.end_date - 结束日期
 * @returns {Promise}
 */
export function getMyOrders(params) {
  return request({
    url: '/h5/my-orders',
    method: 'get',
    params
  })
}

/**
 * 获取我的订单详情
 * @param {string} type - 订单类型
 * @param {number} id - 订单ID
 * @returns {Promise}
 */
export function getMyOrderDetail(type, id) {
  return request({
    url: `/h5/my-orders/${type}/${id}`,
    method: 'get'
  })
}
