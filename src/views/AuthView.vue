<script setup>
  import { useRoute, useRouter } from 'vue-router'
  import { computed, ref, watch } from 'vue'
  import api from '@/api/client.js'
  import { useUserStore } from '@/stores/userStore.js'
  import RegView from '@/views/RegView.vue'

  const route = useRoute()
  const router = useRouter()

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
      const res = await userStore.login(user.value)

      if (res) {
        await router.push('/')
      }
    } catch (err) {
      console.error('Error:', err)
    } finally {
      isLoading.value = false
    }
  }

</script>

<template>
  <div
    v-if="!isLogin & route.name !== 'reg'"
    class="main flex flex-col justify-between"
  >
    <form
      class="flex flex-col gap-3 w-50"
      style="margin-bottom: 35%"
    >
      <div class="flex flex-col">
        <label for="login">
          Логин
        </label>
        <input
          v-model="user.name"
          id="login"
          class="border p-2 h-[60px] rounded text-lg"
          type="text"
        >
      </div>
      <div class="flex flex-col">
        <label for="password">
          Пароль
        </label>
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
        Войти
      </el-button>

      <router-link to="/reg" class="mt-6 underline text-center">
        Регистрация
      </router-link>
    </form>
  </div>

  <template v-else-if="route.name === 'reg'">
    <RegView />
  </template>
</template>

<style scoped>
  @import "tailwindcss";

  .btnt3 {
  @apply text-white bg-black p-6 rounded-[20px] w-50 text-lg;
  }
</style>
