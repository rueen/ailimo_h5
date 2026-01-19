<template>
  <div class="region-picker">
    <!-- PC 端使用三个级联的 select -->
    <template v-if="isPC">
      <div class="pc-region-wrapper">
        <label class="pc-label required">所在地区</label>
        <div class="pc-select-group">
          <!-- 省份 -->
          <select
            v-model="selectedProvince"
            class="pc-select"
            :class="{ 'is-placeholder': !selectedProvince }"
            @change="onProvinceChange"
          >
            <option value="">请选择省份</option>
            <option
              v-for="item in provinces"
              :key="item.value"
              :value="item.value"
            >
              {{ item.text }}
            </option>
          </select>
          
          <!-- 城市 -->
          <select
            v-model="selectedCity"
            class="pc-select"
            :class="{ 'is-placeholder': !selectedCity }"
            :disabled="!selectedProvince"
            @change="onCityChange"
          >
            <option value="">请选择城市</option>
            <option
              v-for="item in cities"
              :key="item.value"
              :value="item.value"
            >
              {{ item.text }}
            </option>
          </select>
          
          <!-- 区县 -->
          <select
            v-model="selectedDistrict"
            class="pc-select"
            :class="{ 'is-placeholder': !selectedDistrict }"
            :disabled="!selectedCity"
            @change="onDistrictChange"
          >
            <option value="">请选择区县</option>
            <option
              v-for="item in districts"
              :key="item.value"
              :value="item.value"
            >
              {{ item.text }}
            </option>
          </select>
        </div>
      </div>
    </template>
    
    <!-- 移动端使用 van-picker -->
    <template v-else>
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
    </template>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { showToast } from 'vant'
import { getRegions } from '@/api/common'
import { isPC as detectIsPC } from '@/utils/device'

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
 * 是否为 PC 端
 */
const isPC = ref(detectIsPC())

/**
 * 显示选择器（移动端）
 */
const showPicker = ref(false)

/**
 * PC 端选中的值
 */
const selectedProvince = ref('')
const selectedCity = ref('')
const selectedDistrict = ref('')

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
 * @param {object} param - 包含 columnIndex、selectedValues 和 selectedOptions
 */
async function onChange({ columnIndex, selectedOptions }) {
  if (columnIndex === 0) {
    // 省份改变，重新加载城市和区县
    const province = selectedOptions[0]
    if (province && province.value) {
      await loadCities(province.value)
    }
  } else if (columnIndex === 1) {
    // 城市改变，重新加载区县
    const city = selectedOptions[1]
    if (city && city.value) {
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
 * PC 端省份改变
 */
async function onProvinceChange() {
  // 清空城市和区县
  selectedCity.value = ''
  selectedDistrict.value = ''
  cities.value = []
  districts.value = []
  
  if (selectedProvince.value) {
    await loadCities(selectedProvince.value)
  }
  
  updateValue()
}

/**
 * PC 端城市改变
 */
async function onCityChange() {
  // 清空区县
  selectedDistrict.value = ''
  districts.value = []
  
  if (selectedCity.value) {
    await loadDistricts(selectedCity.value)
  }
  
  updateValue()
}

/**
 * PC 端区县改变
 */
function onDistrictChange() {
  updateValue()
}

/**
 * 更新 v-model 值
 */
function updateValue() {
  if (selectedProvince.value && selectedCity.value && selectedDistrict.value) {
    // 获取选中的名称
    const province = provinces.value.find(item => item.value == selectedProvince.value)
    const city = cities.value.find(item => item.value == selectedCity.value)
    const district = districts.value.find(item => item.value == selectedDistrict.value)
    
    if (province && city && district) {
      selectedNames.value = {
        province: province.text,
        city: city.text,
        district: district.text
      }
      
      emit('update:modelValue', {
        province_id: selectedProvince.value,
        city_id: selectedCity.value,
        district_id: selectedDistrict.value
      })
    }
  }
}

/**
 * 窗口大小改变处理
 */
const handleResize = () => {
  isPC.value = detectIsPC()
}

/**
 * 监听显示状态，打开时加载数据（移动端）
 */
watch(showPicker, (newVal) => {
  if (newVal && provinces.value.length === 0) {
    loadProvinces()
  }
})

/**
 * 组件挂载时初始化
 */
onMounted(() => {
  // PC 端自动加载省份数据
  if (isPC.value) {
    loadProvinces()
  }
  
  // 添加窗口大小监听
  if (typeof window !== 'undefined') {
    window.addEventListener('resize', handleResize)
  }
})

/**
 * 组件卸载时清理
 */
onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('resize', handleResize)
  }
})
</script>

<style lang="less" scoped>
.region-picker {
  width: 100%;
  
  // PC 端样式
  .pc-region-wrapper {
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
    
    .pc-select-group {
      flex: 1;
      display: flex;
      gap: 12px;
      
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
}
</style>
