/*
 * @Author: diaochan diaochan@seatent.com
 * @Date: 2026-01-17 19:11:20
 * @LastEditors: diaochan diaochan@seatent.com
 * @LastEditTime: 2026-01-25 10:54:35
 * @FilePath: /ailimo_h5/src/main.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

import '@vant/touch-emulator';

// 引入全局样式
import './styles/index.less'

// // 引入 Vant 组件样式（按需引入的组件样式）
import 'vant/es/image-preview/style'
import 'vant/es/toast/style'
import 'vant/es/dialog/style'
import 'vant/es/loading/style'
import 'vant/es/notify/style'
import 'vant/es/popup/style'
import 'vant/es/pull-refresh/style'
import 'vant/es/search/style'
import 'vant/es/share-sheet/style'
import 'vant/es/stepper/style'
import 'vant/es/stepper/style'

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
