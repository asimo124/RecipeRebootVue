<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import AppBreadcrumb from '../components/AppBreadcrumb.vue'
import IngredientPicker from '../components/IngredientPicker.vue'
import { useRecipesStore } from '../stores/recipes'
import { useLookupsStore } from '../stores/lookups'

const recipes = useRecipesStore()
const lookups = useLookupsStore()

const showModal = ref(false)
const saving = ref(false)
const form = reactive({
  id: null,
  title: '',
  protein_id: '',
  recipe_style_id: '',
  last_date_made: '',
  recipe_link: '',
  image_path: '',
  ingredients: [],
  attributes: [],
})

const isEditing = computed(() => form.id != null)

watch(showModal, (open) => {
  document.body.classList.toggle('modal-open', open)
})

onMounted(async () => {
  await Promise.all([recipes.fetchAll(), lookups.fetchAll()])
})

function resetForm() {
  form.id = null
  form.title = ''
  form.protein_id = ''
  form.recipe_style_id = ''
  form.last_date_made = ''
  form.recipe_link = ''
  form.image_path = ''
  form.ingredients = []
  form.attributes = []
}

function openCreate() {
  resetForm()
  showModal.value = true
}

async function openEdit(row) {
  resetForm()
  const full = await recipes.fetchOne(row.id)
  form.id = full.id
  form.title = full.title || ''
  form.protein_id = full.protein_id ?? ''
  form.recipe_style_id = full.recipe_style_id ?? ''
  form.last_date_made = full.last_date_made || ''
  form.recipe_link = full.recipe_link || ''
  form.image_path = full.image_path || ''
  form.ingredients = [...(full.ingredients || [])]
  form.attributes = [...(full.attributes || [])]
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  document.body.classList.remove('modal-open')
}

function onPickIngredient(ingredient) {
  if (form.ingredients.some((i) => i.id === ingredient.id)) return
  form.ingredients.push(ingredient)
}

function removeIngredient(id) {
  form.ingredients = form.ingredients.filter((i) => i.id !== id)
}

function isAttributeSelected(id) {
  return form.attributes.some((a) => a.id === id)
}

function toggleAttribute(attribute) {
  if (isAttributeSelected(attribute.id)) {
    form.attributes = form.attributes.filter((a) => a.id !== attribute.id)
    return
  }
  form.attributes.push(attribute)
}

async function save() {
  if (!form.title.trim()) return
  saving.value = true
  try {
    const payload = {
      title: form.title.trim(),
      protein_id: form.protein_id || null,
      recipe_style_id: form.recipe_style_id || null,
      last_date_made: form.last_date_made || null,
      recipe_link: form.recipe_link || null,
      image_path: form.image_path || null,
      ingredient_ids: form.ingredients.map((i) => i.id),
      attribute_ids: form.attributes.map((a) => a.id),
    }
    if (isEditing.value) {
      await recipes.update(form.id, payload)
    } else {
      await recipes.create(payload)
    }
    await recipes.fetchAll()
    closeModal()
  } finally {
    saving.value = false
  }
}

async function removeRecipe(id) {
  if (!confirm('Delete this recipe?')) return
  await recipes.remove(id)
}
</script>

<template>
  <div>
    <AppBreadcrumb page-title="Recipes" active-page="Recipes" />

    <div class="card border-0">
      <div class="card-header flex flex-wrap items-center justify-between gap-3">
        <p class="mb-0 text-neutral-500">{{ recipes.items.length }} recipes</p>
        <button
          type="button"
          class="btn btn-sm text-white bg-primary-600 hover:bg-primary-700 flex items-center gap-2"
          @click="openCreate"
        >
          <i class="ri-add-line"></i> Add Recipe
        </button>
      </div>
      <div class="card-body">
        <p v-if="recipes.loading" class="text-neutral-500">Loading…</p>
        <p v-else-if="recipes.error" class="text-danger-600">{{ recipes.error }}</p>
        <template v-else>
          <!-- Desktop table -->
          <div class="table-responsive scroll-sm desktop-only">
            <table class="table bordered-table mb-0">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Protein</th>
                  <th>Style</th>
                  <th>Gluten</th>
                  <th>Last Made</th>
                  <th>Link</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in recipes.items" :key="row.id">
                  <td class="font-medium">{{ row.title }}</td>
                  <td>{{ row.protein?.title || '—' }}</td>
                  <td>{{ row.style?.title || '—' }}</td>
                  <td>
                    <span
                      class="px-3 py-1 rounded-full text-sm font-medium"
                      :class="
                        row.contains_gluten
                          ? 'bg-warning-100 text-warning-600'
                          : 'bg-success-100 text-success-600'
                      "
                    >
                      {{ row.contains_gluten ? 'Yes' : 'No' }}
                    </span>
                  </td>
                  <td>{{ row.last_date_made || '—' }}</td>
                  <td>
                    <a
                      v-if="row.recipe_link"
                      :href="row.recipe_link"
                      target="_blank"
                      rel="noopener"
                      class="text-primary-600"
                    >
                      View
                    </a>
                    <span v-else>—</span>
                  </td>
                  <td>
                    <div class="flex items-center gap-2">
                      <button
                        type="button"
                        class="w-8 h-8 bg-success-100 text-success-600 rounded-full inline-flex items-center justify-center"
                        @click="openEdit(row)"
                      >
                        <iconify-icon icon="lucide:edit"></iconify-icon>
                      </button>
                      <button
                        type="button"
                        class="w-8 h-8 bg-danger-100 text-danger-600 rounded-full inline-flex items-center justify-center"
                        @click="removeRecipe(row.id)"
                      >
                        <iconify-icon icon="mingcute:delete-2-line"></iconify-icon>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Mobile cards -->
          <div class="mobile-only mobile-card-list">
            <div v-for="row in recipes.items" :key="row.id" class="mobile-card-item">
              <div class="mobile-card-item__title">{{ row.title }}</div>
              <div class="mobile-card-item__meta">
                <span>{{ row.protein?.title || 'No protein' }}</span>
                <span>{{ row.style?.title || 'No style' }}</span>
                <span>{{ row.contains_gluten ? 'Gluten' : 'Gluten-free' }}</span>
                <span v-if="row.last_date_made">Made {{ row.last_date_made }}</span>
              </div>
              <div class="mobile-card-item__actions">
                <a
                  v-if="row.recipe_link"
                  :href="row.recipe_link"
                  target="_blank"
                  rel="noopener"
                  class="btn btn-sm bg-primary-50 text-primary-600"
                >
                  View link
                </a>
                <button
                  type="button"
                  class="w-8 h-8 bg-success-100 text-success-600 rounded-full inline-flex items-center justify-center"
                  @click="openEdit(row)"
                >
                  <iconify-icon icon="lucide:edit"></iconify-icon>
                </button>
                <button
                  type="button"
                  class="w-8 h-8 bg-danger-100 text-danger-600 rounded-full inline-flex items-center justify-center"
                  @click="removeRecipe(row.id)"
                >
                  <iconify-icon icon="mingcute:delete-2-line"></iconify-icon>
                </button>
              </div>
            </div>
            <p v-if="!recipes.items.length" class="text-neutral-500 mb-0">No recipes yet.</p>
          </div>
        </template>
      </div>
    </div>

    <Teleport to="body">
      <div
        v-if="showModal"
        class="fixed inset-0 flex items-start justify-center overflow-y-auto bg-black/50 p-3 sm:p-6"
        style="z-index: 1100"
        @click.self="closeModal"
      >
        <div
          class="card border-0 w-full max-w-3xl my-4 sm:my-8 relative shadow-xl recipe-modal-panel"
          style="z-index: 1101"
        >
          <div class="card-header flex items-center justify-between gap-3">
            <h3 class="mb-0 text-base sm:text-lg font-semibold">
              {{ isEditing ? 'Edit Recipe' : 'Add Recipe' }}
            </h3>
            <button type="button" class="text-neutral-500 shrink-0" @click="closeModal">
              <iconify-icon icon="lucide:x" class="text-xl"></iconify-icon>
            </button>
          </div>
          <div class="card-body space-y-4">
            <div>
              <label class="block text-sm font-medium mb-1">Title</label>
              <input
                v-model="form.title"
                type="text"
                class="bg-white dark:bg-dark-2 border-neutral-200 dark:border-neutral-500 rounded-lg w-full"
              />
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium mb-1">Protein</label>
                <select
                  v-model="form.protein_id"
                  class="form-select dark:bg-dark-2 dark:text-white border-neutral-200 dark:border-neutral-500 w-full"
                >
                  <option value="">None</option>
                  <option v-for="p in lookups.proteins" :key="p.id" :value="p.id">{{ p.title }}</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium mb-1">Meal Style</label>
                <select
                  v-model="form.recipe_style_id"
                  class="form-select dark:bg-dark-2 dark:text-white border-neutral-200 dark:border-neutral-500 w-full"
                >
                  <option value="">None</option>
                  <option v-for="s in lookups.styles" :key="s.id" :value="s.id">{{ s.title }}</option>
                </select>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Last date made</label>
              <input
                v-model="form.last_date_made"
                type="date"
                class="bg-white dark:bg-dark-2 border-neutral-200 dark:border-neutral-500 rounded-lg w-full max-w-xs"
              />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Recipe link</label>
              <input
                v-model="form.recipe_link"
                type="url"
                class="bg-white dark:bg-dark-2 border-neutral-200 dark:border-neutral-500 rounded-lg w-full"
                placeholder="https://"
              />
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">Attributes</label>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <label
                  v-for="attr in lookups.attributes"
                  :key="attr.id"
                  class="flex items-center justify-between gap-2 rounded-lg border border-neutral-200 dark:border-neutral-600 px-3 py-2 cursor-pointer"
                >
                  <span class="inline-flex items-center gap-2 min-w-0">
                    <input
                      type="checkbox"
                      class="form-check-input"
                      :checked="isAttributeSelected(attr.id)"
                      @change="toggleAttribute(attr)"
                    />
                    <span class="break-words">{{ attr.title }}</span>
                  </span>
                  <span class="text-xs text-neutral-500 shrink-0">L{{ attr.severity_level }}</span>
                </label>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">Ingredients</label>
              <IngredientPicker @select="onPickIngredient" />
              <ul class="mt-3 space-y-2">
                <li
                  v-for="ing in form.ingredients"
                  :key="ing.id"
                  class="flex items-center justify-between gap-2 rounded-lg bg-neutral-50 dark:bg-neutral-700 px-3 py-2"
                >
                  <span class="min-w-0 break-words">{{ ing.title }}</span>
                  <button
                    type="button"
                    class="text-danger-600 shrink-0"
                    @click="removeIngredient(ing.id)"
                  >
                    Remove
                  </button>
                </li>
              </ul>
            </div>
          </div>
          <div class="card-footer flex flex-wrap justify-end gap-2">
            <button
              type="button"
              class="btn btn-sm bg-neutral-200 dark:bg-neutral-600"
              @click="closeModal"
            >
              Cancel
            </button>
            <button
              type="button"
              class="btn btn-sm text-white bg-primary-600 hover:bg-primary-700"
              :disabled="saving"
              @click="save"
            >
              {{ saving ? 'Saving…' : 'Save' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
