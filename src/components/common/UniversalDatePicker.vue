<template>
  <div class="universal-date-picker">
    <!-- PC 端使用原生 input type="date" -->
    <template v-if="isPC">
      <div class="pc-date-wrapper">
        <label v-if="label" class="pc-label" :class="{ required: required }">
          {{ label }}
        </label>
        <input
          type="date"
          :value="modelValue"
          :disabled="disabled"
          :required="required"
          :min="minDateString"
          :max="maxDateString"
          class="pc-date-input"
          :class="{ 'is-placeholder': !modelValue }"
          @change="handlePCChange"
        />
      </div>
    </template>
    
    <!-- 移动端使用 van-date-picker -->
    <template v-else>
      <van-field
        :model-value="modelValue"
        :label="label"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        :rules="rules"
        readonly
        is-link
        @click="handleMobileClick"
      />
      
      <van-popup v-model:show="showPicker" position="bottom" round>
        <van-date-picker
          v-model="currentDate"
          :title="title"
          :min-date="minDate"
          :max-date="maxDate"
          @confirm="handleMobileConfirm"
          @cancel="showPicker = false"
        />
      </van-popup>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { isPC as detectIsPC } from '@/utils/device'

/**
 * 组件 Props
 */
const props = defineProps({
  /** v-model 绑定的值，格式：YYYY-MM-DD */
  modelValue: {
    type: String,
    default: ''
  },
  /** 标签文本 */
  label: {
    type: String,
    default: ''
  },
  /** 占位符 */
  placeholder: {
    type: String,
    default: '请选择日期'
  },
  /** 标题（移动端） */
  title: {
    type: String,
    default: '选择日期'
  },
  /** 是否禁用 */
  disabled: {
    type: Boolean,
    default: false
  },
  /** 是否必填 */
  required: {
    type: Boolean,
    default: false
  },
  /** 最小日期 */
  minDate: {
    type: Date,
    default: () => new Date(1900, 0, 1)
  },
  /** 最大日期 */
  maxDate: {
    type: Date,
    default: () => new Date(2099, 11, 31)
  },
  /** 验证规则（仅移动端） */
  rules: {
    type: Array,
    default: () => []
  }
})

/**
 * 组件 Emits
 */
const emit = defineEmits(['update:modelValue', 'change', 'confirm'])

/**
 * 是否为 PC 端
 */
const isPC = ref(detectIsPC())

/**
 * 移动端显示选择器
 */
const showPicker = ref(false)

/**
 * 当前日期（移动端使用，数组格式）
 */
const currentDate = ref([])

/**
 * PC 端最小日期字符串
 */
const minDateString = computed(() => {
  return formatDateToString(props.minDate)
})

/**
 * PC 端最大日期字符串
 */
const maxDateString = computed(() => {
  return formatDateToString(props.maxDate)
})

/**
 * 将 Date 对象转换为 YYYY-MM-DD 字符串
 * @param {Date} date - 日期对象
 * @returns {string} 日期字符串
 */
function formatDateToString(date) {
  if (!date) return ''
  
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  
  return `${year}-${month}-${day}`
}

/**
 * 将日期字符串转换为数组格式 [year, month, day]
 * @param {string} dateString - 日期字符串 YYYY-MM-DD
 * @returns {Array} 日期数组
 */
function parseDateString(dateString) {
  if (!dateString) {
    const today = new Date()
    return [today.getFullYear(), today.getMonth() + 1, today.getDate()]
  }
  
  const [year, month, day] = dateString.split('-').map(Number)
  return [year, month, day]
}

/**
 * PC 端日期改变
 * @param {Event} event - 原生 change 事件
 */
function handlePCChange(event) {
  const value = event.target.value
  
  emit('update:modelValue', value)
  emit('change', { value })
  emit('confirm', { value })
}

/**
 * 移动端点击
 */
function handleMobileClick() {
  console.log('UniversalDatePicker: 移动端点击事件触发')
  
  if (props.disabled) {
    console.log('UniversalDatePicker: 组件已禁用')
    return
  }
  
  // 初始化当前日期
  currentDate.value = parseDateString(props.modelValue)
  console.log('UniversalDatePicker: 设置当前日期', currentDate.value)
  
  showPicker.value = true
  console.log('UniversalDatePicker: 显示选择器')
}

/**
 * 移动端确认选择
 * @param {Object} result - 选择结果
 */
function handleMobileConfirm({ selectedValues }) {
  const [year, month, day] = selectedValues
  const monthStr = String(month).padStart(2, '0')
  const dayStr = String(day).padStart(2, '0')
  const value = `${year}-${monthStr}-${dayStr}`
  
  emit('update:modelValue', value)
  emit('change', { value })
  emit('confirm', { value })
  
  showPicker.value = false
}

/**
 * 窗口大小改变处理
 */
const handleResize = () => {
  isPC.value = detectIsPC()
}

/**
 * 组件挂载时添加监听
 */
onMounted(() => {
  console.log('UniversalDatePicker: 组件挂载，当前设备类型:', isPC.value ? 'PC' : '移动端')
  
  if (typeof window !== 'undefined') {
    window.addEventListener('resize', handleResize)
  }
})

/**
 * 组件卸载时移除监听
 */
onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('resize', handleResize)
  }
})
</script>

<style lang="less" scoped>
.universal-date-picker {
  width: 100%;
  
  // PC 端样式
  .pc-date-wrapper {
    display: flex;
    align-items: center;
    padding: 10px 16px;
    background-color: #fff;
    
    .pc-label {
      flex: none;
      box-sizing: border-box;
      width: var(--van-field-label-width);
      margin-right: var(--van-field-label-margin-right);
      color: var(--van-field-label-color);
      text-align: left;
      word-wrap: break-word;
      
      &.required::before {
        content: '*';
        color: #ee0a24;
        margin-right: 4px;
      }
    }
    
    .pc-date-input {
      flex: 1;
      height: 36px;
      padding: 0 12px;
      border: 1px solid #ebedf0;
      border-radius: 4px;
      font-size: 14px;
      color: #323233;
      background-color: #fff;
      cursor: pointer;
      transition: all 0.3s;
      
      &:hover:not(:disabled) {
        border-color: #1989fa;
      }
      
      &:focus {
        outline: none;
        border-color: #1989fa;
        box-shadow: 0 0 0 2px rgba(25, 137, 250, 0.1);
      }
      
      &:disabled {
        background-color: #f7f8fa;
        color: #c8c9cc;
        cursor: not-allowed;
      }
      
      // 修改日历图标颜色
      &::-webkit-calendar-picker-indicator {
        cursor: pointer;
        filter: opacity(0.6);
        
        &:hover {
          filter: opacity(1);
        }
      }
    }
  }
}
</style>
