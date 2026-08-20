import { defineStore } from 'pinia'
import api from '../api/client'

export const useInventoryStore = defineStore('inventory', {
  state: () => ({
    items: [],
    loading: false,
    error: null,
  }),
  actions: {
    async fetchAll() {
      this.loading = true
      this.error = null
      try {
        const { data } = await api.get('/inventory')
        this.items = data.data ?? data
      } catch (e) {
        this.error = e.message
        throw e
      } finally {
        this.loading = false
      }
    },
    async add(ingredientId) {
      const { data } = await api.post('/inventory', { ingredient_id: ingredientId })
      const item = data.data ?? data
      if (!this.items.find((i) => i.id === item.id)) {
        this.items.push(item)
      }
      return item
    },
    async remove(id) {
      await api.delete(`/inventory/${id}`)
      this.items = this.items.filter((i) => i.id !== id)
    },
  },
})
