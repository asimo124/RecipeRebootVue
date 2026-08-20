import { defineStore } from 'pinia'
import api from '../api/client'

export const useIngredientsStore = defineStore('ingredients', {
  state: () => ({
    results: [],
    loading: false,
  }),
  actions: {
    async search(query) {
      this.loading = true
      try {
        const { data } = await api.get('/ingredients', { params: { search: query, limit: 20 } })
        this.results = data.data ?? data
        return this.results
      } finally {
        this.loading = false
      }
    },
    async create(title, ingredientTypeId = null) {
      const { data } = await api.post('/ingredients', {
        title,
        ingredient_type_id: ingredientTypeId,
      })
      return data.data ?? data
    },
  },
})
