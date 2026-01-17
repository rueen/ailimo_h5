<template>
  <div class="date-time-slot-picker">
    <!-- 选择日期 -->
    <div class="date-section">
      <h3 class="section-title">选择时间</h3>
      <div class="date-tabs">
        <div
          v-for="date in availableDates"
          :key="date.value"
          class="date-tab"
          :class="{ active: selectedDate === date.value }"
          @click="handleDateChange(date.value)"
        >
          <div class="date-week">{{ date.week }}</div>
          <div class="date-value">{{ date.display }}</div>
        </div>
      </div>
    </div>

    <!-- 选择时间段 -->
    <div class="time-section">
      <van-loading v-if="loading" vertical size="24px">加载中...</van-loading>
      
      <div v-else class="time-slots">
        <div
          v-for="slot in timeSlots"
          :key="slot.id"
          class="time-slot"
          :class="{
            active: isSelected(slot),
            disabled: !slot.available || (showRemaining && slot.remaining === 0)
          }"
          @click="handleSlotClick(slot)"
        >
          <div class="time-range">{{ slot.display_time }}</div>
          <div v-if="showRemaining" class="remaining">
            剩余 {{ slot.remaining || 0 }}
          </div>
        </div>
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
  // 已选择的日期
  modelValue: {
    type: Object,
    default: () => ({ date: '', slots: [] })
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
 * 选中的日期
 */
const selectedDate = ref('')

/**
 * 选中的时间段
 */
const selectedSlots = ref([])

/**
 * 时间段列表
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
 * 判断时间段是否被选中
 * @param {object} slot - 时间段对象
 */
function isSelected(slot) {
  return selectedSlots.value.some(s => s.id === slot.id)
}

/**
 * 处理日期改变
 * @param {string} date - 日期字符串
 */
async function handleDateChange(date) {
  selectedDate.value = date
  selectedSlots.value = []
  await loadTimeSlots()
  emitValue()
}

/**
 * 处理时间段点击
 * @param {object} slot - 时间段对象
 */
function handleSlotClick(slot) {
  // 不可用的时间段不能选择
  if (!slot.available || (props.showRemaining && slot.remaining === 0)) {
    showToast('该时间段不可预约')
    return
  }

  if (props.multiple) {
    // 多选模式
    const index = selectedSlots.value.findIndex(s => s.id === slot.id)
    if (index > -1) {
      selectedSlots.value.splice(index, 1)
    } else {
      selectedSlots.value.push(slot)
    }
  } else {
    // 单选模式
    selectedSlots.value = [slot]
  }
  
  emitValue()
}

/**
 * 加载时间段数据
 */
async function loadTimeSlots() {
  if (!selectedDate.value) return
  
  try {
    loading.value = true
    timeSlots.value = await props.fetchSlots(selectedDate.value)
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
  emit('update:modelValue', {
    date: selectedDate.value,
    slots: selectedSlots.value
  })
}

/**
 * 监听外部值变化
 */
watch(() => props.modelValue, (newVal) => {
  if (newVal.date !== selectedDate.value) {
    selectedDate.value = newVal.date
  }
  selectedSlots.value = newVal.slots || []
}, { deep: true })

/**
 * 组件挂载时初始化
 */
onMounted(() => {
  // 默认选择第一个日期
  if (availableDates.value.length > 0 && !selectedDate.value) {
    selectedDate.value = availableDates.value[0].value
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

        &.active {
          background-color: var(--primary-color);
          border-color: var(--primary-color);

          .date-week,
          .date-value {
            color: #fff;
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

        .remaining {
          font-size: @font-size-xs;
          color: var(--text-color-3);
        }

        &.active {
          background-color: var(--primary-color);
          border-color: var(--primary-color);

          .time-range,
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
}
</style>
