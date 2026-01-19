/**
 * 工具函数 - 格式化相关
 */

import dayjs from 'dayjs'

/**
 * 格式化日期
 * @param {string|Date} date - 日期
 * @param {string} format - 格式，默认 'YYYY-MM-DD'
 * @returns {string} 格式化后的日期字符串
 */
export function formatDate(date, format = 'YYYY-MM-DD') {
  if (!date) return ''
  return dayjs(date).format(format)
}

/**
 * 格式化日期时间
 * @param {string|Date} datetime - 日期时间
 * @param {string} format - 格式，默认 'YYYY-MM-DD HH:mm:ss'
 * @returns {string} 格式化后的日期时间字符串
 */
export function formatDateTime(datetime, format = 'YYYY-MM-DD HH:mm:ss') {
  if (!datetime) return ''
  return dayjs(datetime).format(format)
}

/**
 * 格式化时间
 * @param {string} time - 时间
 * @param {string} format - 格式，默认 'HH:mm'
 * @returns {string} 格式化后的时间字符串
 */
export function formatTime(time, format = 'HH:mm') {
  if (!time) return ''
  return dayjs(time, 'HH:mm:ss').format(format)
}

/**
 * 格式化手机号（中间4位隐藏）
 * @param {string} phone - 手机号
 * @returns {string} 格式化后的手机号
 */
export function formatPhone(phone) {
  if (!phone) return ''
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}

/**
 * 格式化金额（保留两位小数）
 * @param {number} amount - 金额
 * @returns {string} 格式化后的金额字符串
 */
export function formatMoney(amount) {
  if (amount === null || amount === undefined) return '0.00'
  return Number(amount).toFixed(2)
}

/**
 * 订单状态文本映射（预约类订单）
 */
export const ORDER_STATUS_MAP = {
  0: '待审核',
  1: '进行中',
  2: '已拒绝',
  3: '已完成',
  4: '已取消'
}

/**
 * 订购类订单状态文本映射
 */
export const PURCHASE_STATUS_MAP = {
  0: '待处理',
  1: '进行中',
  2: '已拒绝',
  3: '已完成',
  4: '已取消'
}

/**
 * 用户审核状态文本映射
 */
export const AUDIT_STATUS_MAP = {
  0: '待审核',
  1: '审核通过',
  2: '审核拒绝'
}

/**
 * 性别文本映射
 */
export const GENDER_MAP = {
  0: '雌性',
  1: '雄性',
  2: '不限'
}

/**
 * 获取订单状态文本
 * @param {number} status - 状态值
 * @param {string} type - 订单类型：'rental'(预约类) 或 'purchase'(订购类)
 * @returns {string} 状态文本
 */
export function getOrderStatusText(status, type = 'rental') {
  const map = type === 'purchase' ? PURCHASE_STATUS_MAP : ORDER_STATUS_MAP
  return map[status] || '未知状态'
}

/**
 * 获取审核状态文本
 * @param {number} status - 审核状态值
 * @returns {string} 审核状态文本
 */
export function getAuditStatusText(status) {
  return AUDIT_STATUS_MAP[status] || '未知状态'
}

/**
 * 获取性别文本
 * @param {number} gender - 性别值
 * @returns {string} 性别文本
 */
export function getGenderText(gender) {
  return GENDER_MAP[gender] || '未知'
}
