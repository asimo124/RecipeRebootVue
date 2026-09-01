<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import AppBreadcrumb from '../components/AppBreadcrumb.vue'
import ConfirmModal from '../components/ConfirmModal.vue'
import IngredientPicker from '../components/IngredientPicker.vue'
import { useIngredientsStore } from '../stores/ingredients'

const ingredients = useIngredientsStore()

const search = ref('')
const typeFilter = ref('')
const sortBy = ref('title')
const sortDir = ref('asc')
const showModal = ref(false)
const saving = ref(false)
const selectedIds = ref([])
const batchTypeId = ref('')
const batchSaving = ref(false)
const confirmKind = ref(null)
const pendingDeleteId = ref(null)
const form = reactive({
  id: null,
  title: '',
  ingredient_type_id: '',
  parents: [],
})

const isEditing = computed(() => form.id != null)

function compareNullable(a, b, dir) {
  const aEmpty = a == null || a === ''
  const bEmpty = b == null || b === ''
  if (aEmpty && bEmpty) return 0
  if (aEmpty) return dir === 'asc' ? -1 : 1
  if (bEmpty) return dir === 'asc' ? 1 : -1
  const cmp = a.localeCompare(b, undefined, { sensitivity: 'base' })
  return dir === 'asc' ? cmp : -cmp
}

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  const dir = sortDir.value
  return ingredients.items
    .filter((item) => {
      if (typeFilter.value && String(item.ingredient_type_id) !== String(typeFilter.value)) {
        return false
      }
      if (q && !item.title.toLowerCase().includes(q)) {
        return false
      }
      return true
    })
    .slice()
    .sort((a, b) => {
      if (sortBy.value === 'type') {
        const typeCmp = compareNullable(a.type?.title, b.type?.title, dir)
        if (typeCmp !== 0) return typeCmp
        return compareNullable(a.title, b.title, 'asc')
      }
      return compareNullable(a.title, b.title, dir)
    })
})

const selectedCount = computed(() => selectedIds.value.length)

const allFilteredSelected = computed(
  () => filtered.value.length > 0 && filtered.value.every((item) => selectedIds.value.includes(item.id)),
)

const someFilteredSelected = computed(
  () => filtered.value.some((item) => selectedIds.value.includes(item.id)),
)

const showConfirm = computed(() => confirmKind.value != null)

const confirmTitle = computed(() => (confirmKind.value === 'delete' ? 'Delete ingredient' : 'Update type'))

const confirmMessage = computed(() => {
  if (confirmKind.value === 'delete') {
    return 'Delete this ingredient? It will also be removed from recipes and the pantry.'
  }
  const count = selectedCount.value
  return `Set type of ${count} ingredient${count === 1 ? '' : 's'} to “${batchTypeLabel()}”?`
})

const confirmLabel = computed(() => (confirmKind.value === 'delete' ? 'Delete' : 'Update type'))

watch(showModal, (open) => {
  document.body.classList.toggle('modal-open', open)
})

onMounted(async () => {
  await Promise.all([ingredients.fetchAll(), ingredients.fetchTypes()])
})

function resetForm() {
  form.id = null
  form.title = ''
  form.ingredient_type_id = ''
  form.parents = []
}

function openCreate() {
  resetForm()
  showModal.value = true
}

async function openEdit(row) {
  resetForm()
  const full = await ingredients.fetchOne(row.id)
  form.id = full.id
  form.title = full.title || ''
  form.ingredient_type_id = full.ingredient_type_id ?? ''
  form.parents = [...(full.parents || [])]
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  document.body.classList.remove('modal-open')
}

function onPickParent(ingredient) {
  if (form.id && ingredient.id === form.id) return
  if (form.parents.some((p) => p.id === ingredient.id)) return
  form.parents.push(ingredient)
}

function removeParent(id) {
  form.parents = form.parents.filter((p) => p.id !== id)
}

function parentLabels(item) {
  const parents = item.parents || []
  if (!parents.length) return '—'
  return parents.map((p) => p.title).join(', ')
}

function isTypeSelected(typeId) {
  if (typeId === '' || typeId == null) {
    return form.ingredient_type_id === '' || form.ingredient_type_id == null
  }
  return String(form.ingredient_type_id) === String(typeId)
}

function isSelected(id) {
  return selectedIds.value.includes(id)
}

function toggleSelect(id) {
  if (selectedIds.value.includes(id)) {
    selectedIds.value = selectedIds.value.filter((selected) => selected !== id)
    return
  }
  selectedIds.value = [...selectedIds.value, id]
}

function toggleSelectAll() {
  const visibleIds = filtered.value.map((item) => item.id)
  if (allFilteredSelected.value) {
    selectedIds.value = selectedIds.value.filter((id) => !visibleIds.includes(id))
    return
  }
  selectedIds.value = [...new Set([...selectedIds.value, ...visibleIds])]
}

function clearSelection() {
  selectedIds.value = []
  batchTypeId.value = ''
}

function isBatchTypeSelected(typeId) {
  if (typeId === '' || typeId == null) {
    return batchTypeId.value === '' || batchTypeId.value == null
  }
  return String(batchTypeId.value) === String(typeId)
}

function batchTypeLabel() {
  const type = ingredients.types.find((item) => String(item.id) === String(batchTypeId.value))
  return type?.title || 'None'
}

async function applyBatchType() {
  if (!selectedIds.value.length) return
  confirmKind.value = 'batch'
}

function closeConfirm() {
  if (batchSaving.value) return
  confirmKind.value = null
  pendingDeleteId.value = null
}

async function onConfirm() {
  if (confirmKind.value === 'delete') {
    const id = pendingDeleteId.value
    confirmKind.value = null
    pendingDeleteId.value = null
    if (id == null) return
    await ingredients.remove(id)
    selectedIds.value = selectedIds.value.filter((selected) => selected !== id)
    return
  }

  batchSaving.value = true
  try {
    await ingredients.batchUpdateType(selectedIds.value, batchTypeId.value || null)
    clearSelection()
    confirmKind.value = null
  } finally {
    batchSaving.value = false
  }
}

async function save() {
  if (!form.title.trim()) return
  saving.value = true
  try {
    const payload = {
      title: form.title.trim(),
      ingredient_type_id: form.ingredient_type_id || null,
      parent_ids: form.parents.map((p) => p.id),
    }
    if (isEditing.value) {
      await ingredients.update(form.id, payload)
    } else {
      await ingredients.create(payload)
    }
    await ingredients.fetchAll()
    closeModal()
  } finally {
    saving.value = false
  }
}

async function removeIngredient(id) {
  pendingDeleteId.value = id
  confirmKind.value = 'delete'
}
</script>

<template>
  <div :class="{ 'has-ingredient-batch-dock': selectedCount }">
    <AppBreadcrumb page-title="Ingredients" active-page="Ingredients" />

    <div class="card border-0">
      <div class="card-header flex flex-col gap-3">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <p class="mb-0 text-neutral-500">{{ filtered.length }} ingredients</p>
          <button
            type="button"
            class="btn btn-sm text-white bg-primary-600 hover:bg-primary-700 flex items-center gap-2"
            @click="openCreate"
          >
            <i class="ri-add-line"></i> Add Ingredient
          </button>
        </div>
        <div class="ingredients-filters">
          <label class="ingredients-filters__control ingredients-filters__search">
            <span>Search</span>
            <div class="icon-field">
              <input
                v-model="search"
                type="search"
                class="ingredients-filters__field bg-white dark:bg-dark-2 ps-10 border-neutral-200 dark:border-neutral-500 rounded-lg w-full"
                placeholder="Search ingredients…"
              />
              <span class="icon">
                <iconify-icon icon="ion:search-outline"></iconify-icon>
              </span>
            </div>
          </label>
          <label class="ingredients-filters__control ingredients-filters__type">
            <span>Type</span>
            <select
              v-model="typeFilter"
              class="form-select ingredients-filters__field dark:bg-dark-2 dark:text-white border-neutral-200 dark:border-neutral-500"
            >
              <option value="">All types</option>
              <option v-for="type in ingredients.types" :key="type.id" :value="type.id">
                {{ type.title }}
              </option>
            </select>
          </label>
          <label class="ingredients-filters__control ingredients-filters__sort">
            <span>Sort by</span>
            <select
              v-model="sortBy"
              class="form-select ingredients-filters__field dark:bg-dark-2 dark:text-white border-neutral-200 dark:border-neutral-500"
            >
              <option value="title">Title</option>
              <option value="type">Type</option>
            </select>
          </label>
          <label class="ingredients-filters__control ingredients-filters__dir">
            <span>Dir</span>
            <select
              v-model="sortDir"
              class="form-select ingredients-filters__field dark:bg-dark-2 dark:text-white border-neutral-200 dark:border-neutral-500"
            >
              <option value="asc">Asc</option>
              <option value="desc">Desc</option>
            </select>
          </label>
        </div>
      </div>
      <div class="card-body">
        <p v-if="ingredients.loading" class="text-neutral-500">Loading…</p>
        <p v-else-if="ingredients.error" class="text-danger-600">{{ ingredients.error }}</p>
        <template v-else>
          <div class="table-responsive scroll-sm desktop-only">
            <table class="table bordered-table mb-0">
              <thead>
                <tr>
                  <th class="ingredient-select-col">
                    <input
                      type="checkbox"
                      class="form-check-input"
                      :checked="allFilteredSelected"
                      :indeterminate="someFilteredSelected && !allFilteredSelected"
                      :disabled="!filtered.length"
                      aria-label="Select all visible ingredients"
                      @change="toggleSelectAll"
                    />
                  </th>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Related to</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in filtered" :key="item.id">
                  <td class="ingredient-select-col">
                    <input
                      type="checkbox"
                      class="form-check-input"
                      :checked="isSelected(item.id)"
                      :aria-label="`Select ${item.title}`"
                      @change="toggleSelect(item.id)"
                    />
                  </td>
                  <td class="font-medium">{{ item.title }}</td>
                  <td>{{ item.type?.title || '—' }}</td>
                  <td>{{ parentLabels(item) }}</td>
                  <td>
                    <div class="flex items-center gap-2">
                      <button
                        type="button"
                        class="w-8 h-8 bg-success-100 text-success-600 rounded-full inline-flex items-center justify-center"
                        @click="openEdit(item)"
                      >
                        <iconify-icon icon="lucide:edit"></iconify-icon>
                      </button>
                      <button
                        type="button"
                        class="w-8 h-8 bg-danger-100 text-danger-600 rounded-full inline-flex items-center justify-center"
                        @click="removeIngredient(item.id)"
                      >
                        <iconify-icon icon="mingcute:delete-2-line"></iconify-icon>
                      </button>
                    </div>
                  </td>
                </tr>
                <tr v-if="!filtered.length">
                  <td colspan="5" class="text-neutral-500">No ingredients yet.</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="mobile-only mobile-card-list">
            <label
              v-if="filtered.length"
              class="flex items-center gap-2 mb-1 text-sm font-medium"
            >
              <input
                type="checkbox"
                class="form-check-input"
                :checked="allFilteredSelected"
                :indeterminate="someFilteredSelected && !allFilteredSelected"
                @change="toggleSelectAll"
              />
              Select all
            </label>
            <div v-for="item in filtered" :key="item.id" class="mobile-card-item">
              <div class="flex items-start gap-3">
                <input
                  type="checkbox"
                  class="form-check-input mt-1 shrink-0"
                  :checked="isSelected(item.id)"
                  :aria-label="`Select ${item.title}`"
                  @change="toggleSelect(item.id)"
                />
                <div class="min-w-0 flex-1">
                  <div class="mobile-card-item__title">{{ item.title }}</div>
                  <div class="mobile-card-item__meta">
                    <span>{{ item.type?.title || 'Untyped' }}</span>
                    <span v-if="item.parents?.length">Related: {{ parentLabels(item) }}</span>
                  </div>
                  <div class="mobile-card-item__actions">
                    <button
                      type="button"
                      class="w-8 h-8 bg-success-100 text-success-600 rounded-full inline-flex items-center justify-center"
                      @click="openEdit(item)"
                    >
                      <iconify-icon icon="lucide:edit"></iconify-icon>
                    </button>
                    <button
                      type="button"
                      class="w-8 h-8 bg-danger-100 text-danger-600 rounded-full inline-flex items-center justify-center"
                      @click="removeIngredient(item.id)"
                    >
                      <iconify-icon icon="mingcute:delete-2-line"></iconify-icon>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <p v-if="!filtered.length" class="text-neutral-500 mb-0">No ingredients yet.</p>
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
          class="card border-0 w-full max-w-2xl my-4 sm:my-8 relative shadow-xl recipe-modal-panel"
          style="z-index: 1101"
        >
          <div class="card-header flex items-center justify-between gap-3">
            <h3 class="mb-0 text-base sm:text-lg font-semibold">
              {{ isEditing ? 'Edit Ingredient' : 'Add Ingredient' }}
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
            <div>
              <label class="block text-sm font-medium mb-2">Type</label>
              <div class="ingredient-type-choices" role="radiogroup" aria-label="Ingredient type">
                <button
                  type="button"
                  class="ingredient-type-choice"
                  :class="{ 'is-selected': isTypeSelected('') }"
                  @click="form.ingredient_type_id = ''"
                >
                  None
                </button>
                <button
                  v-for="type in ingredients.types"
                  :key="type.id"
                  type="button"
                  class="ingredient-type-choice"
                  :class="{ 'is-selected': isTypeSelected(type.id) }"
                  @click="form.ingredient_type_id = type.id"
                >
                  {{ type.title }}
                </button>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Related to (more general)</label>
              <p class="text-xs text-neutral-500 mb-2">
                Example: “Roma tomato” can be related to “tomato” so pantry stock of tomato covers it.
              </p>
              <IngredientPicker placeholder="Link a parent ingredient…" @select="onPickParent" />
              <ul class="mt-3 space-y-2">
                <li
                  v-for="parent in form.parents"
                  :key="parent.id"
                  class="flex items-center justify-between gap-2 rounded-lg bg-neutral-50 dark:bg-neutral-700 px-3 py-2"
                >
                  <span class="min-w-0 break-words">{{ parent.title }}</span>
                  <button
                    type="button"
                    class="text-danger-600 shrink-0"
                    @click="removeParent(parent.id)"
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

    <ConfirmModal
      :show="showConfirm"
      :title="confirmTitle"
      :message="confirmMessage"
      :confirm-label="confirmLabel"
      :danger="confirmKind === 'delete'"
      :busy="batchSaving"
      @confirm="onConfirm"
      @cancel="closeConfirm"
    />

    <Teleport to="body">
      <div v-if="selectedCount" class="ingredient-batch-dock">
        <div class="ingredient-batch-dock__head">
          <p class="mb-0 font-medium">{{ selectedCount }} selected</p>
          <div class="flex flex-wrap items-center gap-2">
            <button type="button" class="btn btn-sm bg-neutral-200 dark:bg-neutral-600" @click="clearSelection">
              Clear
            </button>
            <button
              type="button"
              class="btn btn-sm text-white bg-primary-600 hover:bg-primary-700"
              :disabled="batchSaving"
              @click="applyBatchType"
            >
              {{ batchSaving ? 'Updating…' : 'Update type' }}
            </button>
          </div>
        </div>
        <div class="ingredient-type-choices" role="radiogroup" aria-label="Batch ingredient type">
          <button
            type="button"
            class="ingredient-type-choice"
            :class="{ 'is-selected': isBatchTypeSelected('') }"
            @click="batchTypeId = ''"
          >
            None
          </button>
          <button
            v-for="type in ingredients.types"
            :key="type.id"
            type="button"
            class="ingredient-type-choice"
            :class="{ 'is-selected': isBatchTypeSelected(type.id) }"
            @click="batchTypeId = type.id"
          >
            {{ type.title }}
          </button>
        </div>
      </div>
    </Teleport>
  </div>
</template>
