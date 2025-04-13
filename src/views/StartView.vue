<script setup>
  import router from '@/router/index.js'

  const buttons = [
    {
      title: 'Дни недели',
      route_name: 'days'
    },
    {
      title: 'Упражнения',
      route_name: 'exercises'
    },
  ]
  const onChangeRoute = route_name => router.push(route_name)
</script>

<template>
    <div class="flex flex-col items-center justify-center gap-4 h-full">
      <button
          v-for="button in buttons"
          class="btn"
          :key="button.title"
          @click="onChangeRoute(button.route_name)"
      >
        {{ button.title }}
      </button>
    </div>
</template>

<style scoped>
  @import "tailwindcss";

  .btn {
    @apply text-white bg-black p-10 rounded-2xl w-80 text-3xl font-semibold leading-tight;
  }
</style>

<style scoped lang="less">
  .tes {
    color: red;
  }
</style>
