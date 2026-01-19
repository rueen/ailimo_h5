<template>
  <app-layout>
    <div class="equipment-page page-content">
      <page-title title="设备租赁" @back="router.back()" />
      <van-form @submit="handleSubmit">
        <van-cell-group>
          <!-- 设备选择 -->
          <van-field
            v-model="equipmentName"
            label="设备"
            placeholder="请选择设备"
            readonly
            is-link
            required
            @click="showEquipmentPicker = true"
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

      <!-- 设备选择弹窗 -->
      <van-popup v-model:show="showEquipmentPicker" position="bottom" round>
        <van-picker
          :columns="equipmentColumns"
          @confirm="onEquipmentConfirm"
          @cancel="showEquipmentPicker = false"
        />
      </van-popup>
    </div>
  </app-layout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showSuccessToast } from 'vant'
import AppLayout from '@/components/layout/AppLayout.vue'
import PageTitle from '@/components/common/PageTitle.vue'
import DateTimeSlotPicker from '@/components/common/DateTimeSlotPicker.vue'
import { getEquipmentList, getEquipmentAvailableSlots, createEquipmentOrder } from '@/api/equipment'
import { useConfigStore } from '@/stores/config'

const router = useRouter()
const configStore = useConfigStore()

/**
 * 表单数据
 */
const form = ref({
  equipment_id: null,
  reservation_date: '',
  time_slots: [],
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
 * 显示设备选择器
 */
const showEquipmentPicker = ref(false)

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
 * 选中的设备名称
 */
const equipmentName = computed(() => {
  const equipment = equipmentList.value.find(item => item.id === form.value.equipment_id)
  return equipment?.name || ''
})

/**
 * 设备信息
 */
const equipmentInfo = computed(() => {
  const equipment = equipmentList.value.find(item => item.id === form.value.equipment_id)
  return equipment?.details?.base_info || ''
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
 * 设备选择确认
 * @param {object} value - 选中的值
 */
function onEquipmentConfirm({ selectedOptions }) {
  const selected = selectedOptions[0]
  form.value.equipment_id = selected.value
  
  // 清空之前选择的时间
  dateTimeValue.value = {
    date: '',
    slots: []
  }
  
  showEquipmentPicker.value = false
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
 * 提交表单
 */
async function handleSubmit() {
  // 验证设备
  if (!form.value.equipment_id) {
    showToast('请选择设备')
    return
  }

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

  // 组装提交数据
  const submitData = {
    equipment_id: form.value.equipment_id,
    reservation_date: dateTimeValue.value.date,
    time_slots: dateTimeValue.value.slots.map(slot => slot.display_time),
    remark: form.value.remark
  }

  try {
    submitting.value = true
    await createEquipmentOrder(submitData)
    showSuccessToast('提交成功，请等待审核')
    
    // 延迟返回,让用户看到成功提示
    setTimeout(() => {
      router.back()
    }, 1500)
  } catch (error) {
    console.error('提交订单失败:', error)
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
