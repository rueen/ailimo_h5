/**
 * 用户认证相关 API
 */

import request from '@/utils/request'

/**
 * 发送验证码
 * @param {object} data - 请求数据
 * @param {string} data.phone - 手机号
 * @param {number} data.type - 类型：1-登录 2-注册
 * @returns {Promise}
 */
export function sendCode(data) {
  return request({
    url: '/h5/auth/send-code',
    method: 'post',
    data
  })
}

/**
 * 用户注册
 * @param {object} data - 注册数据
 * @returns {Promise}
 */
export function register(data) {
  return request({
    url: '/h5/auth/register',
    method: 'post',
    data
  })
}

/**
 * 用户登录
 * @param {object} data - 登录数据
 * @param {string} data.phone - 手机号
 * @param {string} data.code - 验证码
 * @returns {Promise}
 */
export function login(data) {
  return request({
    url: '/h5/auth/login',
    method: 'post',
    data
  })
}

/**
 * 获取个人信息
 * @returns {Promise}
 */
export function getProfile() {
  return request({
    url: '/h5/auth/profile',
    method: 'get'
  })
}

/**
 * 退出登录
 * @returns {Promise}
 */
export function logout() {
  return request({
    url: '/h5/auth/logout',
    method: 'post'
  })
}
