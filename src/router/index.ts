import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: () => import('@/views/HomeView.vue'),
    },
    {
      path: '/search',
      component: () => import('@/views/SearchView.vue'),
    },
    {
      path: '/search/provider/:code',
      component: () => import('@/views/ProviderGamesView.vue'),
    },
    {
      path: '/search/game-type/:code',
      component: () => import('@/views/GameTypeGamesView.vue'),
    },
  ],
})

export default router
