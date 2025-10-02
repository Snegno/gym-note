<script setup>
  import { useRoute, useRouter } from 'vue-router'
  import { computed } from 'vue'
  import IconArrow from '@/components/icons/IconArrow.vue'

  const route = useRoute()
  const router = useRouter()
  const isDay = computed(() => route.name === 'day')

  const checkButtonName = computed(() => {
    if (route.name !== 'main' && route.name !== 'exercises') {
      return 'exercises'
    } else if (route.name !== 'main') {
      return 'days'
    }
  })

  const onClickFooterBtn = () => router.push({ name: checkButtonName.value })

</script>

<template>
  <div class="sides min-h-[60px] flex justify-center items-center text-3xl  font-sans font-bold">
    <button
      v-if="!isDay"
      class="flex items-center gap-2"
      @click="onClickFooterBtn"
    >
      <IconArrow />
      {{ router.options.routes.find(item => item.name == checkButtonName).meta.title }}
    </button>

    <div v-else class="flex w-full h-full text-2xl">
      <button
        v-for="page in ['exercises', 'days']"
        class="border-1 border-white w-full shadow-xs shadow-blue-700"
        @click="router.push({ name: page })"
      >
        {{ router.options.routes.find(item => item.name == page).meta.title }}
      </button>
    </div>
  </div>
</template>

<style scoped lang="less">

</style>
