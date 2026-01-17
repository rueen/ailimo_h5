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
    port: 5173,
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
