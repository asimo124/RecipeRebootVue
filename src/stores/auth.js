import { defineStore } from 'pinia'
import api from '../api/client'

const TOKEN_KEY = 'recipes_auth_token'
const USER_KEY = 'recipes_auth_user'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem(TOKEN_KEY) || null,
    user: JSON.parse(localStorage.getItem(USER_KEY) || 'null'),
    loading: false,
    error: null,
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
  },
  actions: {
    async login(email, password) {
      this.loading = true
      this.error = null
      try {
        const { data } = await api.post('/login', { email, password })
        this.token = data.token
        this.user = data.user
        localStorage.setItem(TOKEN_KEY, data.token)
        localStorage.setItem(USER_KEY, JSON.stringify(data.user))
        return data
      } catch (e) {
        this.error =
          e.response?.data?.message ||
          e.response?.data?.errors?.email?.[0] ||
          'Login failed'
        throw e
      } finally {
        this.loading = false
      }
    },
    async logout() {
      try {
        if (this.token) {
          await api.post('/logout')
        }
      } catch {
        // ignore network/logout failures
      } finally {
        this.clearSession()
      }
    },
    clearSession() {
      this.token = null
      this.user = null
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
    },
  },
})
