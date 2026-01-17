<template>
  <div class="region-picker">
    <van-field
      v-model="displayValue"
      is-link
      readonly
      :label="label"
      :placeholder="placeholder"
      :required="required"
      @click="show = true"
    />

    <van-popup v-model:show="show" position="bottom">
      <van-picker
        :title="title"
        :columns="columns"
        @confirm="onConfirm"
        @cancel="show = false"
        @change="onChange"
      />
    </van-popup>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { getRegions } from '@/api/common'

/**
 * 定义 props
 */
const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({})
  },
  label: {
    type: String,
    default: '所在地区'
  },
  placeholder: {
    type: String,
    default: '请选择省市区'
  },
  title: {
    type: String,
    default: '选择地区'
  },
  required: {
    type: Boolean,
    default: false
  }
})

/**
 * 定义 emits
 */
const emit = defineEmits(['update:modelValue', 'change'])

/**
 * 显示选择器
 */
const show = ref(false)

/**
 * 选择器列数据
 */
const columns = ref([
  { values: [], defaultIndex: 0 },
  { values: [], defaultIndex: 0 },
  { values: [], defaultIndex: 0 }
])

/**
 * 当前选中的值
 */
const selectedValue = ref({
  province_id: props.modelValue.province_id || null,
  city_id: props.modelValue.city_id || null,
  district_id: props.modelValue.district_id || null,
  province_name: props.modelValue.province_name || '',
  city_name: props.modelValue.city_name || '',
  district_name: props.modelValue.district_name || ''
})

/**
 * 显示值
 */
const displayValue = computed(() => {
  const { province_name, city_name, district_name } = selectedValue.value
  if (province_name && city_name && district_name) {
    return `${province_name} / ${city_name} / ${district_name}`
  }
  return ''
})

/**
 * 加载省份列表
 */
async function loadProvinces() {
  try {
    const list = await getRegions({ level: 1 })
    columns.value[0].values = list.map((item) => ({
      text: item.name,
      value: item.id
    }))
    
    // 如果有默认值，加载对应的市和区
    if (selectedValue.value.province_id) {
      await loadCities(selectedValue.value.province_id)
      if (selectedValue.value.city_id) {
        await loadDistricts(selectedValue.value.city_id)
      }
    }
  } catch (error) {
    console.error('加载省份列表失败:', error)
  }
}

/**
 * 加载城市列表
 */
async function loadCities(provinceId) {
  try {
    const list = await getRegions({ parent_id: provinceId, level: 2 })
    columns.value[1].values = list.map((item) => ({
      text: item.name,
      value: item.id
    }))
  } catch (error) {
    console.error('加载城市列表失败:', error)
  }
}

/**
 * 加载区县列表
 */
async function loadDistricts(cityId) {
  try {
    const list = await getRegions({ parent_id: cityId, level: 3 })
    columns.value[2].values = list.map((item) => ({
      text: item.name,
      value: item.id
    }))
  } catch (error) {
    console.error('加载区县列表失败:', error)
  }
}

/**
 * 选择器值变化
 */
async function onChange({ columnIndex, selectedValues, selectedOptions }) {
  if (columnIndex === 0) {
    // 省份变化，重新加载市和区
    columns.value[1].values = []
    columns.value[2].values = []
    if (selectedValues[0]) {
      await loadCities(selectedValues[0])
    }
  } else if (columnIndex === 1) {
    // 城市变化，重新加载区
    columns.value[2].values = []
    if (selectedValues[1]) {
      await loadDistricts(selectedValues[1])
    }
  }
}

/**
 * 确认选择
 */
function onConfirm({ selectedValues, selectedOptions }) {
  const result = {
    province_id: selectedValues[0] || null,
    city_id: selectedValues[1] || null,
    district_id: selectedValues[2] || null,
    province_name: selectedOptions[0]?.text || '',
    city_name: selectedOptions[1]?.text || '',
    district_name: selectedOptions[2]?.text || ''
  }
  
  selectedValue.value = result
  emit('update:modelValue', result)
  emit('change', result)
  show.value = false
}

/**
 * 监听外部值变化
 */
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue && JSON.stringify(newValue) !== JSON.stringify(selectedValue.value)) {
      selectedValue.value = { ...newValue }
    }
  },
  { deep: true }
)

/**
 * 初始化
 */
loadProvinces()
</script>

<style lang="less" scoped>
.region-picker {
  // 样式由 Vant 组件提供
}
</style>
