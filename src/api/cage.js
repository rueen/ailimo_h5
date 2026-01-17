/**
 * 笼位租赁相关 API
 */

import request from '@/utils/request'

/**
 * 根据动物类型获取环境类型选项
 * @param {object} params - 查询参数
 * @param {number} params.animal_type_id - 动物类型ID
 * @returns {Promise}
 */
export function getEnvironmentsByAnimalType(params) {
  return request({
    url: '/h5/cages/environments-by-animal-type',
    method: 'get',
    params
  })
}

/**
 * 查询笼位可用时间段
 * @param {object} params - 查询参数
 * @param {number} params.animal_type_id - 动物类型ID
 * @param {number} params.environment_id - 环境ID
 * @param {string} params.date - 查询日期
 * @returns {Promise}
 */
export function getCageAvailableTimeSlots(params) {
  return request({
    url: '/h5/cages/available-time-slots',
    method: 'get',
    params
  })
}

/**
 * 获取笼位租赁时间段列表
 * @returns {Promise}
 */
export function getCageTimeSlots() {
  return request({
    url: '/h5/cage-time-slots',
    method: 'get'
  })
}

/**
 * 提交笼位租赁订单
 * @param {object} data - 订单数据
 * @returns {Promise}
 */
export function createCageOrder(data) {
  return request({
    url: '/h5/cage-orders',
    method: 'post',
    data
  })
}
