/**
 * 时间段处理工具函数
 */

/**
 * 将时间段数组按日期分组
 * @param {Array<string>} timeSlots - 格式：["2026-01-10 09:00-10:00", ...]
 * @returns {Object} - 格式：{ "2026-01-10": ["09:00-10:00", ...], ... }
 */
export function groupTimeSlotsByDate(timeSlots) {
  if (!Array.isArray(timeSlots) || timeSlots.length === 0) {
    return {}
  }
  
  const grouped = {}
  timeSlots.forEach(slot => {
    const parts = slot.split(' ')
    if (parts.length === 2) {
      const [date, time] = parts
      if (!grouped[date]) {
        grouped[date] = []
      }
      grouped[date].push(time)
    }
  })
  return grouped
}

/**
 * 将日期分组的时间段转换为数组格式
 * @param {Object} groupedSlots - 格式：{ "2026-01-10": [slot1, slot2], ... }
 * @returns {Array<string>} - 格式：["2026-01-10 09:00-10:00", ...]
 */
export function flattenTimeSlots(groupedSlots) {
  if (!groupedSlots || typeof groupedSlots !== 'object') {
    return []
  }
  
  const flattened = []
  Object.keys(groupedSlots).forEach(date => {
    if (Array.isArray(groupedSlots[date])) {
      groupedSlots[date].forEach(slot => {
        // slot 可能是对象（包含 display_time 属性）或字符串
        const time = typeof slot === 'object' ? slot.display_time : slot
        flattened.push(`${date} ${time}`)
      })
    }
  })
  return flattened.sort()
}

/**
 * 从时间段数组中提取所有日期
 * @param {Array<string>} timeSlots - 格式：["2026-01-10 09:00-10:00", ...]
 * @returns {Array<string>} - 格式：["2026-01-10", "2026-01-11", ...]
 */
export function extractDatesFromSlots(timeSlots) {
  if (!Array.isArray(timeSlots) || timeSlots.length === 0) {
    return []
  }
  
  const dates = new Set()
  timeSlots.forEach(slot => {
    const parts = slot.split(' ')
    if (parts.length === 2) {
      dates.add(parts[0])
    }
  })
  return Array.from(dates).sort()
}

/**
 * 格式化时间段显示（用于订单详情）
 * @param {Array<string>} timeSlots - 格式：["2026-01-10 09:00-10:00", ...]
 * @returns {string} - 格式：2026-01-10: 09:00-10:00, 10:00-11:00 | 2026-01-11: 09:00-10:00
 */
export function formatTimeSlotsDisplay(timeSlots) {
  if (!Array.isArray(timeSlots) || timeSlots.length === 0) {
    return '-'
  }
  
  const grouped = groupTimeSlotsByDate(timeSlots)
  return Object.keys(grouped)
    .sort()
    .map(date => `${date}: ${grouped[date].join('、')}`)
    .join('\n')
}

/**
 * 格式化时间段显示（用于确认对话框）
 * @param {Object} groupedSlots - 格式：{ "2026-01-10": [slot1, slot2], ... }
 * @returns {string} - 格式化的文本
 */
export function formatSlotsForConfirm(groupedSlots) {
  if (!groupedSlots || typeof groupedSlots !== 'object') {
    return ''
  }
  
  const dates = Object.keys(groupedSlots).sort()
  if (dates.length === 0) {
    return ''
  }
  
  let totalSlots = 0
  const lines = dates.map(date => {
    const slots = groupedSlots[date]
    totalSlots += slots.length
    const times = slots.map(slot => `  ${slot.display_time || slot}`).join('\n')
    return `${date}\n${times}`
  })
  
  return `${lines.join('\n\n')}\n\n共 ${dates.length} 天，${totalSlots} 个时间段`
}

/**
 * 获取日期范围显示文本（用于订单列表）
 * @param {Array<string>} timeSlots - 格式：["2026-01-10 09:00-10:00", ...]
 * @returns {string} - 格式：2026-01-10 或 2026-01-10 等2天
 */
export function getDateRangeText(timeSlots) {
  if (!Array.isArray(timeSlots) || timeSlots.length === 0) {
    return '-'
  }
  
  const dates = extractDatesFromSlots(timeSlots)
  if (dates.length === 0) {
    return '-'
  }
  
  if (dates.length === 1) {
    return dates[0]
  }
  
  return `${dates[0]} 等${dates.length}天`
}

/**
 * 从 time_slots 中提取第一个日期
 * @param {Array<string>} timeSlots - 格式：["2026-01-10 09:00-10:00", ...]
 * @returns {string} - 日期字符串
 */
export function getFirstDate(timeSlots) {
  if (!Array.isArray(timeSlots) || timeSlots.length === 0) {
    return '-'
  }
  
  const parts = timeSlots[0].split(' ')
  return parts.length === 2 ? parts[0] : '-'
}

/**
 * 计算两个日期之间的天数
 * @param {string} startDate - 开始日期，格式：YYYY-MM-DD
 * @param {string} endDate - 结束日期，格式：YYYY-MM-DD
 * @returns {number} - 天数（包含开始和结束日期）
 */
export function calculateDaysBetween(startDate, endDate) {
  if (!startDate || !endDate) {
    return 0
  }
  
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffTime = Math.abs(end - start)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  return diffDays + 1 // 包含开始和结束日期
}

/**
 * 格式化日期范围显示（用于笼位预约订单列表）
 * @param {string} startDate - 开始日期，格式：YYYY-MM-DD
 * @param {string|null} endDate - 结束日期，格式：YYYY-MM-DD，null表示长期预约
 * @returns {string} - 格式化后的文本
 */
export function formatDateRange(startDate, endDate) {
  if (!startDate) {
    return '-'
  }
  
  // 长期预约
  if (!endDate || endDate === null) {
    return `${startDate} 至 长期`
  }
  
  // 计算天数
  const days = calculateDaysBetween(startDate, endDate)
  
  return `${startDate} - ${endDate} (${days}天)`
}

/**
 * 获取预约期限文本（用于订单详情）
 * @param {string} startDate - 开始日期，格式：YYYY-MM-DD
 * @param {string|null} endDate - 结束日期，格式：YYYY-MM-DD，null表示长期预约
 * @returns {string} - 预约期限文本
 */
export function getReservationPeriod(startDate, endDate) {
  if (!startDate) {
    return '-'
  }
  
  // 长期预约
  if (!endDate || endDate === null) {
    return '长期预约'
  }
  
  // 单日预约
  if (startDate === endDate) {
    return '单日预约'
  }
  
  // 计算天数
  const days = calculateDaysBetween(startDate, endDate)
  
  return `${days}天`
}
