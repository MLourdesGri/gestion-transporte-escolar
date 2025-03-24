import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';

const routes: Array<RouteRecordRaw> = [
  {
    path: '',
    redirect: '/login'
  },
  {
    path: '/',
    component: () => import ('../components/SideBar.vue'),
    children: [
      {path: 'home', component: () => import ('../views/HomePage.vue')},
      {path: 'profile', component: () => import ('../views/ProfilePage.vue')},
      {path: 'settings', component: () => import ('../views/SettingsPage.vue')},
      {path: 'vehicle', component: () => import ('../views/VehiclePage.vue')},
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
  },
  {
    path: '/assign-role',
    name: 'Assign Role',
    component: () => import ('../views/AssignRolePage.vue')
  },
  {
    path: '/users',
    name: 'Users',
    component: () => import ('../views/UsersPage.vue'),
  }, 
  {
    path: '/confirm-email/:token',
    name: 'ConfirmEmail',
    component: () => import ('../views/ConfirmEmailPage.vue')
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: () => import ('../views/ForgotPasswordPage.vue')
  },
  {
    path: '/reset-password/:token',
    name: 'ResetPassword',
    component: () => import ('../views/ResetPasswordPage.vue')
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
