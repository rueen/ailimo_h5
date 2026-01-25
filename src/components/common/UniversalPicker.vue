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
      <!-- 搜索框 -->
      <div v-if="enableSearch && columns.length > searchThreshold" class="picker-search">
        <van-search
          v-model="searchKeyword"
          placeholder="搜索选项"
          :clearable="true"
          show-action
          @search="onSearch"
          @cancel="onSearchCancel"
          @clear="onSearchClear"
        />
      </div>
      
      <!-- 提示信息 -->
      <div v-if="enableSearch && searchKeyword && filteredColumns.length === 0" class="picker-empty">
        <van-empty description="未找到匹配的选项" />
      </div>
      
      <!-- 选择器 -->
      <van-picker
        v-else
        :columns="filteredColumns"
        :loading="loading"
        @confirm="handleMobileConfirm"
        @cancel="showPicker = false"
      />
    </van-popup>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
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
  },
  /** 是否启用搜索功能 */
  enableSearch: {
    type: Boolean,
    default: true
  },
  /** 选项数量超过此阈值时显示搜索框 */
  searchThreshold: {
    type: Number,
    default: 10
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
 * 搜索关键词
 */
const searchKeyword = ref('')

/**
 * 显示的文本（移动端）
 */
const displayText = computed(() => {
  if (props.modelValue == null) return '';
  
  const selected = props.columns.find(item => item.value === props.modelValue)
  return selected ? selected.text : ''
})

/**
 * 过滤后的选项列表
 */
const filteredColumns = computed(() => {
  if (!props.enableSearch || !searchKeyword.value.trim()) {
    return props.columns
  }
  
  const keyword = searchKeyword.value.toLowerCase().trim()
  return props.columns.filter(item => {
    const text = String(item.text).toLowerCase()
    // 支持全文搜索和拼音首字母搜索（如果有 pinyin 字段）
    const matchText = text.includes(keyword)
    const matchPinyin = item.pinyin && String(item.pinyin).toLowerCase().includes(keyword)
    return matchText || matchPinyin
  })
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
 * 搜索事件
 */
function onSearch() {
  // 搜索时自动过滤，无需额外处理
}

/**
 * 取消搜索
 */
function onSearchCancel() {
  searchKeyword.value = ''
}

/**
 * 清空搜索
 */
function onSearchClear() {
  searchKeyword.value = ''
}

/**
 * 监听选择器显示状态，关闭时清空搜索
 */
watch(showPicker, (newVal) => {
  if (!newVal) {
    searchKeyword.value = ''
  }
})
</script>

<style lang="less" scoped>
.universal-picker {
  width: 100%;
}

.picker-search {
  padding: 12px 16px 0;
  background-color: var(--van-background-2);
  
  :deep(.van-search) {
    padding: 0;
    
    .van-search__content {
      border-radius: 20px;
    }
  }
}

.picker-empty {
  padding: 60px 0;
  text-align: center;
}
</style>
