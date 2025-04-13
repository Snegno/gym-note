<script setup>
  import { RouterView } from 'vue-router'
  import Header from '@/components/Header.vue'
  import { useRoute } from 'vue-router'
  import Footer from '@/components/Footer.vue'
  import { computed, onMounted, ref } from 'vue'
  import api from '@/api/client.js'
  import { useUserStore } from '@/stores/userStore.js'

  const route = useRoute()
  const userStore = useUserStore()

  const getUsers = async () => {
    const res = await api.get(`/users`)
  }

  // const addUser = async () => {
  //   try {
  //     const res = await api.post('/users', { name: 'natali' });
  //     console.log('User added:', res.data);
  //   } catch (error) {
  //     console.error('Error:', error.response?.data || error.message);
  //   }
  // }

  const user = ref({
    name: null,
    password: null,
  })

  const isLogin = computed(() => userStore.getAuthStatus)

  const onLogin = async () => {
    try {
      await userStore.login(user.value)
    } catch (err) {
      console.error('Error:', err)
    }

  }

  onMounted(async () => {

    await userStore.initFromStorage()
    getUsers()
  });

</script>

<template>
  <div class="main flex flex-col justify-between">
    <form v-if="!isLogin" class="flex flex-col gap-3 w-50" style="margin-bottom: 35%">
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
    </form>

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
    height: 100vh;
    background-color: #e8e8e8;
    display: flex;
    justify-content: center;
    align-items: center;
  }
</style>
