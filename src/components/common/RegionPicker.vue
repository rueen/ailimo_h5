<template>
  <div class="region-picker">
    <van-field
      :model-value="regionText"
      label="所在地区"
      placeholder="请选择省市区"
      readonly
      is-link
      required
      :rules="[{ required: true, message: '请选择所在地区' }]"
      @click="showPicker = true"
    />
    
    <van-popup v-model:show="showPicker" position="bottom" round>
      <van-picker
        ref="pickerRef"
        :columns="columns"
        :loading="loading"
        @confirm="onConfirm"
        @cancel="showPicker = false"
        @change="onChange"
      />
    </van-popup>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { showToast } from 'vant'
import { getRegions } from '@/api/common'

/**
 * 组件 Props
 */
const props = defineProps({
  // v-model 绑定的值，包含省市区ID
  modelValue: {
    type: Object,
    default: () => ({
      province_id: null,
      city_id: null,
      district_id: null
    })
  }
})

/**
 * 组件 Emits
 */
const emit = defineEmits(['update:modelValue'])

/**
 * 显示选择器
 */
const showPicker = ref(false)

/**
 * 加载状态
 */
const loading = ref(false)

/**
 * Picker 引用
 */
const pickerRef = ref(null)

/**
 * 省市区列表
 */
const provinces = ref([])
const cities = ref([])
const districts = ref([])

/**
 * 选中的省市区名称
 */
const selectedNames = ref({
  province: '',
  city: '',
  district: ''
})

/**
 * Picker 的列配置
 */
const columns = computed(() => [
  {
    values: provinces.value,
    className: 'column-province',
    defaultIndex: 0
  },
  {
    values: cities.value,
    className: 'column-city',
    defaultIndex: 0
  },
  {
    values: districts.value,
    className: 'column-district',
    defaultIndex: 0
  }
])

/**
 * 显示的地区文本
 */
const regionText = computed(() => {
  const { province, city, district } = selectedNames.value
  if (province && city && district) {
    return `${province} ${city} ${district}`
  }
  return ''
})

/**
 * 加载省份列表
 */
async function loadProvinces() {
  try {
    loading.value = true
    const data = await getRegions({ level: 1 })
    provinces.value = (data || []).map(item => ({
      text: item.name,
      value: item.id
    }))
    
    // 如果有省份数据，加载第一个省份的城市
    if (provinces.value.length > 0) {
      await loadCities(provinces.value[0].value)
    }
  } catch (error) {
    console.error('加载省份列表失败:', error)
    showToast('加载省份列表失败')
  } finally {
    loading.value = false
  }
}

/**
 * 加载城市列表
 * @param {number} provinceId - 省份ID
 */
async function loadCities(provinceId) {
  try {
    loading.value = true
    const data = await getRegions({ parent_id: provinceId, level: 2 })
    cities.value = (data || []).map(item => ({
      text: item.name,
      value: item.id
    }))
    
    // 如果有城市数据，加载第一个城市的区县
    if (cities.value.length > 0) {
      await loadDistricts(cities.value[0].value)
    } else {
      districts.value = []
    }
  } catch (error) {
    console.error('加载城市列表失败:', error)
    cities.value = []
    districts.value = []
  } finally {
    loading.value = false
  }
}

/**
 * 加载区县列表
 * @param {number} cityId - 城市ID
 */
async function loadDistricts(cityId) {
  try {
    loading.value = true
    const data = await getRegions({ parent_id: cityId, level: 3 })
    districts.value = (data || []).map(item => ({
      text: item.name,
      value: item.id
    }))
  } catch (error) {
    console.error('加载区县列表失败:', error)
    districts.value = []
  } finally {
    loading.value = false
  }
}

/**
 * Picker 改变事件
 * @param {object} picker - Picker 实例
 * @param {array} values - 当前选中的值
 * @param {number} index - 改变的列索引
 */
async function onChange({ columnIndex, selectedValues }) {
  if (columnIndex === 0) {
    // 省份改变，重新加载城市和区县
    const provinceId = selectedValues[0]
    if (provinceId) {
      await loadCities(provinceId)
    }
  } else if (columnIndex === 1) {
    // 城市改变，重新加载区县
    const cityId = selectedValues[1]
    if (cityId) {
      await loadDistricts(cityId)
    }
  }
}

/**
 * 确认选择
 * @param {object} result - 选择结果
 */
function onConfirm({ selectedOptions }) {
  if (selectedOptions.length < 3) {
    showToast('请选择完整的省市区')
    return
  }
  
  const [province, city, district] = selectedOptions
  
  // 保存选中的名称
  selectedNames.value = {
    province: province.text,
    city: city.text,
    district: district.text
  }
  
  // 发送更新事件
  emit('update:modelValue', {
    province_id: province.value,
    city_id: city.value,
    district_id: district.value
  })
  
  showPicker.value = false
}

/**
 * 监听显示状态，打开时加载数据
 */
watch(showPicker, (newVal) => {
  if (newVal && provinces.value.length === 0) {
    loadProvinces()
  }
})
</script>

<style lang="less" scoped>
.region-picker {
  width: 100%;
}
</style>
