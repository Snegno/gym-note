<script setup>
  import { onMounted, ref } from 'vue'
  import IconDelete from '@/components/icons/IconDelete.vue'
  import { useUserStore } from '@/stores/userStore.js'
  import { debounce } from '@/utils/debounce.js'
  import api from '@/api/client.js'
  import { ElMessage } from 'element-plus'

  const userStore = useUserStore()

  const focusedCard = ref(null)

  const cards = ref(null)

  const isSended = ref(true)

  const isLoading = ref(false)

  const onAddCard = () => {
    if (!cards.value[cards.value.length-1]?.description) return

    cards.value.push(
      {
        id: null,
        description: '',
      }
    )
  }

  const handleFocus = index => focusedCard.value = index

  const handleBlur = () => setTimeout(() => focusedCard.value = null, 200)

  const getExercisesCards = async () => {
    try {
      isLoading.value = true
      const response = await api.get(`/exercises/${userStore.getUser.id}`)
      cards.value = response.data

      if (cards.value.length === 0) {
        cards.value.push(
          {
            id: null,
            description: '',
          }
        )
      }
    } catch (error) {
      console.error('Ошибка загрузки:', error);
    } finally {
      isLoading.value = false
    }
  }

  const onDelExercise = async id => {
    try {
      const response = await api.delete(`/exercises/${id}`, {
        params: {
          user_id: userStore.getUser.id,
        }
      })
      await getExercisesCards()
    } catch (error) {
      console.error(error)
      ElMessage.error('Упражнение используется!')
    }
  }

  const addExercise = async card => {
    try {
      const response = await api.post(`/exercises`, {
        id: card.id,
        user_id: userStore.user.id,
        description: card.description,
      })

      await getExercisesCards()
    } catch (error) {
      console.error('Ошибка добавления:', error.response?.data);
    } finally {
      isSended.value = true
    }
  }

  const onChangeTabDebounce = debounce(card => addExercise(card), 1000)

  const onChangeTab = card => {
    isSended.value = false
    onChangeTabDebounce(card)
  }

  onMounted(async () => {
    await getExercisesCards()
  })

</script>

<template>
  <div v-loading="isLoading" class="flex flex-col h-full items-center m-2 gap-2 overflow-auto pb-20">
    <div
      v-for="(tab, index) in cards"
      :key="tab.id"
      class="exercise_card"
      :class="{ 'exercise_card--active': focusedCard === index }"
    >
      <el-input
        v-model="tab.description"
        autosize
        class="exercise_card__input"
        type="textarea"
        placeholder="название упражнения.."
        resize="none"
        @input="onChangeTab(tab)"
        @focus="handleFocus(index)"
        @blur="handleBlur"
      />
      <div
        v-if="tab.description"
        class="exercise_card__del"
        @click="onDelExercise(tab.id)"
      >
        <IconDelete class="exercise_card__del_icon" />
      </div>
    </div>

    <el-button
      type="info"
      size="large"
      class="mt-4"
      @click="onAddCard"
      :disabled="!isSended"
    >
      Добавить
    </el-button>

  </div>
</template>

<style scoped lang="less">

  .exercise_card {
    width: 100%;
  }

  .exercise_card--active {
    position: relative;
  }

  .exercise_card--active .exercise_card__del {
    display: flex;
  }

  .exercise_card__del {
    display: none;
    justify-content: center;
    align-items: center;
    position: absolute;
    background-color: rgba(255, 0, 0, 0.2);
    height: 100%;
    width: 3em;
    top: 0;
    right: 0;
  }

  .exercise_card__del_icon {
    opacity: 0.7;
  }

</style>
