<template>
  <div class="universal-picker">
    <van-field
      :model-value="displayText"
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
      <van-picker
        :columns="columns"
        :loading="loading"
        @confirm="handleMobileConfirm"
        @cancel="showPicker = false"
      />
    </van-popup>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { showToast } from 'vant'

/**
 * 组件 Props
 */
const props = defineProps({
  /** v-model 绑定的值 */
  modelValue: {
    type: [String, Number],
    default: ''
  },
  /** 选项列表 */
  columns: {
    type: Array,
    default: () => [],
    validator: (value) => {
      // 验证数组元素格式 { text: string, value: any }
      return value.every(item => 
        typeof item === 'object' && 
        'text' in item && 
        'value' in item
      )
    }
  },
  /** 标签文本 */
  label: {
    type: String,
    default: ''
  },
  /** 占位符 */
  placeholder: {
    type: String,
    default: '请选择'
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
  /** 加载状态（仅移动端） */
  loading: {
    type: Boolean,
    default: false
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
 * 显示的文本（移动端）
 */
const displayText = computed(() => {
  if (props.modelValue == null) return '';
  
  const selected = props.columns.find(item => item.value === props.modelValue)
  return selected ? selected.text : ''
})

/**
 * 移动端点击
 */
function handleMobileClick() {
  if (props.disabled) return
  
  if (!props.columns || props.columns.length === 0) {
    showToast('暂无选项')
    return
  }
  
  showPicker.value = true
}

/**
 * 移动端确认选择
 * @param {Object} result - 选择结果
 */
function handleMobileConfirm({ selectedOptions }) {
  const selected = selectedOptions[0]
  
  if (selected) {
    emit('update:modelValue', selected.value)
    emit('change', { selectedOption: selected })
    emit('confirm', { selectedOption: selected })
  }
  
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
.universal-picker {
  width: 100%;
}
</style>
