<script setup>
  import { useRoute } from 'vue-router'
  import IconDone from '@/components/icons/IconDone.vue'
  import IconPlus from '@/components/icons/IconPlus.vue'
  import IconClose from '@/components/icons/IconClose.vue'
  import { onMounted, ref } from 'vue'
  import IconShow from '@/components/icons/IconShow.vue'
  import api from '@/api/client.js'
  import { useUserStore } from '@/stores/userStore.js'
  import { debounce } from '@/utils/debounce.js'

  const route = useRoute()

  const userStore = useUserStore()

  const canShowModal = ref(false)

  const canShowCard = ref(false)

  const selectedCards = ref([])

  const currentCard = ref(null)

  const isLoading = ref(false)

  const isLoaded = ref(false)

  const getDayExercises = async () => {
    isLoading.value = true
    try {
      const response = await api.get(`/day_exercises/${route.query.id}`, {
        params: {
          user_id: userStore.getUser.id,
        }
      })
      initialPreSelectedCards(response.data)
    } catch (error) {
      console.error('Ошибка загрузки:', error);
    } finally {
      isLoading.value = false
    }
  }

  const initialPreSelectedCards = gotExercise => {
    selectedCards.value = gotExercise.map(item => {
      return {
        id: item.exercise_id,
        description: item.exercise_description,
        weight: item.weight,
        count: item.count,
        can_show: item.exercise_id === currentCard.value?.id,
      }
    })
  }

  const addDayExercise = async card => {
    try {
      const response = await api.post(`/day_exercises`, {
        day_id: route.query.id,
        user_id: userStore.user.id,
        exercise_id: card.id,
        exercise_description: card.description,
        weight: card.weight || 0,
        count: card.count || 0,
      })

      getDayExercises()
      getExercisesCards()
    } catch (error) {
      console.error('Ошибка добавления:', error.response?.data);
    }
  }

  const updateDayExercise = async card => {
    console.log('updateDayExercise')
    currentCard.value = card

    try {
      const response = await api.post(`/day_exercises`, {
        day_id: +route.query.id,
        user_id: userStore.user.id,
        exercise_id: card.id,
        exercise_description: card.description,
        weight: +card.weight,
        count: +card.count || null,
        is_update: true,
      })

      getDayExercises()
      getExercisesCards()
    } catch (error) {
      console.error('Ошибка добавления:', error.response?.data);
    }
  }

  const onChangeCardDebounce = debounce(card => updateDayExercise(card), 3000)

  const onChangeCard = card => {
    onChangeCardDebounce(card)
  }

  const delDayExercise = async card => {
    try {
      const response = await api.delete(`/day_exercises/${card.id}`, {
        params: {
          user_id: userStore.user.id,
          day_id: route.query.id,
        }
      })

      if (response.data.success) {
        getDayExercises()
        //getExercisesCards()
      }
    } catch (error) {
      console.error('Ошибка добавления:', error.response?.data);
    }
  }

  const onSelectCard = card => {
    if (selectedCards.value.some(item => item.id === card.id)) {
      delDayExercise(card)
    } else {
      addDayExercise(card)
    }
  }

  const gotCards = ref([])

  const getExercisesCards = async () => {
    try {
      const response = await api.get(`/exercises/${userStore.getUser.id}`)
      gotCards.value = response.data

    } catch (error) {
      console.error('Ошибка загрузки:', error);
    }
  }

  const OnCloseModal = () => canShowModal.value = false

  const timer = ref(null)
  const interval_id = ref(null)

  const vibrateTimerEnd = () => {
    // 1. Пытаемся использовать стандартную вибрацию
    if ("vibrate" in navigator) {
      // Паттерн для уведомления: вибро-пауза-вибро-пауза-вибро
      const pattern = [300, 200, 300, 200, 300];

      // Создаем невидимую кнопку для iOS
      const vibrateButton = document.createElement('button');
      vibrateButton.style.position = 'fixed';
      vibrateButton.style.opacity = '0';
      vibrateButton.style.height = '0';
      vibrateButton.style.width = '0';
      vibrateButton.textContent = 'Vibrate';

      vibrateButton.addEventListener('click', () => {
        // Пытаемся вибрировать при реальном клике
        const success = navigator.vibrate(pattern);

        if (!success) {
          // 2. Fallback 1: Пытаемся использовать Web Audio
          try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = ctx.createOscillator();
            oscillator.type = 'sine';
            oscillator.frequency.value = 800;
            oscillator.connect(ctx.destination);
            oscillator.start();
            oscillator.stop(ctx.currentTime + 0.3);
          } catch (e) {
            // 3. Fallback 2: Показываем визуальное уведомление
            const notification = document.createElement('div');
            notification.style.position = 'fixed';
            notification.style.bottom = '20px';
            notification.style.left = '50%';
            notification.style.transform = 'translateX(-50%)';
            notification.style.padding = '10px 20px';
            notification.style.background = 'rgba(0,0,0,0.7)';
            notification.style.color = 'white';
            notification.style.borderRadius = '5px';
            notification.textContent = 'Таймер завершён!';
            document.body.appendChild(notification);

            setTimeout(() => {
              document.body.removeChild(notification);
            }, 3000);
          }
        }

        document.body.removeChild(vibrateButton);
      });

      document.body.appendChild(vibrateButton);
      vibrateButton.click();
    } else {
      // 4. Final Fallback: Просто выводим в консоль
      alert('Таймер!!1!1');
    }
  };

  const onTimerStart = () => {
    const saved_timer = timer.value

    if (interval_id.value) {
      clearInterval(interval_id.value)
    }

    interval_id.value = setInterval(() => {
      if (timer.value > 0) {
        timer.value --
      } else if (timer.value === 0) {
        clearInterval(interval_id.value)
        timer.value = saved_timer
        vibrateTimerEnd()
      }
    }, 1000)
  }

  onMounted(async() => {
    await getDayExercises()
    await getExercisesCards()

    setTimeout(() => isLoaded.value = true, 200)
    // isLoaded.value = true
  })



</script>

<template>
  <div
    v-loading="isLoading & !isLoaded"
    class="w-full h-full flex flex-col items-center gap-2 p-2 overflow-y-auto"
  >
    <div
      v-for="card in selectedCards"
      :key="card.id"
      class="card flex flex-col relative"
      @click="card.can_show = !card.can_show"
    >
      <div class="my-3">
        {{ card.description }}
      </div>
      <div
        v-show="card.can_show"
        class="flex justify-between gap-16 py-1"
      >
        <div>
          <input
            class="w-[65%] h-10 border border-gray-300 rounded-lg text-center"
            type="text"
            v-model="card.weight"
            @input="onChangeCard(card)"
            @click.stop="() => card.weight=''"
            @focusout="() => {}"
          >
          <span class="ms-2">кг</span>
        </div>
        <div>
          <input
            class="w-[65%] h-10 border border-gray-300 rounded-lg text-center"
            type="text"
            v-model="card.count"
            @input="onChangeCard(card)"
            @click.stop="() => card.count=''"
            @focusout="() => {}"
          >
          <span class="ms-2">раз</span>
        </div>
      </div>
      <div class="absolute left-[50%] translate-x-[-50%] bottom-0">
        <IconShow
          class="transition-all duration-400 ease-in-out"
          :class="{ 'rotate-0' : card.can_show , 'rotate-180' : !card.can_show }"
        />
      </div>
    </div>

    <div v-if="isLoaded" class="absolute top-[0px] h-[25px] right-[-2px] flex gap-0 w-20 mt-5 opacity-50" @click.stop>
      <input
        v-model="timer"
        class="w-[40px] border border-red rounded-md text-center bg-gray-300"
        type="number"
      >
      <div class="w-full h-full flex items-center" @click="onTimerStart">
        <svg width="40" height="40" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="47" r="35" fill="#FF5349" stroke="#333" stroke-width="3"/>
          <line x1="50" y1="35" x2="50" y2="65" stroke="#333" stroke-width="3" stroke-linecap="round"/>
        </svg>
      </div>
    </div>

    <el-button
      type="info"
      size="large"
      class="mt-4"
      @click="canShowModal = true"
    >
      упражнения
    </el-button>
  </div>

  <div v-if="canShowModal" class="day_modal__wrapper">
    <div
      class="day_modal shadow"
      v-click-outside="OnCloseModal"
    >
      <div class="title mb-3 w-full text-center relative">
        <p class="text-[22px]">Упражнения</p>
        <IconClose
          class="absolute top-[-6px] right-[-4px]"
          @click="canShowModal = false"
        />
      </div>
      <div
        v-for="card in gotCards"
        :key="card.id"
        class="card relative"
        :class="{ 'shadow shadow-2xl shadow-md rounded-lg' : selectedCards.some(item => item.id === card.id) }"
        @click="onSelectCard(card)"
      >
        {{ card.description }}
        <div
          v-show="selectedCards.some(item => item.id === card.id)"
          class="absolute right-1 top-1.5"
        >
          <IconDone/>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">

  .day_modal__wrapper {
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 1001;
    position: fixed;
    height: 100%;
    width: 100%;
    top: 0;
    left: 0;
    pointer-events: none;
  }

  .day_modal {
    z-index: 1002;
    pointer-events: auto;
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: center;
    position: fixed;
    padding: 8px;
    top: 0;
    padding-top: 10px;
    width: 100%;
    height: 100%;
    background-color: #f0efef;
    overflow-y: auto;
    border-radius: 5px;
    box-shadow: 0 0px 100px 60px rgba(0, 0, 0, 0.6);
  }

  .card {
    padding: 4px 12px 8px 12px;
    background-color: white;
    width: 98%;
    border-radius: 12px;
  }

  .card_grab_icon {
    touch-action: none;
    cursor: grab;
  }
</style>
