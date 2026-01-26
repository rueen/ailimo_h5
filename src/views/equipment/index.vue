<template>
  <app-layout>
    <div class="equipment-page page-content">
      <page-title title="设备预约" @back="router.back()" />
      
      <!-- 查看收费标准入口 -->
      <div class="price-link-section">
        <div class="price-link-section-text" @click="viewPrice">
          <span>查看收费标准</span>
          <van-icon name="arrow" />
        </div>
      </div>
      
      <van-form @submit="handleSubmit">
        <van-cell-group>
          <!-- 设备选择 -->
          <universal-picker
            v-model="form.equipment_id"
            :columns="equipmentColumns"
            label="设备"
            placeholder="请选择设备"
            required
            @change="onEquipmentChange"
          />
          <div class="equipment-detail-btn" @click="viewEquipmentDetail">
            <span>查看设备详情</span>
            <van-icon name="arrow" class="service-arrow" />
          </div>

          <!-- 备注 -->
          <van-field
            v-model="form.remark"
            label="备注"
            type="textarea"
            placeholder="请输入备注信息（选填）"
            rows="3"
            maxlength="200"
            show-word-limit
          />

          <!-- 时间选择 -->
          <div v-if="form.equipment_id" class="time-picker-section">
            <date-time-slot-picker
              v-model="dateTimeValue"
              :advance-days="advanceDays"
              :show-remaining="true"
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
import PageTitle from '@/components/common/PageTitle.vue'
import UniversalPicker from '@/components/common/UniversalPicker.vue'
import DateTimeSlotPicker from '@/components/common/DateTimeSlotPicker.vue'
import { getEquipmentList, getEquipmentAvailableSlots, createEquipmentOrder } from '@/api/equipment'
import { useConfigStore } from '@/stores/config'
import { flattenTimeSlots, formatSlotsForConfirm } from '@/utils/timeSlot'

const router = useRouter()
const configStore = useConfigStore()

/**
 * 表单数据
 */
const form = ref({
  equipment_id: null,
  remark: ''
})

/**
 * 日期时间选择器的值 { "2026-01-10": [slot1, slot2], "2026-01-11": [slot3] }
 */
const dateTimeValue = ref({})

/**
 * 设备列表
 */
const equipmentList = ref([])

/**
 * 提前预约天数（从全局配置获取）
 */
const advanceDays = computed(() => {
  return configStore.advanceDays.equipment_advance_days || 7
})

/**
 * 提交状态
 */
const submitting = ref(false)

/**
 * 设备选择器列的数据
 */
const equipmentColumns = computed(() => {
  return equipmentList.value.map(item => ({
    text: item.name,
    value: item.id,
    details: item.details
  }))
})

/**
 * 加载设备列表
 */
async function loadEquipmentList() {
  try {
    equipmentList.value = await getEquipmentList()
  } catch (error) {
    console.error('加载设备列表失败:', error)
    showToast('加载设备列表失败')
  }
}

/**
 * 获取时间段数据（供DateTimeSlotPicker组件调用）
 * @param {string} date - 日期
 */
async function fetchTimeSlots(date) {
  if (!form.value.equipment_id) {
    return []
  }
  
  try {
    const slots = await getEquipmentAvailableSlots(form.value.equipment_id, { date })
    
    // 计算剩余数量（假设每个时间段只能预约1次，根据available判断）
    return slots.map(slot => ({
      ...slot,
      remaining: slot.available ? 1 : 0
    }))
  } catch (error) {
    console.error('加载时间段失败:', error)
    throw error
  }
}

/**
 * 设备改变事件
 */
function onEquipmentChange({ selectedOption }) {
  // 清空之前选择的时间
  dateTimeValue.value = {}
}

/**
 * 查看设备详情
 */
function viewEquipmentDetail() {
  if (form.value.equipment_id != null) {
    router.push(`/equipment/${form.value.equipment_id}`)
  } else {
    showToast('请选择设备')
  }
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
  // 验证设备
  if (!form.value.equipment_id) {
    showToast('请选择设备')
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

  try {
    // 显示确认对话框
    const confirmMessage = `确认提交预约吗？\n\n预约信息：\n${formatSlotsForConfirm(dateTimeValue.value)}`
    
    await showDialog({
      title: '确认提交',
      message: confirmMessage,
      confirmButtonText: '确认提交',
      cancelButtonText: '取消',
      messageAlign: 'left'
    })

    // 组装提交数据
    const submitData = {
      equipment_id: form.value.equipment_id,
      time_slots: flattenTimeSlots(dateTimeValue.value),
      remark: form.value.remark
    }

    submitting.value = true
    await createEquipmentOrder(submitData)
    showSuccessToast('提交成功，请等待审核')
    
    // 延迟返回,让用户看到成功提示
    setTimeout(() => {
      router.back()
    }, 1500)
  } catch (error) {
    if (error !== 'cancel') {
      console.error('提交订单失败:', error)
    }
  } finally {
    submitting.value = false
  }
}

/**
 * 组件挂载时加载数据
 */
onMounted(() => {
  loadEquipmentList()
})
</script>

<style lang="less" scoped>
.equipment-page {
  padding-top: @padding-md;

  .equipment-detail-btn {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 5px;
    font-size: @font-size-sm;
    color: var(--text-color-3);
    cursor: pointer;
    margin: @padding-sm @padding-md @padding-sm 0;
    &:hover {
      color: var(--text-color);
    }
  }

  .equipment-info {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: @padding-sm;
    width: 100%;

    span {
      flex: 1;
      font-size: @font-size-sm;
      color: var(--text-color-3);
    }
  }

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
