<script setup>
  import { DAYS_OF_WEEK } from '@/utils/constants.js'
  import { useRouter } from 'vue-router'

  const router = useRouter()

  const onSelectDay = day => {
    router.push({ name: `day`, query: { title: day.name, id: day.id } })
  }
</script>

<template>
  <div class="flex flex-col gap-3 items-center justify-center max-h-[75%]">
    <button
        v-for="day in DAYS_OF_WEEK"
        :key="day"
        class="btn"
        :class="{ 'btn--custom_color' : !day.id}"
        @click="onSelectDay(day)"
    >
      {{ day.name }}
    </button>
  </div>
</template>

<style scoped>
  @import "tailwindcss";
  .btn {
    background-color: #363637;
    @apply
      text-white p-2 h-[9vh] rounded-2xl w-3/4
      text-2xl font-semibold leading-tight shadow-gray-300 shadow-lg;
  }

  .btn--custom_color {
    background-color: #58585B;
  }
</style>
