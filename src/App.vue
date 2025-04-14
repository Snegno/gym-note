<script setup>
  import { RouterView } from 'vue-router'
  import Header from '@/components/Header.vue'
  import { useRoute } from 'vue-router'
  import Footer from '@/components/Footer.vue'
  import { computed, onMounted, ref, watch } from 'vue'
  import api from '@/api/client.js'
  import { useUserStore } from '@/stores/userStore.js'
  import RegView from '@/views/RegView.vue'

  const route = useRoute()
  const userStore = useUserStore()

  const user = ref({
    name: null,
    password: null,
  })

  const isLoading = ref(false)

  const isLogin = computed(() => userStore.getAuthStatus)

  watch(() => isLogin.value, value => {
    if (!value) {
      userStore.logout()
    }
  })

  const onLogin = async () => {
    try {
      isLoading.value = true
      await userStore.login(user.value)
    } catch (err) {
      console.error('Error:', err)
    } finally {
      isLoading.value = false
    }
  }

  onMounted(async () => {
    console.log(route)
    await userStore.initFromStorage()
  })

</script>

<template>
  <div v-loading="isLoading" class="main flex flex-col justify-between">
    <form v-if="!isLogin & route.name !== 'reg'" class="flex flex-col gap-3 w-50" style="margin-bottom: 35%">
      <div class="flex flex-col">
        <label for="login">login</label>
        <input
          v-model="user.name"
          id="login"
          class="border p-2 h-[60px] rounded text-lg"
          type="text"
        >
      </div>
      <div class="flex flex-col">
        <label for="password">password</label>
        <input
          v-model="user.password"
          id="password"
          class="border p-2 h-[60px] rounded text-lg"
          type="password"
        >
      </div>
      <el-button
        class="mt-4"
        size="large"
        type="info"
        @click.prevent="onLogin"
      >
        enter
      </el-button>

      <router-link to="/reg" class="mt-6 underline text-center">Регистрация</router-link>
    </form>

    <template v-else-if="route.name === 'reg'">
      <RegView />
    </template>

    <div v-else class="flex flex-col justify-between h-full w-full">
      <Header v-if="route.path !== '/'"/>
      <RouterView/>
      <Footer v-if="route.path !== '/'"/>
    </div>
  </div>
</template>

<style scoped>
  @import "tailwindcss";

  .btnt3 {
    @apply text-white bg-black p-6 rounded-[20px] w-50 text-lg;
  }
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
