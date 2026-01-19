/**
 * 设备预约相关 API
 */

import request from '@/utils/request'

/**
 * 获取设备列表
 * @param {object} params - 查询参数
 * @param {string} params.name - 设备名称（可选）
 * @returns {Promise}
 */
export function getEquipmentList(params) {
  return request({
    url: '/h5/equipment',
    method: 'get',
    params
  })
}

/**
 * 获取设备详情
 * @param {number} id - 设备ID
 * @returns {Promise}
 */
export function getEquipmentDetail(id) {
  return request({
    url: `/h5/equipment/${id}`,
    method: 'get'
  })
}

/**
 * 查询设备可用时间段
 * @param {number} id - 设备ID
 * @param {object} params - 查询参数
 * @param {string} params.date - 查询日期
 * @returns {Promise}
 */
export function getEquipmentAvailableSlots(id, params) {
  return request({
    url: `/h5/equipment/${id}/available-slots`,
    method: 'get',
    params
  })
}

/**
 * 获取设备预约时间段列表
 * @returns {Promise}
 */
export function getEquipmentTimeSlots() {
  return request({
    url: '/h5/equipment-time-slots',
    method: 'get'
  })
}

/**
 * 提交设备预约订单
 * @param {object} data - 订单数据
 * @returns {Promise}
 */
export function createEquipmentOrder(data) {
  return request({
    url: '/h5/equipment-orders',
    method: 'post',
    data
  })
}
