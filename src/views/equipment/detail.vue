<!--
 * @Author: diaochan diaochan@seatent.com
 * @Date: 2026-01-17 19:17:05
 * @LastEditors: diaochan diaochan@seatent.com
 * @LastEditTime: 2026-01-19 16:10:11
 * @FilePath: /ailimo_h5/src/views/equipment/detail.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <app-layout>
    <div class="equipment-detail-page page-content">
      <page-title title="设备详情" @back="router.back()" />
      <van-loading v-if="loading" vertical>加载中...</van-loading>
      
      <div v-else-if="equipment" class="equipment-detail">
        <!-- 设备图片列表 -->
        <div v-if="equipment.details?.image?.length" class="equipment-images">
          <div
            v-for="(img, index) in equipment.details.image"
            :key="index"
            class="image-item"
            @click="previewImage(index)"
          >
            <van-image
              :src="img"
              fit="cover"
            />
          </div>
        </div>
        
        <h2 class="equipment-name">{{ equipment.name }}</h2>
        
        <!-- 基本信息（富文本） -->
        <div v-if="equipment.details?.base_info" class="equipment-section">
          <h3>基本信息</h3>
          <div class="rich-text" v-html="equipment.details.base_info"></div>
        </div>
        
        <!-- 规格参数（富文本） -->
        <div v-if="equipment.details?.specs" class="equipment-section">
          <h3>规格参数</h3>
          <div class="rich-text" v-html="equipment.details.specs"></div>
        </div>
      </div>
    </div>
  </app-layout>
</template>

<script setup>
import { ref, onMounted, provide } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showImagePreview } from 'vant'
import AppLayout from '@/components/layout/AppLayout.vue'
import { getEquipmentDetail } from '@/api/equipment'
import PageTitle from '@/components/common/PageTitle.vue'

const router = useRouter()
const route = useRoute()
const loading = ref(false)
const equipment = ref(null)

/**
 * 导航栏标题（动态）
 */
const navBarTitle = ref('设备详情')

/**
 * 提供导航栏标题给AppNavBar组件
 */
provide('navBarTitle', navBarTitle)

/**
 * 预览图片
 * @param {number} index - 图片索引
 */
function previewImage(index) {
  if (!equipment.value?.details?.image) return
  
  const images = equipment.value.details.image
  if (!images || images.length === 0) return
  
  showImagePreview({
    images: images,
    startPosition: index
  })
}

/**
 * 加载设备详情
 */
async function loadEquipmentDetail() {
  try {
    loading.value = true
    equipment.value = await getEquipmentDetail(route.params.id)
    
    // 更新导航栏标题为设备名称
    if (equipment.value?.name) {
      navBarTitle.value = equipment.value.name
      // 同时更新页面标题
      document.title = equipment.value.name + ' - 设备详情'
    }
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
  background-color: #fff;
  padding: @padding-md;
  border-radius: @border-radius-md;

  .equipment-images {
    display: grid;
    grid-template-columns: repeat(1, 1fr);
    margin-bottom: @padding-lg;

    .image-item {
      width: 100%;
      height: auto;
      border-radius: @border-radius-md;
      overflow: hidden;
      cursor: pointer;
      transition: transform 0.3s;

      &:hover {
        transform: scale(1.02);
      }

      :deep(.van-image) {
        width: 100%;
        height: 100%;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }
    }
  }

  .equipment-name {
    font-size: @font-size-xl;
    font-weight: 600;
    margin-bottom: @padding-lg;
    color: var(--text-color);
    
    @media (max-width: 767px) {
      display: none; // 移动端导航栏已显示，隐藏页面标题
    }
  }

  .equipment-section {
    margin-bottom: @padding-xl;

    h3 {
      font-size: @font-size-lg;
      font-weight: 600;
      margin-bottom: @padding-md;
      color: var(--text-color);
    }

    .rich-text {
      color: var(--text-color-2);
      line-height: 1.8;
      
      // 富文本内容样式
      :deep(p) {
        margin-bottom: @padding-sm;
        
        &:last-child {
          margin-bottom: 0;
        }
      }

      :deep(img) {
        max-width: 100%;
        height: auto;
        border-radius: @border-radius-sm;
        margin: @padding-sm 0;
      }

      :deep(ul),
      :deep(ol) {
        padding-left: @padding-lg;
        margin-bottom: @padding-sm;
      }

      :deep(li) {
        margin-bottom: 4px;
      }

      :deep(strong) {
        font-weight: 600;
        color: var(--text-color);
      }

      :deep(h1),
      :deep(h2),
      :deep(h3),
      :deep(h4) {
        font-weight: 600;
        margin: @padding-md 0 @padding-sm;
        color: var(--text-color);
      }

      :deep(table) {
        width: 100%;
        border-collapse: collapse;
        margin: @padding-sm 0;

        th,
        td {
          border: 1px solid var(--border-color);
          padding: @padding-sm;
          text-align: left;
        }

        th {
          background-color: var(--bg-color);
          font-weight: 600;
        }
      }
    }
  }
}
</style>
