import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// 引入全局样式
import './styles/index.less'

// 引入 Vant 组件样式（按需引入的组件样式）
import 'vant/es/image-preview/style'
import 'vant/es/toast/style'

/**
 * 创建 Vue 应用实例
 */
const app = createApp(App)

/**
 * 安装插件
 */
app.use(createPinia())
app.use(router)

/**
 * 挂载应用
 */
app.mount('#app')
