<template>
  <app-layout>
    <div class="experiment-page page-content">
      <page-title title="实验代操作" @back="router.back()" />
      
      <van-form @submit="handleSubmit" ref="formRef">
        <van-cell-group>
          <!-- 操作内容 -->
          <universal-picker
            v-model="formData.operation_content_id"
            :columns="operationContentOptions"
            label="操作内容"
            placeholder="请选择操作内容"
            required
            :rules="[{ required: true, message: '请选择操作内容' }]"
            @change="onOperationContentChange"
          />
          
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
          
          <!-- 动物数量 -->
          <van-field
            v-model="formData.quantity"
            type="number"
            label="动物数量"
            placeholder="请输入动物数量"
            required
            :rules="quantityRules"
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
          <div class="time-picker-section">
            <date-time-slot-picker
              v-model="dateTimeValue"
              :advance-days="advanceDays"
              :show-remaining="false"
              :multiple="true"
              :fetch-slots="fetchTimeSlots"
            />
          </div>
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
            提交预约
          </van-button>
        </div>
      </van-form>
    </div>
  </app-layout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showSuccessToast, showDialog } from 'vant'
import AppLayout from '@/components/layout/AppLayout.vue'
import UniversalPicker from '@/components/common/UniversalPicker.vue'
import DateTimeSlotPicker from '@/components/common/DateTimeSlotPicker.vue'
import { getExperimentTimeSlots, createExperimentOrder } from '@/api/experiment'
import { getAnimalTypes, getOperationContents } from '@/api/common'
import { useConfigStore } from '@/stores/config'
import PageTitle from '@/components/common/PageTitle.vue'
import { flattenTimeSlots, formatSlotsForConfirm } from '@/utils/timeSlot'

const router = useRouter()
const configStore = useConfigStore()
const formRef = ref(null)

/**
 * 表单数据
 */
const formData = ref({
  operation_content_id: null,
  animal_type_id: null,
  quantity: '',
  remark: ''
})

/**
 * 日期时间选择器的值 { "2026-01-10": [slot1, slot2], "2026-01-11": [slot3] }
 */
const dateTimeValue = ref({})

/**
 * 操作内容选项
 */
const operationContentOptions = ref([])

/**
 * 动物类型选项
 */
const animalTypeOptions = ref([])

/**
 * 所有时间段列表（预设的时间段配置）
 */
const allTimeSlots = ref([])

/**
 * 提交状态
 */
const submitting = ref(false)

/**
 * 提前预约天数（从全局配置获取）
 */
const advanceDays = computed(() => {
  return configStore.advanceDays.experiment_advance_days || 7
})

/**
 * 数量校验规则
 */
const quantityRules = [
  { required: true, message: '请输入动物数量' },
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
 * 初始化数据
 */
onMounted(async () => {
  await Promise.all([
    loadOperationContents(),
    loadAnimalTypes(),
    loadTimeSlots(),
    configStore.loadAdvanceDays()
  ])
})

/**
 * 加载操作内容列表
 */
async function loadOperationContents() {
  try {
    const data = await getOperationContents()
    operationContentOptions.value = (data || []).map(item => ({
      text: item.name,
      value: item.id
    }))
  } catch (error) {
    console.error('加载操作内容失败:', error)
    showToast('加载操作内容失败')
  }
}

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
 * 加载时间段列表（预设的时间段配置）
 */
async function loadTimeSlots() {
  try {
    const data = await getExperimentTimeSlots()
    allTimeSlots.value = data || []
  } catch (error) {
    console.error('加载时间段失败:', error)
    showToast('加载时间段失败')
  }
}

/**
 * 操作内容改变事件
 */
function onOperationContentChange({ selectedOption }) {
  // 清空时间选择
  resetDateTime()
}

/**
 * 动物类型改变事件
 */
function onAnimalTypeChange({ selectedOption }) {
  // 清空时间选择
  resetDateTime()
}

/**
 * 获取时间段数据（供DateTimeSlotPicker组件调用）
 * @param {string} date - 日期（实验代操作不需要查询可用时间段，直接返回预设的时间段）
 */
async function fetchTimeSlots(date) {
  // 实验代操作的时间段是预设的，所有时间段都可用
  return allTimeSlots.value.map(slot => ({
    ...slot,
    available: true,
    remaining: 1 // 设置为1表示可用（虽然showRemaining为false不显示）
  }))
}

/**
 * 重置日期时间选择
 */
function resetDateTime() {
  dateTimeValue.value = {}
}

/**
 * 提交表单
 */
async function handleSubmit() {
  try {
    // 表单验证
    await formRef.value?.validate()
    
    // 验证操作内容
    if (!formData.value.operation_content_id) {
      showToast('请选择操作内容')
      return
    }
    
    // 验证动物类型
    if (!formData.value.animal_type_id) {
      showToast('请选择动物类型')
      return
    }
    
    // 验证是否选择了日期和时间段
    const selectedDates = Object.keys(dateTimeValue.value)
    if (selectedDates.length === 0) {
      showToast('请至少选择一个日期和时间段')
      return
    }

    // 验证每个日期都有时间段
    let hasEmptySlots = false
    selectedDates.forEach(date => {
      if (!dateTimeValue.value[date] || dateTimeValue.value[date].length === 0) {
        hasEmptySlots = true
      }
    })
    
    if (hasEmptySlots) {
      showToast('请为每个日期选择至少一个时间段')
      return
    }
    
    // 二次确认
    const confirmMessage = `确认预约 ${formData.value.quantity} 只动物的实验代操作吗？\n\n预约信息：\n${formatSlotsForConfirm(dateTimeValue.value)}`
    
    await showDialog({
      title: '确认提交',
      message: confirmMessage,
      confirmButtonText: '确认提交',
      cancelButtonText: '取消',
      messageAlign: 'left'
    })
    
    submitting.value = true
    
    // 组装提交数据
    const submitData = {
      operation_content_id: formData.value.operation_content_id,
      animal_type_id: formData.value.animal_type_id,
      quantity: Number(formData.value.quantity),
      time_slots: flattenTimeSlots(dateTimeValue.value),
      remark: formData.value.remark
    }
    
    // 提交订单
    await createExperimentOrder(submitData)
    
    showSuccessToast('提交成功，请等待审核')
    
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
.experiment-page {
  padding-top: @padding-md;
  
  .time-picker-section {
    margin: @padding-lg 0;
    padding: @padding-md;
    background-color: var(--bg-color-white);
    border-radius: @border-radius-md;
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
