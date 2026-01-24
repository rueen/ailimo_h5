<template>
  <app-layout>
    <div class="case-detail-page page-content">
      <van-loading v-if="loading" vertical>加载中...</van-loading>

      <div v-else-if="caseDetail" class="case-detail">

        <div v-if="caseDetail.images?.length" class="case-images">
          <!-- 案例图片 -->
          <van-image
            v-for="(img, index) in caseDetail.images"
            :key="index"
            :src="img"
            fit="cover"
            @click="previewImage(index)"
          />
        </div>

        <h1 class="case-title">{{ caseDetail.project_name }}</h1>

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
import { ref, onMounted, provide, watch } from 'vue'
import { useRoute } from 'vue-router'
import { showImagePreview } from 'vant'
import AppLayout from '@/components/layout/AppLayout.vue'
import { getCaseDetail } from '@/api/case'
import { updateWechatShare, isWechat } from '@/utils/wechat'

const route = useRoute()
const loading = ref(false)
const caseDetail = ref(null)
const navBarTitle = ref('案例详情')

/**
 * 提供导航栏标题给AppNavBar组件
 */
provide('navBarTitle', navBarTitle)

/**
 * 监听案例详情变化，更新分享内容
 */
watch(caseDetail, (detail) => {
  if (detail && isWechat()) {
    updateWechatShare({
      title: detail.project_name,
      desc: detail.project_summary,
      imgUrl: detail.images?.[0] || 'https://www.ailimolab.com/share-cover.png',
      link: location.href
    })
  }
})

async function loadCaseDetail() {
  try {
    loading.value = true
    caseDetail.value = await getCaseDetail(route.params.id)

    // 更新导航栏标题为设备名称
    if (caseDetail.value?.project_name) {
      navBarTitle.value = caseDetail.value.project_name
      // 同时更新页面标题
      document.title = caseDetail.value.project_name + ' - 案例详情'
    }
  } catch (error) {
    console.error('加载案例详情失败:', error)
  } finally {
    loading.value = false
  }
}

function previewImage(index) {
  showImagePreview({
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
  background-color: #fff;
  padding: @padding-md;
  border-radius: @border-radius-md;
  h2 {
    font-size: @font-size-xl;
    font-weight: 600;
    margin-bottom: @padding-lg;
  }

  .case-images {
    display: grid;
    grid-template-columns: repeat(1, 1fr);
    margin-bottom: @padding-lg;

    :deep(.van-image) {
      width: 100%;
      height: auto;
    }
  }

  .case-title {
    font-size: @font-size-xl;
    font-weight: 600;
    color: @text-color;
    margin-bottom: @padding-lg;
    line-height: 1.4;
    padding-bottom: @padding-lg;
    border-bottom: 1px solid @border-color;
  }

  .case-section {
    margin-bottom: @padding-lg;

    h3 {
      font-size: @font-size-lg;
      font-weight: 600;
      margin-bottom: @padding-sm;
    }

    p {
      color: @text-color-2;
      line-height: 1.8;
      white-space: pre-wrap;
    }
  }
}
</style>
