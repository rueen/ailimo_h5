/**
 * 动物订购相关 API
 */

import request from '@/utils/request'

/**
 * 提交动物订购订单
 * @param {object} data - 订单数据
 * @returns {Promise}
 */
export function createAnimalOrder(data) {
  return request({
    url: '/h5/animal-orders',
    method: 'post',
    data
  })
}
