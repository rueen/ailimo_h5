# 艾力默用户端项目

## 项目简介
艾力默生物科技用户端 H5 项目，提供设备租赁、笼位预约、实验代操作、动物订购、试剂耗材订购等服务。

## 技术栈
- **框架**: Vue 3
- **UI 组件库**: Vant 4
- **HTTP 请求**: Axios
- **样式**: Less
- **构建工具**: Vite
- **状态管理**: Pinia
- **路由**: Vue Router (Hash 模式)

## 项目特性
- ✅ PC 端和移动端响应式适配
- ✅ 主题颜色使用 CSS 变量，方便更换
- ✅ Vant 组件自动按需引入
- ✅ 开发环境代理配置，解决跨域问题
- ✅ 支持微信公众号菜单嵌入

## 目录结构
```
ailimo_h5/
├── docs/              # 接口文档
├── ui/                # 设计稿
├── src/
│   ├── api/          # API 接口封装
│   ├── assets/       # 静态资源
│   ├── components/   # 通用组件
│   ├── router/       # 路由配置
│   ├── stores/       # Pinia 状态管理
│   ├── styles/       # 全局样式
│   ├── utils/        # 工具函数
│   ├── views/        # 页面组件
│   ├── App.vue       # 根组件
│   └── main.js       # 入口文件
├── index.html        # HTML 模板
├── package.json      # 依赖配置
├── vite.config.js    # Vite 配置
└── README.md         # 项目说明
```

## 开发指南

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm run dev
```
访问地址: http://localhost:5173

### 生产构建
```bash
npm run build
```

### 预览生产构建
```bash
npm run preview
```

## API 配置
- 开发环境: http://localhost:3000
- 生产环境: 根据实际部署配置

## 路由模式
使用 Hash 模式 (`#/`)，兼容微信公众号和独立访问。

## 主题配置
主题颜色在 `src/styles/variables.less` 中配置，使用 CSS 变量方便后期更换。

## 注意事项
1. 不使用 TypeScript，全部使用 JavaScript
2. 使用 JSDoc 注释规范
3. 代码注释使用中文
4. 字段命名使用下划线命名（snake_case），与后端保持一致
