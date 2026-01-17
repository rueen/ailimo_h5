<template>
  <app-layout>
    <div class="equipment-book-page page-content">
      <h2 class="page-title">预约设备</h2>
      
      <van-form @submit="handleSubmit">
        <van-cell-group inset>
          <van-field
            v-model="formData.reservation_date"
            is-link
            readonly
            label="预约日期"
            placeholder="选择日期"
            @click="showDatePicker = true"
            :rules="[{ required: true, message: '请选择预约日期' }]"
          />
          <van-field
            v-model="timeSlotsText"
            is-link
            readonly
            label="预约时段"
            placeholder="选择时段"
            @click="showTimeSlotsPicker = true"
            :rules="[{ required: true, message: '请选择预约时段' }]"
          />
          <van-field
            v-model="formData.remark"
            label="备注"
            placeholder="请输入备注（选填）"
            type="textarea"
            rows="3"
          />
        </van-cell-group>
        
        <div class="submit-btn">
          <van-button block round type="primary" native-type="submit" :loading="loading">
            提交预约
          </van-button>
        </div>
      </van-form>

      <!-- 日期选择器 -->
      <van-popup v-model:show="showDatePicker" position="bottom">
        <van-date-picker
          v-model="currentDate"
          title="选择日期"
          :min-date="minDate"
          :max-date="maxDate"
          @confirm="onConfirmDate"
          @cancel="showDatePicker = false"
        />
      </van-popup>

      <!-- 时间段选择器 -->
      <van-popup v-model:show="showTimeSlotsPicker" position="bottom">
        <van-picker
          title="选择时段"
          :columns="timeSlotOptions"
          @confirm="onConfirmTimeSlots"
          @cancel="showTimeSlotsPicker = false"
        />
      </van-popup>
    </div>
  </app-layout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast } from 'vant'
import AppLayout from '@/components/layout/AppLayout.vue'
import { createEquipmentOrder, getEquipmentTimeSlots } from '@/api/equipment'
import dayjs from 'dayjs'

const router = useRouter()
const route = useRoute()
const loading = ref(false)
const showDatePicker = ref(false)
const showTimeSlotsPicker = ref(false)
const currentDate = ref(new Date())
const minDate = ref(new Date())
const maxDate = ref(dayjs().add(30, 'day').toDate())

const formData = ref({
  equipment_id: Number(route.params.id),
  reservation_date: '',
  time_slots: [],
  remark: ''
})

const timeSlotOptions = ref([])
const timeSlotsText = computed(() => {
  return formData.value.time_slots.join('、')
})

async function loadTimeSlots() {
  try {
    const list = await getEquipmentTimeSlots()
    timeSlotOptions.value = list.map(item => ({
      text: item.display_time,
      value: item.display_time
    }))
  } catch (error) {
    console.error('加载时间段失败:', error)
  }
}

function onConfirmDate({ selectedValues }) {
  formData.value.reservation_date = dayjs(new Date(selectedValues[0], selectedValues[1] - 1, selectedValues[2])).format('YYYY-MM-DD')
  showDatePicker.value = false
}

function onConfirmTimeSlots({ selectedOptions }) {
  formData.value.time_slots = [selectedOptions.value]
  showTimeSlotsPicker.value = false
}

async function handleSubmit() {
  try {
    loading.value = true
    await createEquipmentOrder(formData.value)
    showToast('预约成功')
    router.back()
  } catch (error) {
    console.error('预约失败:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadTimeSlots()
})
</script>

<style lang="less" scoped>
.equipment-book-page {
  .page-title {
    font-size: @font-size-xl;
    font-weight: 600;
    margin-bottom: @padding-lg;
  }

  .submit-btn {
    margin-top: @padding-lg;
  }
}
</style>
