import { defineStore } from 'pinia'
import api from '../api/client'

export const useLookupsStore = defineStore('lookups', {
  state: () => ({
    proteins: [],
    styles: [],
    loading: false,
  }),
  actions: {
    async fetchProteins() {
      const { data } = await api.get('/proteins')
      this.proteins = data.data ?? data
      return this.proteins
    },
    async fetchStyles() {
      const { data } = await api.get('/recipe-styles')
      this.styles = data.data ?? data
      return this.styles
    },
    async fetchAll() {
      this.loading = true
      try {
        await Promise.all([this.fetchProteins(), this.fetchStyles()])
      } finally {
        this.loading = false
      }
    },
    async createProtein(title) {
      const { data } = await api.post('/proteins', { title })
      const item = data.data ?? data
      this.proteins.push(item)
      return item
    },
    async updateProtein(id, title) {
      const { data } = await api.put(`/proteins/${id}`, { title })
      const item = data.data ?? data
      const idx = this.proteins.findIndex((p) => p.id === id)
      if (idx !== -1) this.proteins[idx] = item
      return item
    },
    async removeProtein(id) {
      await api.delete(`/proteins/${id}`)
      this.proteins = this.proteins.filter((p) => p.id !== id)
    },
    async createStyle(title) {
      const { data } = await api.post('/recipe-styles', { title })
      const item = data.data ?? data
      this.styles.push(item)
      return item
    },
    async updateStyle(id, title) {
      const { data } = await api.put(`/recipe-styles/${id}`, { title })
      const item = data.data ?? data
      const idx = this.styles.findIndex((s) => s.id === id)
      if (idx !== -1) this.styles[idx] = item
      return item
    },
    async removeStyle(id) {
      await api.delete(`/recipe-styles/${id}`)
      this.styles = this.styles.filter((s) => s.id !== id)
    },
  },
})
