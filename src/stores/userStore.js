import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/api/client.js'
import router from '@/router/index.js'

export const useUserStore = defineStore('user', () => {
  
  //state
  const user = ref(null)
  const isAuthenticated = ref(false)
  
  // getters
  const getUser = computed(() => user.value)
  const getAuthStatus = computed(() => isAuthenticated.value)
  
  // actions
  const login = async user_data => {
    try {
      const response = await api.post('/login', user_data);
      console.log({response})
      user.value = response.data;
      isAuthenticated.value = true;

      // Сохраняем в LocalStorage
      sessionStorage.setItem('user', JSON.stringify(response.data));
      sessionStorage.setItem('isAuthenticated', 'true');

      return true;
    } catch (err) {
      logout();
      throw err;
    }
  }

  const logout = () => {
    user.value = null
    isAuthenticated.value = false
    sessionStorage.removeItem('user')
    sessionStorage.removeItem('isAuthenticated')
    router.push('/')
  };

  // Инициализация из LocalStorage
  const initFromStorage = () => {
    const storedUser = sessionStorage.getItem('user');
    if (storedUser) {
      user.value = JSON.parse(storedUser);
      isAuthenticated.value = sessionStorage.getItem('isAuthenticated') === 'true';
    }
  };

  return {
    user,
    isAuthenticated,
    getUser,
    getAuthStatus,
    login,
    logout,
    initFromStorage
  };
});
