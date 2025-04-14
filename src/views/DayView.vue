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

  const getDayExercises = async () => {
    console.log('getDayExercises')
    try {
      const response = await api.get(`/day_exercises/${route.query.id}`, {
        params: {
          user_id: userStore.getUser.id,
        }
      })
      initialPreSelectedCards(response.data)
    } catch (error) {
      console.error('Ошибка загрузки:', error);
    }
  }

  const initialPreSelectedCards = gotExercise => {
    console.log('initialPreSelectedCards')
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
        count: +card.count || 0,
        is_update: true,
      })

      getDayExercises()
      getExercisesCards()
    } catch (error) {
      console.error('Ошибка добавления:', error.response?.data);
    }
  }

  const onChangeCardDebounce = debounce(card => updateDayExercise(card), 1000)

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

  onMounted(async() => {
    console.log('mounted')
    await getExercisesCards()
    await getDayExercises()
  })

  const OnCloseModal = () => canShowModal.value = false

</script>

<template>
  <div class="w-full h-full flex flex-col items-center gap-2 p-2">
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

    <el-button
      type="info"
      size="large"
      class="mt-4"
      @click="canShowModal = true"
    >
      упражнения
    </el-button>
  </div>

  <div
    v-if="canShowModal"
    class="day_modal shadow"
    v-click-outside="OnCloseModal"
  >
    <div class="title mb-3 w-full text-center relative">
      <h4>Упражнения</h4>
      <IconClose
        class="absolute top-[-4px] right-[-4px]"
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
        <IconDone />
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
  .day_modal {
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: center;
    position: fixed;
    padding: 8px;
    top: 5%;
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
