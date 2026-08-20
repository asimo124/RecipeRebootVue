<script setup>
import { onMounted } from 'vue'
import AppBreadcrumb from '../components/AppBreadcrumb.vue'
import LookupTableManager from '../components/LookupTableManager.vue'
import { useLookupsStore } from '../stores/lookups'

const lookups = useLookupsStore()

onMounted(() => lookups.fetchProteins())
</script>

<template>
  <div>
    <AppBreadcrumb page-title="Proteins" active-page="Proteins" />
    <LookupTableManager
      title="Proteins"
      :items="lookups.proteins"
      :loading="lookups.loading"
      @create="(title) => lookups.createProtein(title)"
      @update="({ id, title }) => lookups.updateProtein(id, title)"
      @remove="(id) => lookups.removeProtein(id)"
    />
  </div>
</template>
