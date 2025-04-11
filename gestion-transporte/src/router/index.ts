import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import { useUserStore } from '@/store/user';
import type { RouteLocationNormalized } from 'vue-router';

const routes: Array<RouteRecordRaw> = [
  {
    path: '',
    name: 'Login',
    redirect: '/login'
  },
  {
    path: '/',
    component: () => import('../components/SideBar.vue'),
    children: [
      { path: '', component: () => import('../views/HomePage.vue') },
      { path: 'home', component: () => import('../views/HomePage.vue') },
      { path: 'home/new-trip', component: () => import('../views/NewTripPage.vue') },
  
      { path: 'profile', component: () => import('../views/ProfilePage.vue') },
      { path: 'settings', component: () => import('../views/SettingsPage.vue') },
  
      { path: 'authorization', component: () => import('../views/AuthorizationPage.vue') },
      { path: 'authorization/new-authorization', component: () => import('../views/NewAuthorizationPage.vue') },
      { path: 'authorization/:id', component: () => import('../views/AuthorizationDetailsPage.vue') },
  
      { path: 'children', component: () => import('../views/ChildrenPage.vue') },
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
  {
    path: '/success',
    name: 'Success',
    component: () => import ('../views/SuccessPage.vue')
  },
  {
    path: '/map',
    name: 'Map',
    component: () => import ('../views/MapPage.vue')
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

router.beforeEach((to: RouteLocationNormalized, from, next) => {
  const userStore = useUserStore();
  const publicPages = ['/login', '/signup', '/forgot-password', '/reset-password', '/confirm-email/:token'];
  const isPublic = publicPages.includes(to.path);
  const isLoggedIn = !!userStore.token;

  if (!isLoggedIn && !isPublic) {
    return next('/login');
  }

  next();
});

export default router
