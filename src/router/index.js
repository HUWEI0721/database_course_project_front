import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/views/LoginView.vue'
import SignUpView from '@/views/SignUpView.vue'
import ForumView from '@/views/ForumView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // 登录界面
    {
      path: '/',
      name: 'LoginView',
      component: LoginView
    },
    // 注册界面
    {
      path: '/signup',
      name: 'SignUpView',
      component: SignUpView
    },
    // 论坛界面
    {
      path: '/forum',
      name: 'ForumView',
      component: ForumView
    },

  ]
})

export default router
