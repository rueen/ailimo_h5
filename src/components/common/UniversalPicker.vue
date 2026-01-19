<template>
  <div class="universal-picker">
    <!-- PC 端使用原生 select -->
    <template v-if="isPC">
      <div class="pc-select-wrapper">
        <label v-if="label" class="pc-label" :class="{ required: required }">
          {{ label }}
        </label>
        <select
          :value="modelValue"
          :disabled="disabled"
          :required="required"
          class="pc-select"
          :class="{ 'is-placeholder': !modelValue }"
          @change="handlePCChange"
        >
          <option value="" disabled>{{ placeholder }}</option>
          <option
            v-for="item in columns"
            :key="item.value"
            :value="item.value"
          >
            {{ item.text }}
          </option>
        </select>
      </div>
    </template>
    
    <!-- 移动端使用 van-picker -->
    <template v-else>
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
    </template>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { isPC as detectIsPC } from '@/utils/device'
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
 * 是否为 PC 端
 */
const isPC = ref(detectIsPC())

/**
 * 移动端显示选择器
 */
const showPicker = ref(false)

/**
 * 显示的文本（移动端）
 */
const displayText = computed(() => {
  if (!props.modelValue) return ''
  
  const selected = props.columns.find(item => item.value === props.modelValue)
  return selected ? selected.text : ''
})

/**
 * PC 端选择变化
 * @param {Event} event - 原生 change 事件
 */
function handlePCChange(event) {
  const value = event.target.value
  const selected = props.columns.find(item => item.value == value)
  
  if (selected) {
    emit('update:modelValue', selected.value)
    emit('change', { selectedOption: selected })
    emit('confirm', { selectedOption: selected })
  }
}

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
 * 窗口大小改变处理
 */
const handleResize = () => {
  isPC.value = detectIsPC()
}

/**
 * 组件挂载时添加监听
 */
onMounted(() => {
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
.universal-picker {
  width: 100%;
  
  // PC 端样式
  .pc-select-wrapper {
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
    
    .pc-select {
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
      
      &.is-placeholder {
        color: #c8c9cc;
      }
      
      option {
        padding: 8px 0;
      }
    }
  }
}
</style>
