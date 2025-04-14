<script setup>
  import { useRouter, RouterView } from 'vue-router'
  import { ref } from 'vue'
  import api from '@/api/client.js'

  const router = useRouter()

  const new_user = ref({
    name: null,
    password: null,
  })

  const addNewUser = async () => {
    try {
      const response = await api.post('/register', {
        name: new_user.value.name,
        password: new_user.value.password,
      });

      console.log({response})
      if (response.data.id) {
        // Перенаправляем на страницу входа через 2 секунды
        setTimeout(() => {
          router.push('/');
        }, 1000);
      }

    } catch (err) {
      console.error(err || '');
    }
  }

  console.log('reggg')
</script>

<template>
  <div class="main flex flex-col justify-between">
    <form class="flex flex-col gap-3 w-50" style="margin-bottom: 35%">
      <div class="flex flex-col">
        <label for="login">имя</label>
        <input
          v-model="new_user.name"
          id="login"
          class="border p-2 h-[60px] rounded text-lg"
          type="text"
        >
      </div>
      <div class="flex flex-col">
        <label for="password">пароль</label>
        <input
          v-model="new_user.password"
          id="password"
          class="border p-2 h-[60px] rounded text-lg"
          type="text"
        >
      </div>
      <el-button
        class="mt-4"
        size="large"
        type="info"
        @click.prevent="addNewUser"
      >
        Зарегистрироваться
      </el-button>
      <router-link class="underline text-center mt-5" to="/" >назад</router-link>
    </form>

  </div>
</template>

<style scoped>
  @import "tailwindcss";
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

