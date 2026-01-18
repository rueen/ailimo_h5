<template>
  <app-layout>
    <div class="reagent-page page-content">
      <h2 class="page-title">试剂耗材订购</h2>
      
      <van-form @submit="handleSubmit" ref="formRef">
        <van-cell-group inset>
          <!-- 试剂耗材名称 -->
          <van-field
            v-model="formData.name"
            label="名称"
            placeholder="请输入试剂耗材名称"
            required
            :rules="[{ required: true, message: '请输入试剂耗材名称' }]"
          />
          
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
          
          <!-- 数量 -->
          <van-field
            v-model="formData.quantity"
            type="number"
            label="数量"
            placeholder="请输入数量"
            required
            :rules="quantityRules"
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
      
      <!-- 规格选择器 -->
      <van-popup v-model:show="showSpecificationPicker" position="bottom">
        <van-picker
          :columns="specificationOptions"
          @confirm="onSpecificationConfirm"
          @cancel="showSpecificationPicker = false"
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
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showSuccessToast, showDialog } from 'vant'
import AppLayout from '@/components/layout/AppLayout.vue'
import RegionPicker from '@/components/common/RegionPicker.vue'
import { createReagentOrder } from '@/api/reagent'
import {
  getReagentBrands,
  getReagentSpecifications
} from '@/api/common'

const router = useRouter()
const formRef = ref(null)

/**
 * 表单数据
 */
const formData = ref({
  name: '',
  brand_id: null,
  specification_id: null,
  quantity: '',
  orderer_name: '',
  contact_phone: '',
  delivery_date: '',
  address: '',
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
 * 规格相关
 */
const specificationOptions = ref([])
const specificationName = ref('')
const showSpecificationPicker = ref(false)

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
 * 数量校验规则
 */
const quantityRules = [
  { required: true, message: '请输入数量' },
  { 
    validator: (val) => {
      if (!val || val <= 0) {
        return '数量必须大于0'
      }
      return true
    }
  }
]

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
    loadSpecifications()
  ])
})

/**
 * 加载品牌列表
 */
async function loadBrands() {
  try {
    const data = await getReagentBrands()
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
 * 加载规格列表
 */
async function loadSpecifications() {
  try {
    const data = await getReagentSpecifications()
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
 * 选择品牌
 */
function onBrandConfirm({ selectedOptions }) {
  const selected = selectedOptions[0]
  formData.value.brand_id = selected.value
  brandName.value = selected.text
  showBrandPicker.value = false
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
      message: `确认订购 ${formData.value.quantity} 件 ${formData.value.name} 吗?`,
      confirmButtonText: '确认',
      cancelButtonText: '取消'
    })
    
    submitting.value = true
    
    // 组装提交数据
    const submitData = {
      name: formData.value.name,
      brand_id: formData.value.brand_id,
      specification_id: formData.value.specification_id,
      quantity: Number(formData.value.quantity),
      orderer_name: formData.value.orderer_name,
      contact_phone: formData.value.contact_phone,
      delivery_date: formData.value.delivery_date,
      province_id: regionValue.value.province_id,
      city_id: regionValue.value.city_id,
      district_id: regionValue.value.district_id,
      address: formData.value.address,
      remark: formData.value.remark
    }
    
    // 提交订单
    await createReagentOrder(submitData)
    
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
.reagent-page {
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
