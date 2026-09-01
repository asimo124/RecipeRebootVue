<script setup>
import { computed, onMounted, ref } from 'vue'
import AppBreadcrumb from '../components/AppBreadcrumb.vue'
import ConfirmModal from '../components/ConfirmModal.vue'
import IngredientPicker from '../components/IngredientPicker.vue'
import { useInventoryStore } from '../stores/inventory'

const inventory = useInventoryStore()
const pendingRemoveId = ref(null)
const search = ref('')

const filteredItems = computed(() => {
  const q = search.value.trim().toLowerCase()
  const items = [...inventory.items].sort((a, b) =>
    (a.ingredient?.title || '').localeCompare(b.ingredient?.title || '', undefined, {
      sensitivity: 'base',
    }),
  )
  if (!q) return items
  return items.filter((item) => {
    const title = item.ingredient?.title || ''
    const type = item.ingredient?.type?.title || ''
    return title.toLowerCase().includes(q) || type.toLowerCase().includes(q)
  })
})

const emptyMessage = computed(() => {
  if (!inventory.items.length) return 'Pantry is empty.'
  if (!filteredItems.value.length) return 'No matching pantry items.'
  return ''
})

onMounted(() => inventory.fetchAll())

async function onPick(ingredient) {
  await inventory.add(ingredient.id)
}

function removeItem(id) {
  pendingRemoveId.value = id
}

async function confirmRemove() {
  const id = pendingRemoveId.value
  pendingRemoveId.value = null
  if (id == null) return
  await inventory.remove(id)
}
</script>

<template>
  <div>
    <AppBreadcrumb page-title="Ingredients Inventory" active-page="Inventory" />

    <div class="card border-0">
      <div class="card-header flex flex-col gap-3">
        <p class="mb-0 text-neutral-500">{{ filteredItems.length }} pantry items</p>
        <div class="ingredients-filters">
          <label class="ingredients-filters__control ingredients-filters__search">
            <span>Search</span>
            <div class="icon-field">
              <input
                v-model="search"
                type="search"
                class="ingredients-filters__field bg-white dark:bg-dark-2 ps-10 border-neutral-200 dark:border-neutral-500 rounded-lg w-full"
                placeholder="Search inventory…"
              />
              <span class="icon">
                <iconify-icon icon="ion:search-outline"></iconify-icon>
              </span>
            </div>
          </label>
          <div class="ingredients-filters__control ingredients-filters__search">
            <span>Add</span>
            <IngredientPicker placeholder="Add ingredient to pantry…" @select="onPick" />
          </div>
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
                <tr v-for="item in filteredItems" :key="item.id">
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
                <tr v-if="!filteredItems.length">
                  <td colspan="3" class="text-neutral-500">{{ emptyMessage }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="mobile-only mobile-card-list">
            <div v-for="item in filteredItems" :key="item.id" class="mobile-card-item">
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
            <p v-if="!filteredItems.length" class="text-neutral-500 mb-0">{{ emptyMessage }}</p>
          </div>
        </template>
      </div>
    </div>

    <ConfirmModal
      :show="pendingRemoveId != null"
      title="Remove from pantry"
      message="Remove this ingredient from inventory?"
      confirm-label="Remove"
      danger
      @confirm="confirmRemove"
      @cancel="pendingRemoveId = null"
    />
  </div>
</template>
