<template>
  <app-layout>
    <div class="equipment-detail-page page-content">
      <van-loading v-if="loading" vertical>加载中...</van-loading>
      
      <div v-else-if="equipment" class="equipment-detail">
        <van-image
          v-if="equipment.details?.image"
          :src="equipment.details.image[0]"
          fit="cover"
          style="width: 100%; height: 200px;"
        />
        
        <h2>{{ equipment.name }}</h2>
        <p>{{ equipment.details?.base_info }}</p>
        <p v-if="equipment.details?.specs">规格: {{ equipment.details.specs }}</p>
        
        <van-button block round type="primary" @click="router.push(`/equipment/book/${equipment.id}`)">
          立即预约
        </van-button>
      </div>
    </div>
  </app-layout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import AppLayout from '@/components/layout/AppLayout.vue'
import { getEquipmentDetail } from '@/api/equipment'

const router = useRouter()
const route = useRoute()
const loading = ref(false)
const equipment = ref(null)

async function loadEquipmentDetail() {
  try {
    loading.value = true
    equipment.value = await getEquipmentDetail(route.params.id)
  } catch (error) {
    console.error('加载设备详情失败:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadEquipmentDetail()
})
</script>

<style lang="less" scoped>
.equipment-detail {
  h2 {
    font-size: @font-size-xl;
    margin: @padding-md 0;
  }
  
  p {
    color: var(--text-color-2);
    line-height: 1.6;
    margin-bottom: @padding-sm;
  }
  
  .van-button {
    margin-top: @padding-lg;
  }
}
</style>
