<template>
  <app-layout>
    <div class="reagent-page page-content">
      <page-title title="试剂耗材订购" @back="router.back()" />
      
      <!-- 查看收费标准入口 -->
      <div class="price-link-section">
        <div class="price-link-section-text" @click="viewPrice">
          <span>查看收费标准</span>
          <van-icon name="arrow" />
        </div>
      </div>
      
      <van-form @submit="handleSubmit" ref="formRef">
        <van-cell-group>
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
            v-model="formData.brand_name"
            label="品牌"
            placeholder="请输入品牌名称"
            required
            :rules="[{ required: true, message: '请输入品牌名称' }]"
          />
          
          <!-- 规格 -->
          <van-field
            v-model="formData.specification_name"
            label="规格"
            placeholder="请输入规格名称"
            required
            :rules="[{ required: true, message: '请输入规格名称' }]"
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
import { createReagentOrder } from '@/api/reagent'
import {
  getReagentBrands,
  getReagentSpecifications
} from '@/api/common'
import PageTitle from '@/components/common/PageTitle.vue'

const router = useRouter()
const formRef = ref(null)

/**
 * 表单数据
 */
const formData = ref({
  name: '',
  brand_name: '',
  specification_name: '',
  quantity: '',
  orderer_name: '',
  contact_phone: '',
  delivery_date: '',
  address: '西园五路6号奥强大厦2号楼19楼',
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
 * 规格选项
 */
const specificationOptions = ref([])

/**
 * 最小日期（今天）
 */
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
 * 查看收费标准
 */
function viewPrice() {
  router.push('/price')
}

/**
 * 初始化数据
 */
onMounted(async () => {

})

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
      brand_name: formData.value.brand_name,
      specification_name: formData.value.specification_name,
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
  
  .submit-section {
    margin-top: @padding-xl;
    padding: 0 @padding-md;
  }
  
  :deep(.van-cell-group) {
    margin-bottom: @padding-md;
  }
}
</style>
