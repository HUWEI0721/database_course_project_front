import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/views/LoginView.vue'
import SignUpView from '@/views/SignUpView.vue'
import ForumView from '@/views/ForumView.vue'
import PostDetail from '@/views/PostDetail.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // 登录界面
    {
      path: '/login',
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
      //path: '/forum',
      path: '/',
      name: 'ForumView',
      component: ForumView
    },
    // 帖子细节界面
    {
      path: '/post/:postID',
      //path: '/',
      name: 'PostDetail',
      component: PostDetail,
      props: true
    }

  ]
})

export default router
