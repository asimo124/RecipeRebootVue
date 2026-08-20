import { defineStore } from 'pinia'
import api from '../api/client'

export const useRecipesStore = defineStore('recipes', {
  state: () => ({
    items: [],
    current: null,
    loading: false,
    error: null,
  }),
  actions: {
    async fetchAll() {
      this.loading = true
      this.error = null
      try {
        const { data } = await api.get('/recipes')
        this.items = data.data ?? data
      } catch (e) {
        this.error = e.message
        throw e
      } finally {
        this.loading = false
      }
    },
    async fetchOne(id) {
      const { data } = await api.get(`/recipes/${id}`)
      this.current = data.data ?? data
      return this.current
    },
    async create(payload) {
      const { data } = await api.post('/recipes', payload)
      const recipe = data.data ?? data
      this.items.push(recipe)
      return recipe
    },
    async update(id, payload) {
      const { data } = await api.put(`/recipes/${id}`, payload)
      const recipe = data.data ?? data
      const idx = this.items.findIndex((r) => r.id === id)
      if (idx !== -1) this.items[idx] = { ...this.items[idx], ...recipe }
      this.current = recipe
      return recipe
    },
    async remove(id) {
      await api.delete(`/recipes/${id}`)
      this.items = this.items.filter((r) => r.id !== id)
    },
    async attachIngredient(recipeId, ingredientId) {
      const { data } = await api.post(`/recipes/${recipeId}/ingredients`, { ingredient_id: ingredientId })
      return data.data ?? data
    },
    async detachIngredient(recipeId, ingredientId) {
      const { data } = await api.delete(`/recipes/${recipeId}/ingredients/${ingredientId}`)
      return data.data ?? data
    },
  },
})
