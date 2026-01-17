<template>
  <app-layout>
    <div class="case-detail-page page-content">
      <van-loading v-if="loading" vertical>加载中...</van-loading>

      <div v-else-if="caseDetail" class="case-detail">
        <h2>{{ caseDetail.project_name }}</h2>

        <div v-if="caseDetail.images?.length" class="case-images">
          <van-image
            v-for="(img, index) in caseDetail.images"
            :key="index"
            :src="img"
            fit="cover"
            @click="previewImage(index)"
          />
        </div>

        <div class="case-section">
          <h3>项目概述</h3>
          <p>{{ caseDetail.project_summary }}</p>
        </div>

        <div v-if="caseDetail.project_result" class="case-section">
          <h3>项目成果</h3>
          <p>{{ caseDetail.project_result }}</p>
        </div>
      </div>
    </div>
  </app-layout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ImagePreview } from 'vant'
import AppLayout from '@/components/layout/AppLayout.vue'
import { getCaseDetail } from '@/api/case'

const route = useRoute()
const loading = ref(false)
const caseDetail = ref(null)

async function loadCaseDetail() {
  try {
    loading.value = true
    caseDetail.value = await getCaseDetail(route.params.id)
  } catch (error) {
    console.error('加载案例详情失败:', error)
  } finally {
    loading.value = false
  }
}

function previewImage(index) {
  ImagePreview({
    images: caseDetail.value.images,
    startPosition: index
  })
}

onMounted(() => {
  loadCaseDetail()
})
</script>

<style lang="less" scoped>
.case-detail {
  h2 {
    font-size: @font-size-xl;
    font-weight: 600;
    margin-bottom: @padding-lg;
  }

  .case-images {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: @padding-sm;
    margin-bottom: @padding-lg;

    :deep(.van-image) {
      width: 100%;
      height: 120px;
      border-radius: @border-radius-md;
      overflow: hidden;
    }
  }

  .case-section {
    margin-bottom: @padding-lg;

    h3 {
      font-size: @font-size-lg;
      font-weight: 600;
      margin-bottom: @padding-sm;
    }

    p {
      color: var(--text-color-2);
      line-height: 1.8;
      white-space: pre-wrap;
    }
  }
}
</style>
