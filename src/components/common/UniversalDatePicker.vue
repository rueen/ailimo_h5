<template>
  <div class="universal-date-picker">
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
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

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
 * 移动端显示选择器
 */
const showPicker = ref(false)

/**
 * 当前日期（移动端使用，数组格式）
 */
const currentDate = ref([])

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
 * 组件挂载时添加监听
 */
onMounted(() => {
  
})

/**
 * 组件卸载时移除监听
 */
onUnmounted(() => {

})
</script>

<style lang="less" scoped>
.universal-date-picker {
  width: 100%;
}
</style>
