<template>
  <app-layout>
    <div class="equipment-page page-content">
      <van-search v-model="searchText" placeholder="搜索设备" @search="onSearch" />
      
      <van-loading v-if="loading" vertical>加载中...</van-loading>
      
      <div v-else-if="equipmentList.length > 0" class="equipment-list">
        <van-card
          v-for="item in equipmentList"
          :key="item.id"
          :title="item.name"
          :desc="item.details?.base_info"
          :thumb="item.details?.image?.[0]"
          @click="router.push(`/equipment/${item.id}`)"
        >
          <template #footer>
            <van-button size="small" type="primary" @click.stop="router.push(`/equipment/book/${item.id}`)">
              立即预约
            </van-button>
          </template>
        </van-card>
      </div>
      
      <empty-state v-else description="暂无设备" />
    </div>
  </app-layout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppLayout from '@/components/layout/AppLayout.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import { getEquipmentList } from '@/api/equipment'

const router = useRouter()
const loading = ref(false)
const equipmentList = ref([])
const searchText = ref('')

async function loadEquipmentList() {
  try {
    loading.value = true
    equipmentList.value = await getEquipmentList({ name: searchText.value })
  } catch (error) {
    console.error('加载设备列表失败:', error)
  } finally {
    loading.value = false
  }
}

function onSearch() {
  loadEquipmentList()
}

onMounted(() => {
  loadEquipmentList()
})
</script>

<style lang="less" scoped>
.equipment-list {
  display: flex;
  flex-direction: column;
  gap: @padding-md;
}
</style>
