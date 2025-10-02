import { createRouter, createWebHashHistory } from 'vue-router'
import Start from '@/views/StartView.vue'
import Exercises from '@/views/ExercisesView.vue'
import Days from '@/views/DaysView.vue'
import Day from '@/views/DayView.vue'
import Reg from '@/views/RegView.vue'
import Auth from '@/views/AuthView.vue'
import { useUserStore } from '@/stores/userStore.js'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'main',
      component: Start,
      meta: {
        title: 'Главная',
      },
    },
    {
      path: '/login',
      name: 'login',
      component: Auth,
      meta: {
        title: 'Авторизация',
        isPublic: true,
      }
    },
    {
      path: '/reg',
      name: 'reg',
      component: Reg,
      meta: {
        title: 'Регистрация',
        isPublic: true,
      }
    },
    {
      path: '/exercises',
      name: 'exercises',
      component: Exercises,
      meta: {
        title: 'Упражнения',
      },
    },
    {
      path: '/days',
      name: 'days',
      component: Days,
      meta: {
        title: 'День недели',
      },
    },
    {
      path: '/day',
      name: 'day',
      component: Day,
      meta: {
        title: '',
      },
    },
  ],
})

router.beforeEach((to, from, next) => {
  // Устанавливаем заголовок
  if (to.query?.title) {
    to.meta.title = to.query.title;
  }

  const userStore = useUserStore()
  userStore.initFromStorage()

  const isAuth = userStore.getAuthStatus
  const isPublic = to.meta.isPublic

  if (isPublic && isAuth) return next({ name: 'main' })
  if (isPublic && !isAuth) return next()
  if (!isAuth) return next({ name: 'login' })

  return next()
});

export default router
