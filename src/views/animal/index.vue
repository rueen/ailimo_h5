<template>
  <app-layout>
    <div class="animal-page page-content">
      <page-title title="动物订购" @back="router.back()" />
      
      <!-- 查看收费标准入口 -->
      <div class="price-link-section">
        <div class="price-link-section-text" @click="viewPrice">
          <span>查看收费标准</span>
          <van-icon name="arrow" />
        </div>
      </div>
      
      <van-form @submit="handleSubmit" ref="formRef">
        <van-cell-group>
          <!-- 品牌 -->
          <universal-picker
            v-model="formData.brand_id"
            :columns="brandOptions"
            label="品牌"
            placeholder="请选择品牌"
            required
            :rules="[{ required: true, message: '请选择品牌' }]"
            @change="onBrandChange"
          />
          
          <!-- 品系 -->
          <universal-picker
            v-model="formData.variety_id"
            :columns="varietyOptions"
            label="品系"
            placeholder="请先选择品牌"
            required
            :disabled="!formData.brand_id"
            :rules="[{ required: true, message: '请选择品系' }]"
          />
          
          <!-- 规格 -->
          <universal-picker
            v-model="formData.specification_id"
            :columns="specificationOptions"
            label="规格"
            placeholder="请选择规格"
            required
            :rules="[{ required: true, message: '请选择规格' }]"
          />
          
          <!-- 性别 -->
          <universal-picker
            v-model="formData.gender"
            :columns="genderOptions"
            label="性别"
            placeholder="请选择性别"
            required
          />
          
          <!-- 环境 -->
          <universal-picker
            v-model="formData.environment_id"
            :columns="environmentOptions"
            label="环境"
            placeholder="请选择环境"
            required
            :rules="[{ required: true, message: '请选择环境' }]"
          />
          
          <!-- 要求 -->
          <universal-picker
            v-model="formData.requirement_id"
            :columns="requirementOptions"
            label="要求"
            placeholder="请选择要求"
            required
            :rules="[{ required: true, message: '请选择要求' }]"
          />
          
          <!-- 是否打耳标 -->
          <van-cell title="是否打耳标">
            <template #value>
              <van-switch v-model="formData.need_ear_tag" />
            </template>
          </van-cell>
          
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
          <universal-date-picker
            v-model="formData.delivery_date"
            label="到货日期"
            placeholder="请选择到货日期"
            title="选择到货日期"
            required
            :min-date="minDate"
            :rules="[{ required: true, message: '请选择到货日期' }]"
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
    </div>
  </app-layout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showSuccessToast, showDialog } from 'vant'
import AppLayout from '@/components/layout/AppLayout.vue'
import RegionPicker from '@/components/common/RegionPicker.vue'
import UniversalPicker from '@/components/common/UniversalPicker.vue'
import UniversalDatePicker from '@/components/common/UniversalDatePicker.vue'
import { createAnimalOrder } from '@/api/animal'
import {
  getAnimalBrands,
  getAnimalVarieties,
  getAnimalSpecifications,
  getAnimalRequirements,
  getEnvironmentTypes
} from '@/api/common'
import PageTitle from '@/components/common/PageTitle.vue'

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
  address: '西园五路6号奥强大厦2号楼19楼',
  environment_id: null,
  requirement_id: null,
  need_ear_tag: false, // 是否打耳标，默认否
  remark: ''
})

/**
 * 地区选择值
 */
const regionValue = ref({
  province_id: 330000,
  city_id: 330100,
  district_id: 330106
})

/**
 * 品牌选项
 */
const brandOptions = ref([])

/**
 * 品系选项
 */
const varietyOptions = ref([])

/**
 * 规格选项
 */
const specificationOptions = ref([])

/**
 * 性别选项
 */
const genderOptions = ref([
  { text: '雌性', value: 0 },
  { text: '雄性', value: 1 },
  { text: '不限', value: 2 }
])

/**
 * 环境选项
 */
const environmentOptions = ref([])

/**
 * 要求选项
 */
const requirementOptions = ref([])

/**
 * 最小日期（今天）
 */
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
      varietyOptions.value = []
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
    }
  } catch (error) {
    console.error('加载要求列表失败:', error)
    showToast('加载要求列表失败')
  }
}

/**
 * 品牌改变事件
 */
function onBrandChange({ selectedOption }) {
  // 清空品系
  formData.value.variety_id = null
  varietyOptions.value = []
  
  // 加载对应的品系
  loadVarietiesByBrand()
}

/**
 * 查看收费标准
 */
function viewPrice() {
  router.push('/price')
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
      need_ear_tag: formData.value.need_ear_tag ? 1 : 0,
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
  
  .submit-section {
    margin-top: @padding-xl;
    padding: 0 @padding-md;
  }
  
  :deep(.van-cell-group) {
    margin-bottom: @padding-md;
  }
}
</style>
