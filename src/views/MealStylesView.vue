<script setup>
import { onMounted } from 'vue'
import AppBreadcrumb from '../components/AppBreadcrumb.vue'
import LookupTableManager from '../components/LookupTableManager.vue'
import { useLookupsStore } from '../stores/lookups'

const lookups = useLookupsStore()

onMounted(() => lookups.fetchStyles())
</script>

<template>
  <div>
    <AppBreadcrumb page-title="Meal Styles" active-page="Meal Styles" />
    <LookupTableManager
      title="Meal Styles"
      :items="lookups.styles"
      :loading="lookups.loading"
      @create="(title) => lookups.createStyle(title)"
      @update="({ id, title }) => lookups.updateStyle(id, title)"
      @remove="(id) => lookups.removeStyle(id)"
    />
  </div>
</template>
