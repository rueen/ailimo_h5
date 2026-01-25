<template>
  <div class="region-picker">
    <van-field
      :model-value="regionText"
      :label="label"
      :placeholder="placeholder"
      readonly
      is-link
      required
      :rules="[{ required: true, message: '请选择收货地址' }]"
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
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
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
  },
  // 标签文本
  label: {
    type: String,
    default: '收货地址'
  },
  // 占位符
  placeholder: {
    type: String,
    default: '请选择省市区'
  }
})

/**
 * 组件 Emits
 */
const emit = defineEmits(['update:modelValue'])

/**
 * 显示选择器（移动端）
 */
const showPicker = ref(false)

/**
 * 加载状态
 */
const loading = ref(false)

/**
 * 是否正在初始化
 */
const isInitializing = ref(false)

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
const columns = computed(() => {
  return [
    provinces.value,
    cities.value,
    districts.value
  ]
})

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
  // 如果已经有数据，不重复加载
  if (provinces.value.length > 0) return
  
  try {
    loading.value = true
    const data = await getRegions({ level: 1 })
    provinces.value = (data || []).map(item => ({
      text: item.name,
      value: item.id
    }))
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
  // 避免重复请求同一个省份的城市
  if (cities.value.length > 0 && cities.value[0]?.parentId === provinceId) {
    return
  }
  
  try {
    loading.value = true
    const data = await getRegions({ parent_id: provinceId, level: 2 })
    cities.value = (data || []).map(item => ({
      text: item.name,
      value: item.id,
      parentId: provinceId
    }))
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
  // 避免重复请求同一个城市的区县
  if (districts.value.length > 0 && districts.value[0]?.parentId === cityId) {
    return
  }
  
  try {
    loading.value = true
    const data = await getRegions({ parent_id: cityId, level: 3 })
    districts.value = (data || []).map(item => ({
      text: item.name,
      value: item.id,
      parentId: cityId
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
 * @param {object} param - 包含 columnIndex、selectedValues 和 selectedOptions
 */
async function onChange({ columnIndex, selectedOptions }) {
  if (columnIndex === 0) {
    // 省份改变，重新加载城市和区县
    const province = selectedOptions[0]
    if (province && province.value) {
      cities.value = []
      districts.value = []
      await loadCities(province.value)
      // 加载该省第一个城市的区县
      if (cities.value.length > 0) {
        await loadDistricts(cities.value[0].value)
      }
    }
  } else if (columnIndex === 1) {
    // 城市改变，重新加载区县
    const city = selectedOptions[1]
    if (city && city.value) {
      districts.value = []
      await loadDistricts(city.value)
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
 * 监听显示状态，打开时加载数据（移动端）
 */
watch(showPicker, async (newVal) => {
  if (newVal && provinces.value.length === 0) {
    await loadProvinces()
    
    // 如果有默认值，加载对应的城市和区县（仅在打开选择器时）
    if (props.modelValue.province_id && !isInitializing.value) {
      await loadCities(props.modelValue.province_id)
      if (props.modelValue.city_id) {
        await loadDistricts(props.modelValue.city_id)
      }
    }
  }
})

/**
 * 监听 modelValue 变化，同步更新显示文本
 */
watch(() => props.modelValue, async (newVal) => {
  if (newVal.province_id && newVal.city_id && newVal.district_id) {
    // 防止重复初始化
    if (isInitializing.value) return
    isInitializing.value = true
    
    await loadRegionNames(newVal)
    
    isInitializing.value = false
  } else {
    selectedNames.value = {
      province: '',
      city: '',
      district: ''
    }
  }
}, { immediate: true, deep: true })

/**
 * 根据ID加载地区名称
 */
async function loadRegionNames(region) {
  try {
    const { province_id, city_id, district_id } = region
    
    if (!province_id || !city_id || !district_id) {
      return
    }
    
    // 如果省份列表为空，先加载
    if (provinces.value.length === 0) {
      await loadProvinces()
    }
    
    // 查找省份名称
    const province = provinces.value.find(p => p.value === province_id)
    if (!province) return
    
    // 加载城市列表（仅在未加载或不匹配时）
    if (cities.value.length === 0 || cities.value[0]?.parentId !== province_id) {
      await loadCities(province_id)
    }
    const city = cities.value.find(c => c.value === city_id)
    if (!city) return
    
    // 加载区县列表（仅在未加载或不匹配时）
    if (districts.value.length === 0 || districts.value[0]?.parentId !== city_id) {
      await loadDistricts(city_id)
    }
    const district = districts.value.find(d => d.value === district_id)
    if (!district) return
    
    // 更新显示名称
    selectedNames.value = {
      province: province.text,
      city: city.text,
      district: district.text
    }
  } catch (error) {
    console.error('加载地区名称失败:', error)
  }
}

/**
 * 组件挂载时初始化
 */
onMounted(async () => {
  // 默认值的处理已在 watch 中完成，此处不需要额外操作
})

/**
 * 组件卸载时清理
 */
onUnmounted(() => {

})
</script>

<style lang="less" scoped>
.region-picker {
  width: 100%;
}
</style>
