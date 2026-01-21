/**
 * 通用配置相关 API
 */

import request from '@/utils/request'

/**
 * 获取地区列表
 * @param {object} params - 查询参数
 * @param {number} params.parent_id - 父级地区ID
 * @param {number} params.level - 地区层级：1-省 2-市 3-区
 * @returns {Promise}
 */
export function getRegions(params) {
  return request({
    url: '/h5/regions',
    method: 'get',
    params
  })
}

/**
 * 获取单个地区详情
 * @param {number} id - 地区ID
 * @returns {Promise}
 */
export function getRegionDetail(id) {
  return request({
    url: `/h5/regions/${id}`,
    method: 'get'
  })
}

/**
 * 获取组织机构列表
 * @returns {Promise}
 */
export function getOrganizations() {
  return request({
    url: '/h5/organizations',
    method: 'get'
  })
}

/**
 * 根据组织机构获取学院列表
 * @param {object} params - 查询参数
 * @param {number} params.organization_id - 组织机构ID
 * @returns {Promise}
 */
export function getDepartments(params) {
  return request({
    url: '/h5/departments',
    method: 'get',
    params
  })
}

/**
 * 根据学院获取课题组列表
 * @param {object} params - 查询参数
 * @param {number} params.department_id - 学院ID
 * @returns {Promise}
 */
export function getResearchGroups(params) {
  return request({
    url: '/h5/research-groups',
    method: 'get',
    params
  })
}

/**
 * 获取环境类型列表
 * @returns {Promise}
 */
export function getEnvironmentTypes() {
  return request({
    url: '/h5/environment-types',
    method: 'get'
  })
}

/**
 * 获取动物类型列表
 * @returns {Promise}
 */
export function getAnimalTypes() {
  return request({
    url: '/h5/animal-types',
    method: 'get'
  })
}

/**
 * 获取笼位用途列表
 * @returns {Promise}
 */
export function getCagePurposes() {
  return request({
    url: '/h5/cage-purposes',
    method: 'get'
  })
}

/**
 * 获取操作内容列表
 * @returns {Promise}
 */
export function getOperationContents() {
  return request({
    url: '/h5/operation-contents',
    method: 'get'
  })
}

/**
 * 获取动物品牌列表
 * @returns {Promise}
 */
export function getAnimalBrands() {
  return request({
    url: '/h5/animal-brands',
    method: 'get'
  })
}

/**
 * 根据品牌获取动物种类/品系列表
 * @param {object} params - 查询参数
 * @param {number} params.brand_id - 品牌ID
 * @returns {Promise}
 */
export function getAnimalVarieties(params) {
  return request({
    url: '/h5/animal-varieties',
    method: 'get',
    params
  })
}

/**
 * 获取动物规格列表
 * @returns {Promise}
 */
export function getAnimalSpecifications() {
  return request({
    url: '/h5/animal-specifications',
    method: 'get'
  })
}

/**
 * 获取动物要求列表
 * @returns {Promise}
 */
export function getAnimalRequirements() {
  return request({
    url: '/h5/animal-requirements',
    method: 'get'
  })
}

/**
 * 获取试剂耗材品牌列表
 * @returns {Promise}
 */
export function getReagentBrands() {
  return request({
    url: '/h5/reagent-brands',
    method: 'get'
  })
}

/**
 * 获取试剂耗材规格列表
 * @returns {Promise}
 */
export function getReagentSpecifications() {
  return request({
    url: '/h5/reagent-specifications',
    method: 'get'
  })
}

/**
 * 获取提前预约天数配置
 * @returns {Promise}
 */
export function getAdvanceDays() {
  return request({
    url: '/h5/advance-days',
    method: 'get'
  })
}
