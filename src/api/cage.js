/**
 * 笼位预约相关 API
 */

import request from '@/utils/request'

/**
 * 根据动物类型和环境类型获取房间选项
 * @param {object} params - 查询参数
 * @param {number} params.animal_type_id - 动物类型ID
 * @param {number} params.environment_id - 环境类型ID
 * @returns {Promise<{ id: number, name: string }[]>}
 */
export function getRoomsByAnimalTypeAndEnvironment(params) {
  return request({
    url: '/h5/cages/rooms-by-animal-type-and-environment',
    method: 'get',
    params
  })
}

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
 * 查询笼位剩余可用数量
 * @param {object} params - 查询参数
 * @param {number} params.animal_type_id - 动物类型ID
 * @param {number} params.environment_id - 环境ID
 * @param {string} params.start_date - 开始日期，格式：YYYY-MM-DD
 * @param {string} [params.end_date] - 结束日期，格式：YYYY-MM-DD，不传或传null表示查询长期预约的可用性
 * @param {number} [params.room_id] - 房间ID
 * @param {number} [params.exclude_reservation_id] - 需要排除的订单ID（编辑订单时使用）
 * @returns {Promise}
 */
export function getCageAvailableQuantity(params) {
  return request({
    url: '/h5/cages/available-quantity',
    method: 'get',
    params
  })
}

/**
 * 提交笼位预约订单
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
