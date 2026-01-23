/**
 * 剪贴板工具方法
 */

import { showToast } from 'vant'

/**
 * 复制文本到剪贴板
 * @param {string} text - 要复制的文本
 * @param {object} options - 配置选项
 * @param {string} options.successMessage - 复制成功提示信息，默认为 '已复制'
 * @param {string} options.errorMessage - 复制失败提示信息，默认为 '复制失败，请手动复制'
 * @returns {Promise<boolean>} 是否复制成功
 */
export async function copyToClipboard(text, options = {}) {
  const { 
    successMessage = '已复制',
    errorMessage = '复制失败，请手动复制'
  } = options

  if (!text) {
    showToast('复制内容为空')
    return false
  }

  try {
    // 优先使用 Clipboard API（现代浏览器）
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text)
      showToast(successMessage)
      return true
    } else {
      // 降级方案：使用传统方法（兼容旧浏览器）
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.top = '0'
      textArea.style.left = '0'
      textArea.style.width = '2em'
      textArea.style.height = '2em'
      textArea.style.padding = '0'
      textArea.style.border = 'none'
      textArea.style.outline = 'none'
      textArea.style.boxShadow = 'none'
      textArea.style.background = 'transparent'
      textArea.style.opacity = '0'
      
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      
      try {
        const successful = document.execCommand('copy')
        document.body.removeChild(textArea)
        
        if (successful) {
          showToast(successMessage)
          return true
        } else {
          showToast(errorMessage)
          return false
        }
      } catch (err) {
        document.body.removeChild(textArea)
        showToast(errorMessage)
        return false
      }
    }
  } catch (error) {
    console.error('复制失败:', error)
    showToast(errorMessage)
    return false
  }
}
