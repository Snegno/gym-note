<script setup>
  import { useRoute } from 'vue-router'
  import IconPlus from '@/components/icons/IconPlus.vue'
  import IconExit from '@/components/icons/IconExit.vue'
  import { useUserStore } from '@/stores/userStore.js'

  const route = useRoute()

  const userStore = useUserStore()

  const onLogout = () => userStore.logout()

</script>

<template>
  <div class="relative min-h-[60px]">
    <div
      style="color: rgba(255,38,38,0.4); font-size: 34px;"
      class="absolute top-0 left-0 h-full p-1"
      @click="onLogout"
    >
      <IconExit width="30px" height="30px" class="h-full" />
    </div>
    <div class="sides h-full flex justify-center items-center text-3xl  font-sans font-bold">
      {{ route.meta.title }}
    </div>
  </div>
</template>

<style scoped lang="less">

</style>
