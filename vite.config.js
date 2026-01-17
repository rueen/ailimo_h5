/*
 * @Author: diaochan diaochan@seatent.com
 * @Date: 2026-01-17 19:10:50
 * @LastEditors: diaochan diaochan@seatent.com
 * @LastEditTime: 2026-01-17 20:19:07
 * @FilePath: /ailimo_h5/vite.config.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import { VantResolver } from 'unplugin-vue-components/resolvers'
import { fileURLToPath, URL } from 'node:url'

/**
 * Vite 配置文件
 */
export default defineConfig({
  plugins: [
    vue(),
    // Vant 组件自动按需引入
    Components({
      resolvers: [VantResolver()],
    }),
  ],
  
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  
  css: {
    preprocessorOptions: {
      less: {
        additionalData: `@import "@/styles/variables.less"; @import "@/styles/mixins.less";`,
        javascriptEnabled: true,
      }
    }
  },
  
  // 开发服务器配置
  server: {
    port: 3002,
    host: true,
    open: true,
    // 配置代理，解决跨域问题
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        // 如果后端不需要 /api 前缀，可以使用 rewrite
        // rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  
  // 生产构建配置
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    // 代码分割
    rollupOptions: {
      output: {
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          'vant-vendor': ['vant']
        }
      }
    }
  }
})
