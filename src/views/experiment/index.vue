<template>
  <app-layout>
    <div class="experiment-page page-content">
      <h2 class="page-title">实验代操作</h2>
      <van-form @submit="handleSubmit">
        <van-cell-group inset>
          <van-field v-model="formData.operation_content_id" label="操作内容" placeholder="选择操作内容" />
          <van-field v-model="formData.animal_type_id" label="动物类型" placeholder="选择动物类型" />
          <van-field v-model="formData.quantity" type="number" label="动物数量" placeholder="请输入数量" />
          <van-field v-model="formData.reservation_date" label="预约日期" placeholder="选择日期" />
          <van-field v-model="formData.remark" type="textarea" label="备注" placeholder="备注（选填）" />
        </van-cell-group>
        <div class="submit-btn">
          <van-button block round type="primary" native-type="submit">提交预约</van-button>
        </div>
      </van-form>
    </div>
  </app-layout>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import AppLayout from '@/components/layout/AppLayout.vue'
import { createExperimentOrder } from '@/api/experiment'

const router = useRouter()
const formData = ref({
  operation_content_id: null,
  animal_type_id: null,
  quantity: '',
  reservation_date: '',
  time_slots: [],
  remark: ''
})

async function handleSubmit() {
  try {
    await createExperimentOrder(formData.value)
    showToast('预约成功')
    router.back()
  } catch (error) {
    console.error('预约失败:', error)
  }
}
</script>

<style lang="less" scoped>
.experiment-page {
  .page-title {
    font-size: @font-size-xl;
    margin-bottom: @padding-lg;
  }
  .submit-btn {
    margin-top: @padding-lg;
  }
}
</style>
