<template>
  <app-layout>
    <div class="reagent-page page-content">
      <h2 class="page-title">试剂耗材订购</h2>
      <van-form @submit="handleSubmit">
        <van-cell-group inset>
          <van-field v-model="formData.name" label="名称" placeholder="请输入试剂耗材名称" />
          <van-field v-model="formData.brand_id" label="品牌" placeholder="选择品牌" />
          <van-field v-model="formData.specification_id" label="规格" placeholder="选择规格" />
          <van-field v-model="formData.quantity" type="number" label="数量" placeholder="请输入数量" />
          <van-field v-model="formData.orderer_name" label="订购人" placeholder="请输入订购人姓名" />
          <van-field v-model="formData.contact_phone" label="联系电话" placeholder="请输入联系电话" />
          <van-field v-model="formData.delivery_date" label="到货日期" placeholder="选择日期" />
          <van-field v-model="formData.address" type="textarea" label="收货地址" placeholder="请输入收货地址" />
        </van-cell-group>
        <div class="submit-btn">
          <van-button block round type="primary" native-type="submit">提交订单</van-button>
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
import { createReagentOrder } from '@/api/reagent'

const router = useRouter()
const formData = ref({
  name: '',
  brand_id: null,
  specification_id: null,
  quantity: '',
  orderer_name: '',
  contact_phone: '',
  delivery_date: '',
  province_id: null,
  city_id: null,
  district_id: null,
  address: ''
})

async function handleSubmit() {
  try {
    await createReagentOrder(formData.value)
    showToast('订单提交成功')
    router.back()
  } catch (error) {
    console.error('订购失败:', error)
  }
}
</script>

<style lang="less" scoped>
.reagent-page {
  .page-title {
    font-size: @font-size-xl;
    margin-bottom: @padding-lg;
  }
  .submit-btn {
    margin-top: @padding-lg;
  }
}
</style>
