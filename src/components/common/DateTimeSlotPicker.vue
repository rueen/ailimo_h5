<template>
  <div class="date-time-slot-picker">
    <!-- 选择日期 -->
    <div class="date-section">
      <h3 class="section-title">选择日期</h3>
      <div class="date-tabs">
        <div
          v-for="date in availableDates"
          :key="date.value"
          class="date-tab"
          :class="{ 
            active: currentDate === date.value,
            selected: isDateSelected(date.value)
          }"
          @click="handleDateClick(date.value)"
        >
          <div class="date-week">{{ date.week }}</div>
          <div class="date-value">{{ date.display }}</div>
          <van-icon v-if="isDateSelected(date.value)" name="success" class="date-check" />
        </div>
      </div>
    </div>

    <!-- 选择时间段 -->
    <div class="time-section">
      <h3 class="section-title">选择时间段</h3>
      <van-loading v-if="loading" vertical size="24px">加载中...</van-loading>
      
      <div v-else-if="currentDate" class="time-slots">
        <div
          v-for="slot in timeSlots"
          :key="slot.id"
          class="time-slot"
          :class="{
            active: isSlotSelected(slot),
            disabled: !slot.available || (showRemaining && slot.remaining === 0)
          }"
          @click="handleSlotClick(slot)"
        >
          <div class="time-range">{{ slot.display_time }}</div>
          <div class="time-description">{{ slot.description }}</div>
          <div v-if="showRemaining" class="remaining">
            剩余 {{ slot.remaining || 0 }}
          </div>
        </div>
      </div>
      
      <div v-else class="empty-hint">
        请先选择日期
      </div>
    </div>

    <!-- 已选择的日期和时间段预览 -->
    <div v-if="hasSelection" class="selection-preview">
      <div class="preview-title">已选择</div>
      <div class="preview-content">
        <div
          v-for="date in selectedDates"
          :key="date"
          class="preview-date-group"
        >
          <div class="preview-date">{{ date }}</div>
          <div class="preview-slots">
            {{ getDateSlotsText(date) }}
          </div>
        </div>
      </div>
      <div class="preview-summary">
        共 {{ selectedDates.length }} 天，{{ totalSlotsCount }} 个时间段
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { showToast } from 'vant'

/**
 * 组件 Props
 */
const props = defineProps({
  // 已选择的日期和时间段 { "2026-01-10": [slot1, slot2], "2026-01-11": [slot3] }
  modelValue: {
    type: Object,
    default: () => ({})
  },
  // 提前预约天数
  advanceDays: {
    type: Number,
    default: 7
  },
  // 是否显示剩余数量
  showRemaining: {
    type: Boolean,
    default: false
  },
  // 是否允许多选时间段
  multiple: {
    type: Boolean,
    default: true
  },
  // 获取时间段数据的函数
  fetchSlots: {
    type: Function,
    required: true
  }
})

/**
 * 组件 Emits
 */
const emit = defineEmits(['update:modelValue'])

/**
 * 当前查看的日期（用于显示时间段）
 */
const currentDate = ref('')

/**
 * 已选择的日期和时间段 { "2026-01-10": [slot1, slot2], "2026-01-11": [slot3] }
 */
const selectedDateSlots = ref({})

/**
 * 时间段列表（当前日期的）
 */
const timeSlots = ref([])

/**
 * 加载状态
 */
const loading = ref(false)

/**
 * 可选日期列表（从今天开始，向后N天）
 */
const availableDates = computed(() => {
  const dates = []
  const today = new Date()
  const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  
  for (let i = 0; i < props.advanceDays; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() + i)
    
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const week = weekDays[date.getDay()]
    
    dates.push({
      value: `${date.getFullYear()}-${month}-${day}`,
      display: `${month}/${day}`,
      week: i === 0 ? '今天' : week
    })
  }
  
  return dates
})

/**
 * 已选择的日期列表（排序后）
 */
const selectedDates = computed(() => {
  return Object.keys(selectedDateSlots.value).sort()
})

/**
 * 是否有选择
 */
const hasSelection = computed(() => {
  return selectedDates.value.length > 0
})

/**
 * 总时间段数量
 */
const totalSlotsCount = computed(() => {
  let count = 0
  selectedDates.value.forEach(date => {
    count += (selectedDateSlots.value[date] || []).length
  })
  return count
})

/**
 * 判断日期是否被选中（有时间段）
 * @param {string} date - 日期字符串
 */
function isDateSelected(date) {
  return selectedDateSlots.value[date] && selectedDateSlots.value[date].length > 0
}

/**
 * 判断时间段是否被选中
 * @param {object} slot - 时间段对象
 */
function isSlotSelected(slot) {
  if (!currentDate.value) return false
  const slots = selectedDateSlots.value[currentDate.value] || []
  return slots.some(s => s.id === slot.id)
}

/**
 * 处理日期点击
 * @param {string} date - 日期字符串
 */
async function handleDateClick(date) {
  // 切换当前日期
  if (currentDate.value === date) {
    // 如果点击的是当前日期，不做任何操作（保持选中状态）
    return
  }
  
  currentDate.value = date
  await loadTimeSlots()
}

/**
 * 处理时间段点击
 * @param {object} slot - 时间段对象
 */
function handleSlotClick(slot) {
  if (!currentDate.value) {
    showToast('请先选择日期')
    return
  }
  
  // 不可用的时间段不能选择
  if (!slot.available || (props.showRemaining && slot.remaining === 0)) {
    showToast('该时间段不可预约')
    return
  }

  // 获取当前日期的时间段列表
  const currentSlots = selectedDateSlots.value[currentDate.value] || []
  
  if (props.multiple) {
    // 多选模式
    const index = currentSlots.findIndex(s => s.id === slot.id)
    if (index > -1) {
      // 取消选择
      currentSlots.splice(index, 1)
      if (currentSlots.length === 0) {
        // 如果该日期没有时间段了，删除该日期
        delete selectedDateSlots.value[currentDate.value]
      }
    } else {
      // 选择
      if (!selectedDateSlots.value[currentDate.value]) {
        selectedDateSlots.value[currentDate.value] = []
      }
      selectedDateSlots.value[currentDate.value].push(slot)
    }
  } else {
    // 单选模式
    selectedDateSlots.value[currentDate.value] = [slot]
  }
  
  emitValue()
}

/**
 * 加载时间段数据
 */
async function loadTimeSlots() {
  if (!currentDate.value) return
  
  try {
    loading.value = true
    timeSlots.value = await props.fetchSlots(currentDate.value)
  } catch (error) {
    console.error('加载时间段失败:', error)
    showToast('加载时间段失败')
    timeSlots.value = []
  } finally {
    loading.value = false
  }
}

/**
 * 发送更新事件
 */
function emitValue() {
  emit('update:modelValue', { ...selectedDateSlots.value })
}

/**
 * 获取某个日期的时间段文本
 * @param {string} date - 日期
 */
function getDateSlotsText(date) {
  const slots = selectedDateSlots.value[date] || []
  return slots.map(s => s.display_time).join('、')
}

/**
 * 监听外部值变化
 */
watch(() => props.modelValue, (newVal) => {
  selectedDateSlots.value = { ...newVal }
}, { deep: true, immediate: true })

/**
 * 组件挂载时初始化
 */
onMounted(() => {
  // 默认选择第一个日期
  if (availableDates.value.length > 0 && !currentDate.value) {
    currentDate.value = availableDates.value[0].value
    loadTimeSlots()
  }
})
</script>

<style lang="less" scoped>
.date-time-slot-picker {
  .section-title {
    font-size: @font-size-lg;
    font-weight: 600;
    margin-bottom: @padding-md;
    color: var(--text-color);
  }

  .date-section {
    margin-bottom: @padding-xl;

    .date-tabs {
      display: flex;
      gap: @padding-sm;
      overflow-x: auto;
      padding-bottom: @padding-xs;

      &::-webkit-scrollbar {
        height: 4px;
      }

      .date-tab {
        position: relative;
        flex-shrink: 0;
        min-width: 60px;
        padding: @padding-sm @padding-md;
        background-color: var(--bg-color-white);
        border: 1px solid var(--border-color);
        border-radius: @border-radius-sm;
        text-align: center;
        cursor: pointer;
        transition: all 0.3s;

        .date-week {
          font-size: @font-size-xs;
          color: var(--text-color-3);
          margin-bottom: 4px;
        }

        .date-value {
          font-size: @font-size-md;
          font-weight: 600;
          color: var(--text-color);
        }

        .date-check {
          position: absolute;
          top: 2px;
          right: 2px;
          font-size: 14px;
          color: var(--primary-color);
        }

        &.active {
          background-color: var(--primary-color);
          border-color: var(--primary-color);

          .date-week,
          .date-value {
            color: #fff;
          }

          .date-check {
            color: #fff;
          }
        }

        &.selected:not(.active) {
          border-color: var(--primary-color);
          background-color: rgba(var(--primary-color-rgb), 0.1);

          .date-check {
            color: var(--primary-color);
          }
        }

        &:hover:not(.active) {
          border-color: var(--primary-color);
        }
      }
    }
  }

  .time-section {
    min-height: 200px;
    margin-bottom: @padding-xl;

    .empty-hint {
      text-align: center;
      padding: @padding-xl 0;
      color: var(--text-color-3);
      font-size: @font-size-md;
    }

    .time-slots {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: @padding-md;

      @media (max-width: 767px) {
        grid-template-columns: repeat(2, 1fr);
        gap: @padding-sm;
      }

      .time-slot {
        padding: @padding-md;
        background-color: var(--bg-color-white);
        border: 1px solid var(--border-color);
        border-radius: @border-radius-sm;
        text-align: center;
        cursor: pointer;
        transition: all 0.3s;

        .time-range {
          font-size: @font-size-md;
          font-weight: 600;
          color: var(--text-color);
          margin-bottom: 4px;
        }
        .time-description {
          font-size: @font-size-xs;
          color: var(--text-color-3);
          margin-bottom: 4px;
        }

        .remaining {
          font-size: @font-size-xs;
          color: var(--text-color-3);
        }

        &.active {
          background-color: var(--primary-color);
          border-color: var(--primary-color);

          .time-range,
          .time-description,
          .remaining {
            color: #fff;
          }
        }

        &.disabled {
          background-color: var(--bg-color);
          border-color: var(--border-color);
          cursor: not-allowed;
          opacity: 0.5;

          .time-range,
          .time-description,
          .remaining {
            color: var(--text-color-4);
          }
        }

        &:hover:not(.active):not(.disabled) {
          border-color: var(--primary-color);
          transform: translateY(-2px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
      }
    }
  }

  .selection-preview {
    margin-top: @padding-xl;
    padding: @padding-md;
    background-color: #f7f8fa;
    border-radius: @border-radius-md;
    border: 1px solid var(--border-color);

    .preview-title {
      font-size: @font-size-md;
      font-weight: 600;
      color: var(--text-color);
      margin-bottom: @padding-sm;
    }

    .preview-content {
      .preview-date-group {
        margin-bottom: @padding-sm;

        &:last-child {
          margin-bottom: 0;
        }

        .preview-date {
          font-size: @font-size-sm;
          font-weight: 600;
          color: var(--primary-color);
          margin-bottom: 4px;
        }

        .preview-slots {
          font-size: @font-size-sm;
          color: var(--text-color-2);
          padding-left: @padding-md;
        }
      }
    }

    .preview-summary {
      margin-top: @padding-md;
      padding-top: @padding-sm;
      border-top: 1px dashed var(--border-color);
      font-size: @font-size-sm;
      color: var(--text-color-2);
      text-align: center;
    }
  }
}
</style>
