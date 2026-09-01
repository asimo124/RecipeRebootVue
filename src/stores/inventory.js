import { defineStore } from 'pinia'
import api from '../api/client'

function sortByIngredientTitle(items) {
  return [...items].sort((a, b) =>
    (a.ingredient?.title || '').localeCompare(b.ingredient?.title || '', undefined, {
      sensitivity: 'base',
    }),
  )
}

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
        this.items = sortByIngredientTitle(data.data ?? data)
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
      const without = this.items.filter((i) => i.id !== item.id)
      this.items = sortByIngredientTitle([...without, item])
      return item
    },
    async remove(id) {
      await api.delete(`/inventory/${id}`)
      this.items = this.items.filter((i) => i.id !== id)
    },
  },
})
