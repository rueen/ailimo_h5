<template>
  <div class="app-header" :class="{ 'is-pc': isPc }">
    <div class="header-container">
      <!-- Logo -->
      <div class="header-logo" @click="goHome">
        <img :src="logoUrl" alt="艾力默" />
        <span v-if="isPc">艾力默</span>
      </div>

      <!-- PC 端导航 -->
      <nav v-if="isPc" class="header-nav">
        <a
          v-for="item in navList"
          :key="item.path"
          :class="{ active: isActive(item.path) }"
          @click="navigate(item.path)"
        >
          {{ item.title }}
        </a>
      </nav>

      <!-- 右侧操作区 -->
      <div class="header-actions">
        <template v-if="userStore.isLoggedIn">
          <span class="user-name">{{ userStore.userInfo?.name }}</span>
          <van-button size="small" type="default" @click="handleLogout">
            退出
          </van-button>
        </template>
        <template v-else>
          <van-button size="small" type="default" @click="goLogin">
            登录
          </van-button>
          <van-button size="small" type="primary" @click="goRegister">
            注册
          </van-button>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showConfirmDialog } from 'vant'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

/**
 * Logo 地址
 */
const logoUrl = 'https://ailimolab.oss-cn-hangzhou.aliyuncs.com/images/h5/logo.png'

/**
 * 导航列表
 */
const navList = [
  { title: '首页', path: '/home' },
  { title: '公司概况', path: '/about' },
  { title: '服务中心', path: '/services' },
  { title: '案例展示', path: '/cases' }
]

/**
 * 是否为 PC 端
 */
const isPc = computed(() => {
  return window.innerWidth >= 768
})

/**
 * 判断导航是否激活
 */
function isActive(path) {
  return route.path.startsWith(path)
}

/**
 * 导航跳转
 */
function navigate(path) {
  router.push(path)
}

/**
 * 回到首页
 */
function goHome() {
  router.push('/home')
}

/**
 * 去登录
 */
function goLogin() {
  router.push('/login')
}

/**
 * 去注册
 */
function goRegister() {
  router.push('/register')
}

/**
 * 退出登录
 */
async function handleLogout() {
  showConfirmDialog({
    title: '提示',
    message: '确定要退出登录吗？'
  })
    .then(async () => {
      await userStore.logout()
      router.push('/home')
    })
    .catch(() => {
      // 取消退出
    })
}
</script>

<style lang="less" scoped>
.app-header {
  position: sticky;
  top: 0;
  left: 0;
  right: 0;
  z-index: 999;
  background-color: var(--bg-color-white);
  border-bottom: 1px solid var(--border-color);

  .header-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 56px;
    padding: 0 @padding-md;
  }

  .header-logo {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;

    img {
      width: 32px;
      height: 32px;
    }

    span {
      font-size: @font-size-lg;
      font-weight: 600;
      color: var(--text-color);
    }
  }

  .header-nav {
    display: flex;
    align-items: center;
    gap: 32px;

    a {
      font-size: @font-size-md;
      color: var(--text-color-2);
      cursor: pointer;
      transition: color 0.3s;

      &:hover,
      &.active {
        color: var(--primary-color);
      }
    }
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 12px;

    .user-name {
      font-size: @font-size-md;
      color: var(--text-color);
    }
  }

  // PC 端样式
  &.is-pc {
    .header-container {
      max-width: 1200px;
      margin: 0 auto;
      height: 64px;
    }
  }
}
</style>
