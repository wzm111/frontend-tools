import { createRouter, createWebHistory } from 'vue-router'
const routes = [
  { path: '/json2ts/', component: () => import('@/views/index/Index.vue') }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router