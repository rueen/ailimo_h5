<template>
  <app-layout>
    <div class="cage-page page-content">
      <page-title title="笼位预约" @back="router.back()" />
      <van-form @submit="handleSubmit" ref="formRef">
        <van-cell-group>
          <!-- 动物类型 -->
          <van-field
            v-model="animalTypeName"
            label="动物类型"
            placeholder="请选择动物类型"
            readonly
            is-link
            required
            :rules="[{ required: true, message: '请选择动物类型' }]"
            @click="showAnimalTypePicker = true"
          />
          
          <!-- 环境类型 -->
          <van-field
            v-model="environmentName"
            label="环境类型"
            placeholder="请先选择动物类型"
            readonly
            is-link
            required
            :rules="[{ required: true, message: '请选择环境类型' }]"
            :disabled="!formData.animal_type_id"
            @click="handleEnvironmentClick"
          />
          
          <!-- 笼位用途 -->
          <van-field
            v-model="purposeName"
            label="笼位用途"
            placeholder="请选择笼位用途"
            readonly
            is-link
            required
            :rules="[{ required: true, message: '请选择笼位用途' }]"
            @click="showPurposePicker = true"
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
          
          <!-- 时间选择 -->
          <div v-if="formData.animal_type_id && formData.environment_id" class="time-picker-section">
            <date-time-slot-picker
              v-model="dateTimeValue"
              :advance-days="advanceDays"
              :show-remaining="true"
              :multiple="true"
              :fetch-slots="fetchTimeSlots"
            />
          </div>
          
          <!-- 可用数量提示 -->
          <van-cell v-if="showQuantityHint" title="可用笼位数量">
            <template #value>
              <span :class="availableQuantity > 0 ? 'text-success' : 'text-danger'">
                {{ availableQuantity }} 个
              </span>
            </template>
          </van-cell>
          
          <!-- 租赁数量 -->
          <van-field
            v-if="showQuantityInput"
            v-model="formData.quantity"
            type="number"
            label="租赁数量"
            placeholder="请输入租赁数量"
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
          >
            提交预约
          </van-button>
        </div>
      </van-form>
      
      <!-- 动物类型选择器 -->
      <van-popup v-model:show="showAnimalTypePicker" position="bottom">
        <van-picker
          :columns="animalTypeOptions"
          @confirm="onAnimalTypeConfirm"
          @cancel="showAnimalTypePicker = false"
        />
      </van-popup>
      
      <!-- 环境类型选择器 -->
      <van-popup v-model:show="showEnvironmentPicker" position="bottom">
        <van-picker
          :columns="environmentOptions"
          @confirm="onEnvironmentConfirm"
          @cancel="showEnvironmentPicker = false"
        />
      </van-popup>
      
      <!-- 笼位用途选择器 -->
      <van-popup v-model:show="showPurposePicker" position="bottom">
        <van-picker
          :columns="purposeOptions"
          @confirm="onPurposeConfirm"
          @cancel="showPurposePicker = false"
        />
      </van-popup>
    </div>
  </app-layout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showDialog } from 'vant'
import AppLayout from '@/components/layout/AppLayout.vue'
import DateTimeSlotPicker from '@/components/common/DateTimeSlotPicker.vue'
import { 
  getEnvironmentsByAnimalType,
  getCageAvailableTimeSlots,
  createCageOrder 
} from '@/api/cage'
import { 
  getAnimalTypes, 
  getCagePurposes
} from '@/api/common'
import { useConfigStore } from '@/stores/config'
import PageTitle from '@/components/common/PageTitle.vue'

const router = useRouter()
const configStore = useConfigStore()
const formRef = ref(null)

/**
 * 表单数据
 */
const formData = ref({
  animal_type_id: null,
  environment_id: null,
  quantity: '',
  purpose_id: null,
  remark: ''
})

/**
 * 日期时间选择器的值
 */
const dateTimeValue = ref({
  date: '',
  slots: []
})

/**
 * 动物类型相关
 */
const animalTypeOptions = ref([])
const animalTypeName = ref('')
const showAnimalTypePicker = ref(false)

/**
 * 环境类型相关
 */
const environmentOptions = ref([])
const environmentName = ref('')
const showEnvironmentPicker = ref(false)

/**
 * 笼位用途相关
 */
const purposeOptions = ref([])
const purposeName = ref('')
const showPurposePicker = ref(false)

/**
 * 时间段列表（缓存当前日期的时间段数据）
 */
const currentTimeSlots = ref([])

/**
 * 提交状态
 */
const submitLoading = ref(false)

/**
 * 提前预约天数（从全局配置获取）
 */
const advanceDays = computed(() => {
  return configStore.advanceDays.cage_advance_days || 7
})

/**
 * 是否显示数量提示
 */
const showQuantityHint = computed(() => {
  return dateTimeValue.value.slots.length > 0 && currentTimeSlots.value.length > 0
})

/**
 * 是否显示数量输入框
 */
const showQuantityInput = computed(() => {
  return dateTimeValue.value.slots.length > 0
})

/**
 * 可用数量(取所选时间段中的最小可用数量)
 */
const availableQuantity = computed(() => {
  if (dateTimeValue.value.slots.length === 0 || currentTimeSlots.value.length === 0) {
    return 0
  }
  
  const quantities = dateTimeValue.value.slots.map(slot => {
    return slot.remaining || 0
  })
  
  return Math.min(...quantities)
})

/**
 * 数量校验规则
 */
const quantityRules = computed(() => [
  { required: true, message: '请输入租赁数量' },
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
 * 初始化数据
 */
onMounted(async () => {
  await Promise.all([
    loadAnimalTypes(),
    loadPurposes(),
    configStore.loadAdvanceDays()
  ])
})

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
      purposeName.value = purposeOptions.value[0].text
    }
  } catch (error) {
    console.error('加载笼位用途失败:', error)
    showToast('加载笼位用途失败')
  }
}

/**
 * 选择动物类型
 */
function onAnimalTypeConfirm({ selectedOptions }) {
  const selected = selectedOptions[0]
  formData.value.animal_type_id = selected.value
  animalTypeName.value = selected.text
  showAnimalTypePicker.value = false
  
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
 * 点击环境类型
 */
function handleEnvironmentClick() {
  if (!formData.value.animal_type_id) {
    showToast('请先选择动物类型')
    return
  }
  
  if (environmentOptions.value.length === 0) {
    showToast('该动物类型暂无可用环境')
    return
  }
  
  showEnvironmentPicker.value = true
}

/**
 * 选择环境类型
 */
function onEnvironmentConfirm({ selectedOptions }) {
  const selected = selectedOptions[0]
  formData.value.environment_id = selected.value
  environmentName.value = selected.text
  showEnvironmentPicker.value = false
  
  // 清空时间选择
  resetDateTime()
}

/**
 * 选择笼位用途
 */
function onPurposeConfirm({ selectedOptions }) {
  const selected = selectedOptions[0]
  formData.value.purpose_id = selected.value
  purposeName.value = selected.text
  showPurposePicker.value = false
}

/**
 * 获取时间段数据（供DateTimeSlotPicker组件调用）
 * @param {string} date - 日期
 */
async function fetchTimeSlots(date) {
  if (!formData.value.animal_type_id || !formData.value.environment_id) {
    return []
  }
  
  try {
    const data = await getCageAvailableTimeSlots({
      animal_type_id: formData.value.animal_type_id,
      environment_id: formData.value.environment_id,
      date
    })
    
    // 转换数据格式，添加remaining字段
    const slots = (data.time_slots || []).map(slot => ({
      ...slot,
      available: slot.available_quantity > 0,
      remaining: slot.available_quantity
    }))
    
    // 缓存当前时间段数据
    currentTimeSlots.value = slots
    
    return slots
  } catch (error) {
    console.error('加载时间段失败:', error)
    throw error
  }
}

/**
 * 重置环境及后续选项
 */
function resetFromEnvironment() {
  formData.value.environment_id = null
  environmentName.value = ''
  environmentOptions.value = []
  resetDateTime()
}

/**
 * 重置日期时间选择
 */
function resetDateTime() {
  dateTimeValue.value = {
    date: '',
    slots: []
  }
  currentTimeSlots.value = []
  formData.value.quantity = ''
}

/**
 * 提交表单
 */
async function handleSubmit() {
  try {
    // 表单验证
    await formRef.value?.validate()
    
    // 验证日期
    if (!dateTimeValue.value.date) {
      showToast('请选择预约日期')
      return
    }

    // 验证时间段
    if (!dateTimeValue.value.slots || dateTimeValue.value.slots.length === 0) {
      showToast('请至少选择一个时间段')
      return
    }
    
    // 二次确认
    await showDialog({
      title: '确认提交',
      message: `确认预约 ${formData.value.quantity} 个笼位吗?`,
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
      reservation_date: dateTimeValue.value.date,
      time_slots: dateTimeValue.value.slots.map(slot => slot.display_time),
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
  .submit-btn {
    margin-top: @padding-lg;
  }
  
  .text-success {
    color: @success-color;
  }
  
  .text-danger {
    color: @danger-color;
  }
  
  .time-picker-section {
    margin: @padding-lg 0;
    padding: @padding-md;
    background-color: var(--bg-color-white);
    border-radius: @border-radius-md;
  }
  
  :deep(.van-cell-group) {
    margin-bottom: @padding-md;
  }
}
</style>
