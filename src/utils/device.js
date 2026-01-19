/**
 * 设备检测工具
 */

/**
 * 检测是否为移动设备
 * @returns {boolean} 是否为移动设备
 */
export function isMobile() {
  // 通过 userAgent 检测
  const ua = navigator.userAgent.toLowerCase()
  const mobileKeywords = [
    'mobile',
    'android',
    'iphone',
    'ipad',
    'ipod',
    'blackberry',
    'windows phone',
    'symbian',
    'webos'
  ]
  
  const isMobileUA = mobileKeywords.some(keyword => ua.includes(keyword))
  
  // 通过屏幕宽度检测（小于768px认为是移动设备）
  const isMobileWidth = window.innerWidth < 768
  
  // 通过触摸事件检测
  const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0
  
  // 综合判断：UA检测 或 （窄屏幕 且 支持触摸）
  return isMobileUA || (isMobileWidth && hasTouch)
}

/**
 * 检测是否为PC设备
 * @returns {boolean} 是否为PC设备
 */
export function isPC() {
  return !isMobile()
}

/**
 * 获取设备类型
 * @returns {'mobile'|'pc'} 设备类型
 */
export function getDeviceType() {
  return isMobile() ? 'mobile' : 'pc'
}
