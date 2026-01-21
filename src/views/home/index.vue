<template>
  <app-layout>
    <div class="home-page">
      <!-- Banner 轮播 -->
      <div class="home-banner">
        <van-swipe :autoplay="3000" indicator-color="white">
          <van-swipe-item v-for="(image, index) in bannerImages" :key="index">
            <img :src="image" alt="Banner" />
          </van-swipe-item>
        </van-swipe>
        <div class="banner-content">
          <h1>浙江艾力默生物技术有限公司</h1>
          <p>加速研究和药物开发进程，为人类健康提供更安全、更有效、更经济、更便捷的解决方案</p>
          <van-button round type="primary" size="large" @click="goServices">
            立即预约
          </van-button>
        </div>
      </div>

      <!-- 核心服务 -->
      <div class="home-services">
        <h2 class="section-title">核心服务</h2>
        <div class="services-grid">
          <service-card
            v-for="service in serviceList"
            :key="service.path"
            :icon="service.icon"
            :title="service.title"
            :description="service.description"
            @click="router.push(service.path)"
          />
        </div>
      </div>

      <!-- 视频展示 -->
      <div v-if="companyInfo?.video_url" class="home-video">
        <h2 class="section-title">视频展示</h2>
        <div class="video-container">
          <video
            :src="companyInfo.video_url"
            controls
            poster=""
          >
            您的浏览器不支持视频播放
          </video>
        </div>
      </div>

      <!-- 我们的优势 -->
      <div class="home-advantages">
        <h2 class="section-title">我们的优势</h2>
        <div class="advantages-grid">
          <div v-for="(item, index) in advantageList" :key="index" class="advantage-item">
            <div class="advantage-number">{{ String(index + 1).padStart(2, '0') }}</div>
            <h3>{{ item.title }}</h3>
            <p>{{ item.description }}</p>
          </div>
        </div>
      </div>
    </div>
  </app-layout>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import AppLayout from '@/components/layout/AppLayout.vue'
import ServiceCard from '@/components/common/ServiceCard.vue'
import { useCompanyStore } from '@/stores/company'

const router = useRouter()
const companyStore = useCompanyStore()

/**
 * 公司信息（从 store 获取，无需重复请求）
 */
const companyInfo = computed(() => companyStore.companyInfo)

/**
 * Banner 图片
 */
const bannerImages = computed(() => {
  return companyInfo.value?.banner_image || [
    'https://via.placeholder.com/1200x400/667eea/ffffff?text=Banner+1',
    'https://via.placeholder.com/1200x400/764ba2/ffffff?text=Banner+2'
  ]
})

/**
 * 服务列表
 */
const serviceList = [
  {
    title: '设备预约',
    description: '专业仪器设备预约服务，满足您的科研需求',
    icon: 'https://ailimolab.oss-cn-hangzhou.aliyuncs.com/images/h5/device.png',
    path: '/services/equipment'
  },
  {
    title: '笼位预约',
    description: '提供短期和长期笼赁的实笼位预约服务',
    icon: 'https://ailimolab.oss-cn-hangzhou.aliyuncs.com/images/h5/cage.png',
    path: '/services/cage'
  },
  {
    title: '实验代操作',
    description: '动物实验、称重、灌胃、操作代等，可提供时付费',
    icon: 'https://ailimolab.oss-cn-hangzhou.aliyuncs.com/images/h5/operation.png',
    path: '/services/experiment'
  },
  {
    title: '动物订购',
    description: '优选实验动物，为优质康康提供更安全、快捷的品购服务',
    icon: 'https://ailimolab.oss-cn-hangzhou.aliyuncs.com/images/h5/animal.png',
    path: '/services/animal'
  },
  {
    title: '试剂耗材订购',
    description: '品牌琳郎、种类齐全、价格、快速，可提供订购服务',
    icon: 'https://ailimolab.oss-cn-hangzhou.aliyuncs.com/images/h5/reagent.png',
    path: '/services/reagent'
  }
]

/**
 * 优势列表
 */
const advantageList = [
  {
    title: '专业团队',
    description: '拥有十余年的科研经验和专业知识'
  },
  {
    title: '设备齐全',
    description: '配备先进的实验设备和技术平台'
  },
  {
    title: '服务完善',
    description: '提供一站式科研服务解决方案'
  },
  {
    title: '质量保障',
    description: '严格的质量管控体系和标准操作流程'
  }
]

/**
 * 是否为 PC 端
 */
const isPc = computed(() => {
  return window.innerWidth >= 768
})

/**
 * 去动物服务
 */
function goServices() {
  router.push('/services')
}
</script>

<style lang="less" scoped>
.home-page {
  .home-banner {
    position: relative;
    height: 400px;
    overflow: hidden;

    :deep(.van-swipe) {
      height: 100%;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    .banner-content {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      text-align: center;
      color: #fff;
      z-index: 1;
      width: 90%;
      max-width: 800px;

      h1 {
        font-size: 32px;
        font-weight: 600;
        margin-bottom: 16px;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
      }

      p {
        font-size: 16px;
        margin-bottom: 24px;
        line-height: 1.6;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
      }
    }
  }

  .section-title {
    font-size: 28px;
    font-weight: 600;
    text-align: center;
    margin: 40px 0 20px 0;
    color: var(--text-color);
  }

  .home-services {
    padding: 0 @padding-md;

    .services-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 20px;
      max-width: 1200px;
      margin: 0 auto;
      
      @media (min-width: 768px) {
        grid-template-columns: repeat(1, 1fr);
      }

      @media (min-width: 992px) {
        grid-template-columns: repeat(3, 1fr);
      }

      @media (min-width: 1200px) {
        grid-template-columns: repeat(5, 1fr);
      }
      .service-card {
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
      }
    }
  }

  .home-video {
    padding: 0 @padding-md;

    .video-container {
      max-width: 1000px;
      margin: 0 auto;

      video {
        width: 100%;
        border-radius: 8px;
      }
    }
  }

  .home-advantages {
    padding: 0 @padding-md;

    .advantages-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: @padding-md;
      max-width: 1200px;
      margin: 0 auto;

      @media (min-width: 768px) {
        grid-template-columns: repeat(2, 1fr);
      }

      @media (min-width: 1200px) {
        grid-template-columns: repeat(4, 1fr);
      }
    }

    .advantage-item {
      background-color: var(--bg-color-white);
      border-radius: 8px;
      padding: 24px;
      text-align: center;
      transition: all 0.3s;

      &:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        transform: translateY(-4px);
      }

      .advantage-number {
        width: 48px;
        height: 48px;
        margin: 0 auto 16px;
        background: @primary-color;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        font-size: 20px;
        font-weight: 600;
      }

      h3 {
        font-size: 18px;
        font-weight: 600;
        margin-bottom: 8px;
        color: var(--text-color);
      }

      p {
        font-size: 14px;
        color: var(--text-color-2);
        line-height: 1.6;
      }
    }
  }

  @media (max-width: 768px) {
    .home-banner {
      height: 300px;

      .banner-content {
        h1 {
          font-size: 24px;
        }

        p {
          font-size: 14px;
        }
      }
    }

    .section-title {
      font-size: 24px;
    }
  }
}
</style>
