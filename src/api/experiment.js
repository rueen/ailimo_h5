/**
 * 实验代操作相关 API
 */

import request from '@/utils/request'

/**
 * 获取实验代操作时间段列表
 * @returns {Promise}
 */
export function getExperimentTimeSlots() {
  return request({
    url: '/h5/experiment-time-slots',
    method: 'get'
  })
}

/**
 * 提交实验代操作订单
 * @param {object} data - 订单数据
 * @returns {Promise}
 */
export function createExperimentOrder(data) {
  return request({
    url: '/h5/experiment-orders',
    method: 'post',
    data
  })
}
