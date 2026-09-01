import { defineStore } from 'pinia'
import api from '../api/client'

function unwrap(data) {
  return data.data ?? data
}

function sortByTitle(items) {
  return [...items].sort((a, b) =>
    (a.title || '').localeCompare(b.title || '', undefined, { sensitivity: 'base' }),
  )
}

export const useIngredientsStore = defineStore('ingredients', {
  state: () => ({
    items: [],
    types: [],
    results: [],
    current: null,
    loading: false,
    error: null,
  }),
  actions: {
    async search(query) {
      const { data } = await api.get('/ingredients', { params: { search: query, limit: 20 } })
      this.results = unwrap(data)
      return this.results
    },
    async fetchAll() {
      const showLoading = this.items.length === 0
      if (showLoading) this.loading = true
      this.error = null
      try {
        const { data } = await api.get('/ingredients')
        this.items = sortByTitle(unwrap(data))
        return this.items
      } catch (e) {
        this.error = e.message
        throw e
      } finally {
        if (showLoading) this.loading = false
      }
    },
    async fetchTypes() {
      const { data } = await api.get('/ingredient-types')
      this.types = unwrap(data)
      return this.types
    },
    async fetchOne(id) {
      const { data } = await api.get(`/ingredients/${id}`)
      this.current = unwrap(data)
      return this.current
    },
    async create(titleOrPayload, ingredientTypeId = null) {
      const payload =
        typeof titleOrPayload === 'object' && titleOrPayload !== null
          ? titleOrPayload
          : { title: titleOrPayload, ingredient_type_id: ingredientTypeId }
      const { data } = await api.post('/ingredients', payload)
      const item = unwrap(data)
      this.items = sortByTitle([...this.items.filter((i) => i.id !== item.id), item])
      return item
    },
    async update(id, payload) {
      const { data } = await api.put(`/ingredients/${id}`, payload)
      const item = unwrap(data)
      const idx = this.items.findIndex((i) => i.id === id)
      if (idx !== -1) this.items[idx] = item
      else this.items.push(item)
      this.items = sortByTitle(this.items)
      this.current = item
      return item
    },
    async remove(id) {
      await api.delete(`/ingredients/${id}`)
      this.items = this.items.filter((i) => i.id !== id)
    },
    async batchUpdateType(ids, ingredientTypeId = null) {
      const { data } = await api.put('/ingredients/batch-type', {
        ids,
        ingredient_type_id: ingredientTypeId,
      })
      const updated = unwrap(data)
      const byId = Object.fromEntries(updated.map((item) => [item.id, item]))
      this.items = sortByTitle(this.items.map((item) => byId[item.id] ?? item))
      return updated
    },
  },
})
