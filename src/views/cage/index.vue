<template>
  <app-layout>
    <div class="cage-page page-content">
      <page-title title="笼位预约" @back="router.back()" />
      
      <!-- 查看收费标准入口 -->
      <div class="price-link-section">
        <div class="price-link-section-text" @click="viewPrice">
          <span>查看收费标准</span>
          <van-icon name="arrow" />
        </div>
      </div>
      
      <van-form @submit="handleSubmit" ref="formRef">
        <van-cell-group>
          <!-- 动物类型 -->
          <universal-picker
            v-model="formData.animal_type_id"
            :columns="animalTypeOptions"
            label="动物类型"
            placeholder="请选择动物类型"
            required
            :rules="[{ required: true, message: '请选择动物类型' }]"
            @change="onAnimalTypeChange"
          />
          
          <!-- 环境类型 -->
          <universal-picker
            v-model="formData.environment_id"
            :columns="environmentOptions"
            label="环境类型"
            placeholder="请先选择动物类型"
            required
            :disabled="!formData.animal_type_id"
            :rules="[{ required: true, message: '请选择环境类型' }]"
            @change="onEnvironmentChange"
          />
          
          <!-- 笼位用途 -->
          <universal-picker
            v-model="formData.purpose_id"
            :columns="purposeOptions"
            label="笼位用途"
            placeholder="请选择笼位用途"
            required
            :rules="[{ required: true, message: '请选择笼位用途' }]"
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
          
          <!-- 日期选择区域 -->
          <div v-if="formData.animal_type_id && formData.environment_id" class="date-picker-section">
            <!-- 开始日期 -->
            <universal-date-picker
              v-model="formData.start_date"
              label="开始日期"
              placeholder="请选择开始日期"
              title="选择开始日期"
              required
              :min-date="minDate"
              :rules="[{ required: true, message: '请选择开始日期' }]"
            />
            
            <!-- 结束日期 -->
            <universal-date-picker
              v-model="formData.end_date"
              label="结束日期"
              placeholder="请选择结束日期"
              title="选择结束日期"
              :disabled="isLongTerm"
              :min-date="endMinDate"
            />
            
            <!-- 长期预约选项 -->
            <van-cell>
              <template #title>
                <div class="long-term-checkbox">
                  <van-checkbox v-model="isLongTerm" @change="onLongTermChange" />
                  <span class="checkbox-label">长期预约</span>
                </div>
              </template>
            </van-cell>
          </div>
          
          <!-- 可用数量提示 -->
          <van-cell v-if="showQuantityHint" title="可用笼位数量">
            <template #value>
              <span :class="availableQuantity > 0 ? 'text-success' : 'text-danger'">
                {{ availableQuantity }} 个
              </span>
            </template>
          </van-cell>
          
          <!-- 预约数量 -->
          <van-field
            v-if="showQuantityInput"
            v-model="formData.quantity"
            type="number"
            label="预约数量"
            placeholder="请输入预约数量"
            required
            :rules="quantityRules"
          />
        </van-cell-group>
        
        <div class="submit-btn">
          <van-button 
            block 
            round 
            type="primary" 
            native-type="submit"
            :loading="submitLoading"
            :disabled="availableQuantity === 0"
          >
            提交预约
          </van-button>
        </div>
      </van-form>
    </div>
  </app-layout>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showDialog } from 'vant'
import AppLayout from '@/components/layout/AppLayout.vue'
import UniversalPicker from '@/components/common/UniversalPicker.vue'
import UniversalDatePicker from '@/components/common/UniversalDatePicker.vue'
import { 
  getEnvironmentsByAnimalType,
  getCageAvailableQuantity,
  createCageOrder 
} from '@/api/cage'
import { 
  getAnimalTypes, 
  getCagePurposes
} from '@/api/common'
import PageTitle from '@/components/common/PageTitle.vue'

const router = useRouter()
const formRef = ref(null)

/**
 * 表单数据
 */
const formData = ref({
  animal_type_id: null,
  environment_id: null,
  start_date: '',
  end_date: '',
  quantity: '',
  purpose_id: null,
  remark: ''
})

/**
 * 动物类型选项
 */
const animalTypeOptions = ref([])

/**
 * 环境类型选项
 */
const environmentOptions = ref([])

/**
 * 笼位用途选项
 */
const purposeOptions = ref([])

/**
 * 提交状态
 */
const submitLoading = ref(false)

/**
 * 是否长期预约
 */
const isLongTerm = ref(false)

/**
 * 最小日期（今天）
 */
const minDate = new Date()

/**
 * 结束日期的最小日期（开始日期）
 */
const endMinDate = computed(() => {
  if (formData.value.start_date) {
    return new Date(formData.value.start_date)
  }
  return new Date()
})

/**
 * 可用数量
 */
const availableQuantity = ref(null)

/**
 * 是否正在查询可用数量
 */
const loadingQuantity = ref(false)

/**
 * 防抖定时器
 */
let debounceTimer = null

/**
 * 是否显示数量提示
 */
const showQuantityHint = computed(() => {
  return formData.value.start_date && availableQuantity.value !== null
})

/**
 * 是否显示数量输入框
 */
const showQuantityInput = computed(() => {
  return formData.value.start_date && (isLongTerm.value || formData.value.end_date)
})

/**
 * 数量校验规则
 */
const quantityRules = computed(() => [
  { required: true, message: '请输入预约数量' },
  { 
    validator: (val) => {
      if (!val || val <= 0) {
        return '数量必须大于0'
      }
      if (availableQuantity.value !== null && val > availableQuantity.value) {
        return `数量不能超过可用数量(${availableQuantity.value})`
      }
      return true
    }
  }
])

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
  await Promise.all([
    loadAnimalTypes(),
    loadPurposes()
  ])
})

/**
 * 监听日期变化，查询可用数量
 */
watch(
  () => [formData.value.animal_type_id, formData.value.environment_id, formData.value.start_date, formData.value.end_date, isLongTerm.value],
  () => {
    // 清空旧的防抖定时器
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }
    
    // 300ms 防抖
    debounceTimer = setTimeout(() => {
      fetchAvailableQuantity()
    }, 300)
  }
)

/**
 * 加载动物类型列表
 */
async function loadAnimalTypes() {
  try {
    const data = await getAnimalTypes()
    animalTypeOptions.value = (data || []).map(item => ({
      text: item.name,
      value: item.id
    }))
  } catch (error) {
    console.error('加载动物类型失败:', error)
    showToast('加载动物类型失败')
  }
}

/**
 * 加载笼位用途列表
 */
async function loadPurposes() {
  try {
    const data = await getCagePurposes()
    purposeOptions.value = (data || []).map(item => ({
      text: item.name,
      value: item.id
    }))
    
    // 默认选择第一个用途
    if (purposeOptions.value.length > 0) {
      formData.value.purpose_id = purposeOptions.value[0].value
    }
  } catch (error) {
    console.error('加载笼位用途失败:', error)
    showToast('加载笼位用途失败')
  }
}

/**
 * 动物类型改变事件
 */
function onAnimalTypeChange({ selectedOption }) {
  // 清空环境和后续选项
  resetFromEnvironment()
  
  // 加载对应的环境类型
  loadEnvironmentsByAnimalType()
}

/**
 * 根据动物类型加载环境类型
 */
async function loadEnvironmentsByAnimalType() {
  if (!formData.value.animal_type_id) return
  
  try {
    const data = await getEnvironmentsByAnimalType({
      animal_type_id: formData.value.animal_type_id
    })
    
    if (!data || data.length === 0) {
      environmentOptions.value = []
      showToast('该动物类型暂无可用环境')
      return
    }
    
    environmentOptions.value = data.map(item => ({
      text: item.name,
      value: item.id
    }))
  } catch (error) {
    console.error('加载环境类型失败:', error)
    showToast('加载环境类型失败')
  }
}

/**
 * 环境类型改变事件
 */
function onEnvironmentChange({ selectedOption }) {
  // 清空日期和数量
  resetDateTime()
}

/**
 * 长期预约改变事件
 */
function onLongTermChange(checked) {
  if (checked) {
    // 勾选长期预约，清空结束日期
    formData.value.end_date = ''
  }
}

/**
 * 查询可用数量
 */
async function fetchAvailableQuantity() {
  // 必须选择动物类型、环境类型和开始日期
  if (!formData.value.animal_type_id || !formData.value.environment_id || !formData.value.start_date) {
    availableQuantity.value = null
    return
  }
  
  // 如果不是长期预约，必须选择结束日期
  if (!isLongTerm.value && !formData.value.end_date) {
    availableQuantity.value = null
    return
  }
  
  try {
    loadingQuantity.value = true
    
    const params = {
      animal_type_id: formData.value.animal_type_id,
      environment_id: formData.value.environment_id,
      start_date: formData.value.start_date
    }
    
    // 如果不是长期预约，传递结束日期
    if (!isLongTerm.value && formData.value.end_date) {
      params.end_date = formData.value.end_date
    }
    
    const data = await getCageAvailableQuantity(params)
    availableQuantity.value = data.available_quantity || 0
    
    // 如果可用数量为0，提示用户
    if (availableQuantity.value === 0) {
      showToast('该时间段笼位已满，请选择其他时间')
    }
  } catch (error) {
    console.error('查询可用数量失败:', error)
    availableQuantity.value = null
  } finally {
    loadingQuantity.value = false
  }
}

/**
 * 重置环境及后续选项
 */
function resetFromEnvironment() {
  formData.value.environment_id = null
  environmentOptions.value = []
  resetDateTime()
}

/**
 * 重置日期时间选择
 */
function resetDateTime() {
  formData.value.start_date = ''
  formData.value.end_date = ''
  formData.value.quantity = ''
  isLongTerm.value = false
  availableQuantity.value = null
}

/**
 * 提交表单
 */
async function handleSubmit() {
  try {
    // 表单验证
    await formRef.value?.validate()
    
    // 验证开始日期
    if (!formData.value.start_date) {
      showToast('请选择开始日期')
      return
    }
    
    // 验证结束日期（非长期预约时）
    if (!isLongTerm.value && !formData.value.end_date) {
      showToast('请选择结束日期或勾选长期预约')
      return
    }
    
    // 验证可用数量
    if (availableQuantity.value === null) {
      showToast('正在查询可用数量，请稍候')
      return
    }
    
    if (availableQuantity.value === 0) {
      showToast('该时间段笼位已满，无法预约')
      return
    }
    
    // 二次确认
    const period = isLongTerm.value ? '长期预约' : `${formData.value.start_date} 至 ${formData.value.end_date}`
    await showDialog({
      title: '确认提交',
      message: `确认预约 ${formData.value.quantity} 个笼位吗?\n预约期限: ${period}`,
      confirmButtonText: '确认',
      cancelButtonText: '取消'
    })
    
    submitLoading.value = true
    
    // 组装提交数据
    const submitData = {
      animal_type_id: formData.value.animal_type_id,
      environment_id: formData.value.environment_id,
      quantity: Number(formData.value.quantity),
      purpose_id: formData.value.purpose_id,
      start_date: formData.value.start_date,
      end_date: isLongTerm.value ? null : formData.value.end_date,
      remark: formData.value.remark
    }
    
    // 提交订单
    await createCageOrder(submitData)
    
    showToast('提交成功,请等待审核')
    
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
    submitLoading.value = false
  }
}
</script>

<style lang="less" scoped>
.cage-page {
  padding-top: @padding-md;
  
  .submit-btn {
    margin-top: @padding-lg;
  }
  
  .text-success {
    color: @success-color;
  }
  
  .text-danger {
    color: @danger-color;
  }
  
  .date-picker-section {
    background-color: var(--bg-color-white);
    
    .long-term-checkbox {
      display: flex;
      align-items: center;
      gap: 8px;
      
      .checkbox-label {
        font-size: 14px;
        color: var(--text-color);
      }
    }
  }
  
  :deep(.van-cell-group) {
    margin-bottom: @padding-md;
  }
}
</style>
