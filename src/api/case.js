/**
 * 案例管理相关 API
 */

import request from '@/utils/request'

/**
 * 获取案例列表
 * @param {object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.page_size - 每页数量
 * @param {string} params.project_name - 项目名称（可选）
 * @param {string} params.project_summary - 项目概述（可选）
 * @returns {Promise}
 */
export function getCaseList(params) {
  return request({
    url: '/h5/cases',
    method: 'get',
    params
  })
}

/**
 * 获取案例详情
 * @param {number} id - 案例ID
 * @returns {Promise}
 */
export function getCaseDetail(id) {
  return request({
    url: `/h5/cases/${id}`,
    method: 'get'
  })
}
