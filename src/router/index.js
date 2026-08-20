import { createRouter, createWebHistory } from 'vue-router'
import AppLayout from '../layouts/AppLayout.vue'
import RecipesView from '../views/RecipesView.vue'
import InventoryView from '../views/InventoryView.vue'
import ProteinsView from '../views/ProteinsView.vue'
import MealStylesView from '../views/MealStylesView.vue'
import LoginView from '../views/LoginView.vue'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { guest: true },
    },
    {
      path: '/',
      component: AppLayout,
      meta: { requiresAuth: true },
      children: [
        { path: '', redirect: '/recipes' },
        { path: 'recipes', name: 'recipes', component: RecipesView },
        { path: 'inventory', name: 'inventory', component: InventoryView },
        { path: 'proteins', name: 'proteins', component: ProteinsView },
        { path: 'meal-styles', name: 'meal-styles', component: MealStylesView },
      ],
    },
    { path: '/:pathMatch(.*)*', redirect: '/recipes' },
  ],
})

router.beforeEach((to) => {
  const auth = useAuthStore()

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (to.meta.guest && auth.isAuthenticated) {
    return { name: 'recipes' }
  }

  return true
})

export default router
