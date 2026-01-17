/**
 * 试剂耗材订购相关 API
 */

import request from '@/utils/request'

/**
 * 提交试剂耗材订购订单
 * @param {object} data - 订单数据
 * @returns {Promise}
 */
export function createReagentOrder(data) {
  return request({
    url: '/h5/reagent-orders',
    method: 'post',
    data
  })
}
