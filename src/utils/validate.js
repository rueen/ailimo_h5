/**
 * 工具函数 - 验证相关
 */

/**
 * 验证手机号
 * @param {string} phone - 手机号
 * @returns {boolean} 是否有效
 */
export function validatePhone(phone) {
  return /^1[3-9]\d{9}$/.test(phone)
}

/**
 * 验证验证码
 * @param {string} code - 验证码
 * @returns {boolean} 是否有效
 */
export function validateCode(code) {
  return /^\d{6}$/.test(code)
}

/**
 * 验证邮箱
 * @param {string} email - 邮箱
 * @returns {boolean} 是否有效
 */
export function validateEmail(email) {
  return /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)
}

/**
 * 验证日期格式 YYYY-MM-DD
 * @param {string} date - 日期字符串
 * @returns {boolean} 是否有效
 */
export function validateDate(date) {
  return /^\d{4}-\d{2}-\d{2}$/.test(date)
}

/**
 * 验证时间格式 HH:mm
 * @param {string} time - 时间字符串
 * @returns {boolean} 是否有效
 */
export function validateTime(time) {
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(time)
}

/**
 * 验证必填项
 * @param {any} value - 值
 * @returns {boolean} 是否有效
 */
export function validateRequired(value) {
  if (value === null || value === undefined) return false
  if (typeof value === 'string') return value.trim().length > 0
  if (Array.isArray(value)) return value.length > 0
  return true
}
