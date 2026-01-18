<template>
  <app-layout>
    <div class="animal-page page-content">
      <h2 class="page-title">动物订购</h2>
      
      <van-form @submit="handleSubmit" ref="formRef">
        <van-cell-group>
          <!-- 品牌 -->
          <van-field
            v-model="brandName"
            label="品牌"
            placeholder="请选择品牌"
            readonly
            is-link
            required
            :rules="[{ required: true, message: '请选择品牌' }]"
            @click="showBrandPicker = true"
          />
          
          <!-- 品系 -->
          <van-field
            v-model="varietyName"
            label="品系"
            placeholder="请先选择品牌"
            readonly
            is-link
            required
            :rules="[{ required: true, message: '请选择品系' }]"
            :disabled="!formData.brand_id"
            @click="handleVarietyClick"
          />
          
          <!-- 规格 -->
          <van-field
            v-model="specificationName"
            label="规格"
            placeholder="请选择规格"
            readonly
            is-link
            required
            :rules="[{ required: true, message: '请选择规格' }]"
            @click="showSpecificationPicker = true"
          />
          
          <!-- 性别 -->
          <van-field
            v-model="genderName"
            label="性别"
            placeholder="请选择性别"
            readonly
            is-link
            required
            @click="showGenderPicker = true"
          />
          
          <!-- 环境 -->
          <van-field
            v-model="environmentName"
            label="环境"
            placeholder="请选择环境"
            readonly
            is-link
            required
            :rules="[{ required: true, message: '请选择环境' }]"
            @click="showEnvironmentPicker = true"
          />
          
          <!-- 要求 -->
          <van-field
            v-model="requirementName"
            label="要求"
            placeholder="请选择要求"
            readonly
            is-link
            required
            :rules="[{ required: true, message: '请选择要求' }]"
            @click="showRequirementPicker = true"
          />
          
          <!-- 导师姓名 -->
          <van-field
            v-model="formData.supervisor_name"
            label="导师姓名"
            placeholder="请输入导师姓名"
            required
            :rules="[{ required: true, message: '请输入导师姓名' }]"
          />
          
          <!-- 订购人 -->
          <van-field
            v-model="formData.orderer_name"
            label="订购人"
            placeholder="请输入订购人姓名"
            required
            :rules="[{ required: true, message: '请输入订购人姓名' }]"
          />
          
          <!-- 联系电话 -->
          <van-field
            v-model="formData.contact_phone"
            label="联系电话"
            type="tel"
            placeholder="请输入联系电话"
            required
            :rules="phoneRules"
          />
          
          <!-- 到货日期 -->
          <van-field
            v-model="formData.delivery_date"
            label="到货日期"
            placeholder="请选择到货日期"
            readonly
            is-link
            required
            :rules="[{ required: true, message: '请选择到货日期' }]"
            @click="showDatePicker = true"
          />
          
          <!-- 地区选择 -->
          <region-picker v-model="regionValue" />
          
          <!-- 详细地址 -->
          <van-field
            v-model="formData.address"
            type="textarea"
            label="详细地址"
            placeholder="请输入详细地址"
            rows="3"
            required
            :rules="[{ required: true, message: '请输入详细地址' }]"
          />
          
          <!-- 备注 -->
          <van-field
            v-model="formData.remark"
            type="textarea"
            label="备注"
            placeholder="备注(选填)"
            rows="3"
            maxlength="200"
            show-word-limit
          />
        </van-cell-group>
        
        <!-- 提交按钮 -->
        <div class="submit-section">
          <van-button
            round
            block
            type="primary"
            native-type="submit"
            :loading="submitting"
          >
            提交订单
          </van-button>
        </div>
      </van-form>
      
      <!-- 品牌选择器 -->
      <van-popup v-model:show="showBrandPicker" position="bottom">
        <van-picker
          :columns="brandOptions"
          @confirm="onBrandConfirm"
          @cancel="showBrandPicker = false"
        />
      </van-popup>
      
      <!-- 品系选择器 -->
      <van-popup v-model:show="showVarietyPicker" position="bottom">
        <van-picker
          :columns="varietyOptions"
          @confirm="onVarietyConfirm"
          @cancel="showVarietyPicker = false"
        />
      </van-popup>
      
      <!-- 规格选择器 -->
      <van-popup v-model:show="showSpecificationPicker" position="bottom">
        <van-picker
          :columns="specificationOptions"
          @confirm="onSpecificationConfirm"
          @cancel="showSpecificationPicker = false"
        />
      </van-popup>
      
      <!-- 性别选择器 -->
      <van-popup v-model:show="showGenderPicker" position="bottom">
        <van-picker
          :columns="genderOptions"
          @confirm="onGenderConfirm"
          @cancel="showGenderPicker = false"
        />
      </van-popup>
      
      <!-- 环境选择器 -->
      <van-popup v-model:show="showEnvironmentPicker" position="bottom">
        <van-picker
          :columns="environmentOptions"
          @confirm="onEnvironmentConfirm"
          @cancel="showEnvironmentPicker = false"
        />
      </van-popup>
      
      <!-- 要求选择器 -->
      <van-popup v-model:show="showRequirementPicker" position="bottom">
        <van-picker
          :columns="requirementOptions"
          @confirm="onRequirementConfirm"
          @cancel="showRequirementPicker = false"
        />
      </van-popup>
      
      <!-- 日期选择器 -->
      <van-popup v-model:show="showDatePicker" position="bottom">
        <van-date-picker
          v-model="selectedDate"
          title="选择到货日期"
          :min-date="minDate"
          @confirm="onDateConfirm"
          @cancel="showDatePicker = false"
        />
      </van-popup>
    </div>
  </app-layout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showSuccessToast, showDialog } from 'vant'
import AppLayout from '@/components/layout/AppLayout.vue'
import RegionPicker from '@/components/common/RegionPicker.vue'
import { createAnimalOrder } from '@/api/animal'
import {
  getAnimalBrands,
  getAnimalVarieties,
  getAnimalSpecifications,
  getAnimalRequirements,
  getEnvironmentTypes
} from '@/api/common'

const router = useRouter()
const formRef = ref(null)

/**
 * 表单数据
 */
const formData = ref({
  brand_id: null,
  variety_id: null,
  specification_id: null,
  gender: 2, // 默认不限
  supervisor_name: '',
  orderer_name: '',
  contact_phone: '',
  delivery_date: '',
  address: '',
  environment_id: null,
  requirement_id: null,
  remark: ''
})

/**
 * 地区选择值
 */
const regionValue = ref({
  province_id: null,
  city_id: null,
  district_id: null
})

/**
 * 品牌相关
 */
const brandOptions = ref([])
const brandName = ref('')
const showBrandPicker = ref(false)

/**
 * 品系相关
 */
const varietyOptions = ref([])
const varietyName = ref('')
const showVarietyPicker = ref(false)

/**
 * 规格相关
 */
const specificationOptions = ref([])
const specificationName = ref('')
const showSpecificationPicker = ref(false)

/**
 * 性别选项
 */
const genderOptions = ref([
  { text: '雌性', value: 0 },
  { text: '雄性', value: 1 },
  { text: '不限', value: 2 }
])
const genderName = ref('不限')
const showGenderPicker = ref(false)

/**
 * 环境相关
 */
const environmentOptions = ref([])
const environmentName = ref('')
const showEnvironmentPicker = ref(false)

/**
 * 要求相关
 */
const requirementOptions = ref([])
const requirementName = ref('')
const showRequirementPicker = ref(false)

/**
 * 日期选择相关
 */
const showDatePicker = ref(false)
const today = new Date()
// VanDatePicker 的 v-model 需要数组格式 [year, month, day]
const selectedDate = ref([today.getFullYear(), today.getMonth() + 1, today.getDate()])
// 但是 min-date 需要 Date 对象
const minDate = ref(new Date())

/**
 * 提交状态
 */
const submitting = ref(false)

/**
 * 手机号校验规则
 */
const phoneRules = [
  { required: true, message: '请输入联系电话' },
  { 
    validator: (val) => {
      if (!/^1[3-9]\d{9}$/.test(val)) {
        return '请输入正确的手机号'
      }
      return true
    }
  }
]

/**
 * 初始化数据
 */
onMounted(async () => {
  await Promise.all([
    loadBrands(),
    loadSpecifications(),
    loadEnvironments(),
    loadRequirements()
  ])
})

/**
 * 加载品牌列表
 */
async function loadBrands() {
  try {
    const data = await getAnimalBrands()
    brandOptions.value = (data || []).map(item => ({
      text: item.name,
      value: item.id
    }))
  } catch (error) {
    console.error('加载品牌列表失败:', error)
    showToast('加载品牌列表失败')
  }
}

/**
 * 根据品牌加载品系列表
 */
async function loadVarietiesByBrand() {
  if (!formData.value.brand_id) return
  
  try {
    const data = await getAnimalVarieties({
      brand_id: formData.value.brand_id
    })
    
    if (!data || data.length === 0) {
      showToast('该品牌暂无可用品系')
      return
    }
    
    varietyOptions.value = data.map(item => ({
      text: item.name,
      value: item.id
    }))
  } catch (error) {
    console.error('加载品系列表失败:', error)
    showToast('加载品系列表失败')
  }
}

/**
 * 加载规格列表
 */
async function loadSpecifications() {
  try {
    const data = await getAnimalSpecifications()
    specificationOptions.value = (data || []).map(item => ({
      text: item.name,
      value: item.id
    }))
  } catch (error) {
    console.error('加载规格列表失败:', error)
    showToast('加载规格列表失败')
  }
}

/**
 * 加载环境列表
 */
async function loadEnvironments() {
  try {
    const data = await getEnvironmentTypes()
    environmentOptions.value = (data || []).map(item => ({
      text: item.name,
      value: item.id
    }))
    
    // 默认选择第一个环境
    if (environmentOptions.value.length > 0) {
      formData.value.environment_id = environmentOptions.value[0].value
      environmentName.value = environmentOptions.value[0].text
    }
  } catch (error) {
    console.error('加载环境列表失败:', error)
    showToast('加载环境列表失败')
  }
}

/**
 * 加载要求列表
 */
async function loadRequirements() {
  try {
    const data = await getAnimalRequirements()
    requirementOptions.value = (data || []).map(item => ({
      text: item.name,
      value: item.id
    }))
    
    // 默认选择第一个要求
    if (requirementOptions.value.length > 0) {
      formData.value.requirement_id = requirementOptions.value[0].value
      requirementName.value = requirementOptions.value[0].text
    }
  } catch (error) {
    console.error('加载要求列表失败:', error)
    showToast('加载要求列表失败')
  }
}

/**
 * 选择品牌
 */
function onBrandConfirm({ selectedOptions }) {
  const selected = selectedOptions[0]
  formData.value.brand_id = selected.value
  brandName.value = selected.text
  showBrandPicker.value = false
  
  // 清空品系
  formData.value.variety_id = null
  varietyName.value = ''
  varietyOptions.value = []
  
  // 加载对应的品系
  loadVarietiesByBrand()
}

/**
 * 点击品系选择
 */
function handleVarietyClick() {
  if (!formData.value.brand_id) {
    showToast('请先选择品牌')
    return
  }
  
  if (varietyOptions.value.length === 0) {
    showToast('该品牌暂无可用品系')
    return
  }
  
  showVarietyPicker.value = true
}

/**
 * 选择品系
 */
function onVarietyConfirm({ selectedOptions }) {
  const selected = selectedOptions[0]
  formData.value.variety_id = selected.value
  varietyName.value = selected.text
  showVarietyPicker.value = false
}

/**
 * 选择规格
 */
function onSpecificationConfirm({ selectedOptions }) {
  const selected = selectedOptions[0]
  formData.value.specification_id = selected.value
  specificationName.value = selected.text
  showSpecificationPicker.value = false
}

/**
 * 选择性别
 */
function onGenderConfirm({ selectedOptions }) {
  const selected = selectedOptions[0]
  formData.value.gender = selected.value
  genderName.value = selected.text
  showGenderPicker.value = false
}

/**
 * 选择环境
 */
function onEnvironmentConfirm({ selectedOptions }) {
  const selected = selectedOptions[0]
  formData.value.environment_id = selected.value
  environmentName.value = selected.text
  showEnvironmentPicker.value = false
}

/**
 * 选择要求
 */
function onRequirementConfirm({ selectedOptions }) {
  const selected = selectedOptions[0]
  formData.value.requirement_id = selected.value
  requirementName.value = selected.text
  showRequirementPicker.value = false
}

/**
 * 确认选择日期
 * @param {Object} value - 选择的日期对象，包含 selectedValues 数组
 */
function onDateConfirm({ selectedValues }) {
  const [year, month, day] = selectedValues
  const monthStr = String(month).padStart(2, '0')
  const dayStr = String(day).padStart(2, '0')
  formData.value.delivery_date = `${year}-${monthStr}-${dayStr}`
  showDatePicker.value = false
}

/**
 * 提交表单
 */
async function handleSubmit() {
  try {
    // 表单验证
    await formRef.value?.validate()
    
    // 验证地区选择
    if (!regionValue.value.province_id || !regionValue.value.city_id || !regionValue.value.district_id) {
      showToast('请选择完整的省市区')
      return
    }
    
    // 二次确认
    await showDialog({
      title: '确认提交',
      message: '确认提交动物订购订单吗?',
      confirmButtonText: '确认',
      cancelButtonText: '取消'
    })
    
    submitting.value = true
    
    // 组装提交数据
    const submitData = {
      brand_id: formData.value.brand_id,
      variety_id: formData.value.variety_id,
      specification_id: formData.value.specification_id,
      gender: formData.value.gender,
      supervisor_name: formData.value.supervisor_name,
      orderer_name: formData.value.orderer_name,
      contact_phone: formData.value.contact_phone,
      delivery_date: formData.value.delivery_date,
      province_id: regionValue.value.province_id,
      city_id: regionValue.value.city_id,
      district_id: regionValue.value.district_id,
      address: formData.value.address,
      environment_id: formData.value.environment_id,
      requirement_id: formData.value.requirement_id,
      remark: formData.value.remark
    }
    
    // 提交订单
    await createAnimalOrder(submitData)
    
    showSuccessToast('提交成功，请等待处理')
    
    // 延迟返回,让用户看到成功提示
    setTimeout(() => {
      router.back()
    }, 1500)
  } catch (error) {
    if (error !== 'cancel') {
      console.error('提交失败:', error)
      showToast(error.message || '提交失败')
    }
  } finally {
    submitting.value = false
  }
}
</script>

<style lang="less" scoped>
.animal-page {
  padding-top: @padding-md;
  
  .page-title {
    font-size: @font-size-xl;
    font-weight: 600;
    margin-bottom: @padding-lg;
    
    @media (max-width: 767px) {
      display: none;
    }
  }
  
  .submit-section {
    margin-top: @padding-xl;
    padding: 0 @padding-md;
  }
  
  :deep(.van-cell-group) {
    margin-bottom: @padding-md;
  }
}
</style>
