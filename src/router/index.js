import { createRouter, createWebHashHistory } from 'vue-router'
import Start from '@/views/StartView.vue'
import Exercises from '@/views/ExercisesView.vue'
import Days from '@/views/DaysView.vue'
import Day from '@/views/DayView.vue'
import Reg from '@/views/RegView.vue'

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
      path: '/reg',
      name: 'reg',
      component: Reg,
      meta: {
        title: 'Регистрация',
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
  // Если в state есть title, обновляем meta.title
  console.log({to, from, next})

  if (to.query && to.query.title) {
    to.meta.title = to.query.title;
  }

  // Устанавливаем title страницы (если используете заголовок страницы)

  next();
});

export default router
