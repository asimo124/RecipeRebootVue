<script setup>
import { onMounted } from 'vue'
import AppBreadcrumb from '../components/AppBreadcrumb.vue'
import IngredientPicker from '../components/IngredientPicker.vue'
import { useInventoryStore } from '../stores/inventory'

const inventory = useInventoryStore()

onMounted(() => inventory.fetchAll())

async function onPick(ingredient) {
  await inventory.add(ingredient.id)
  await inventory.fetchAll()
}

async function removeItem(id) {
  if (!confirm('Remove from inventory?')) return
  await inventory.remove(id)
}
</script>

<template>
  <div>
    <AppBreadcrumb page-title="Ingredients Inventory" active-page="Inventory" />

    <div class="card border-0">
      <div class="card-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p class="mb-0 text-neutral-500">{{ inventory.items.length }} pantry items</p>
        <div class="w-full sm:w-auto sm:max-w-md">
          <IngredientPicker placeholder="Add ingredient to pantry…" @select="onPick" />
        </div>
      </div>
      <div class="card-body">
        <p v-if="inventory.loading" class="text-neutral-500">Loading…</p>
        <p v-else-if="inventory.error" class="text-danger-600">{{ inventory.error }}</p>
        <template v-else>
          <div class="table-responsive scroll-sm desktop-only">
            <table class="table bordered-table mb-0">
              <thead>
                <tr>
                  <th>Ingredient</th>
                  <th>Type</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in inventory.items" :key="item.id">
                  <td class="font-medium">{{ item.ingredient?.title }}</td>
                  <td>{{ item.ingredient?.type?.title || '—' }}</td>
                  <td>
                    <button
                      type="button"
                      class="w-8 h-8 bg-danger-100 text-danger-600 rounded-full inline-flex items-center justify-center"
                      @click="removeItem(item.id)"
                    >
                      <iconify-icon icon="mingcute:delete-2-line"></iconify-icon>
                    </button>
                  </td>
                </tr>
                <tr v-if="!inventory.items.length">
                  <td colspan="3" class="text-neutral-500">Pantry is empty.</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="mobile-only mobile-card-list">
            <div v-for="item in inventory.items" :key="item.id" class="mobile-card-item">
              <div class="mobile-card-item__title">{{ item.ingredient?.title }}</div>
              <div class="mobile-card-item__meta">
                <span>{{ item.ingredient?.type?.title || 'Untyped' }}</span>
              </div>
              <div class="mobile-card-item__actions">
                <button
                  type="button"
                  class="w-8 h-8 bg-danger-100 text-danger-600 rounded-full inline-flex items-center justify-center"
                  @click="removeItem(item.id)"
                >
                  <iconify-icon icon="mingcute:delete-2-line"></iconify-icon>
                </button>
              </div>
            </div>
            <p v-if="!inventory.items.length" class="text-neutral-500 mb-0">Pantry is empty.</p>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
