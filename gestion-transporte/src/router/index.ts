import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';

const routes: Array<RouteRecordRaw> = [
  {
    path: '',
    redirect: '/home'
  },
  {
    path: '/',
    component: () => import ('../views/components/SideBar.vue'),
    children: [
      {path: 'home', component: () => import ('../views/HomePage.vue')},
      {path: 'profile', component: () => import ('../views/ProfilePage.vue')},
    ]
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import ('../views/LoginPage.vue')
  },
  {
    path: '/signup',
    name: 'Sign Up',
    component: () => import ('../views/SignupPage.vue')
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
