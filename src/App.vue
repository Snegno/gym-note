<script setup>
  import { useRoute } from 'vue-router'
  import Header from '@/components/Header.vue'
  import Footer from '@/components/Footer.vue'
  import { RouterView } from 'vue-router'
  import { ref } from 'vue'

  const route = useRoute()
  const isLoading = ref(false)

</script>

<template>
  <div
    v-loading="isLoading"
    class="main flex flex-col justify-between"
  >
    <div class="flex flex-col justify-between h-full w-full">
      <Header v-if="!['main', 'login', 'reg'].includes(route.name)"/>
      <RouterView />
      <Footer v-if="!['main', 'login', 'reg'].includes(route.name)"/>
    </div>
  </div>
</template>

<style scoped>

</style>

<style scoped lang="less">
  .main {
    height: 100%;
    background-color: #e8e8e8;
    display: flex;
    justify-content: center;
    align-items: center;
  }
</style>
