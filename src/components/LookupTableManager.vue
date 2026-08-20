<script setup>
import { ref } from 'vue'

defineProps({
  title: { type: String, required: true },
  items: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
})

const emit = defineEmits(['create', 'update', 'remove'])

const newTitle = ref('')
const editingId = ref(null)
const editingTitle = ref('')

function startEdit(item) {
  editingId.value = item.id
  editingTitle.value = item.title
}

function cancelEdit() {
  editingId.value = null
  editingTitle.value = ''
}

async function saveEdit() {
  if (!editingTitle.value.trim()) return
  emit('update', { id: editingId.value, title: editingTitle.value.trim() })
  cancelEdit()
}

function submitCreate() {
  const title = newTitle.value.trim()
  if (!title) return
  emit('create', title)
  newTitle.value = ''
}
</script>

<template>
  <div class="card border-0">
    <div class="card-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <h3 class="text-lg font-semibold mb-0">{{ title }}</h3>
      <form class="lookup-add-form flex items-center gap-2 w-full sm:w-auto" @submit.prevent="submitCreate">
        <input
          v-model="newTitle"
          type="text"
          class="bg-white dark:bg-dark-2 border-neutral-200 dark:border-neutral-500 rounded-lg flex-1 min-w-0"
          :placeholder="`Add ${title.toLowerCase()}…`"
        />
        <button
          type="submit"
          class="btn btn-sm text-white bg-primary-600 hover:bg-primary-700 shrink-0"
        >
          Add
        </button>
      </form>
    </div>
    <div class="card-body">
      <p v-if="loading" class="text-neutral-500 mb-0">Loading…</p>
      <template v-else>
        <div class="table-responsive scroll-sm desktop-only">
          <table class="table bordered-table mb-0">
            <thead>
              <tr>
                <th scope="col">ID</th>
                <th scope="col">Title</th>
                <th scope="col">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in items" :key="item.id">
                <td>{{ item.id }}</td>
                <td>
                  <template v-if="editingId === item.id">
                    <input
                      v-model="editingTitle"
                      type="text"
                      class="bg-white dark:bg-dark-2 border-neutral-200 dark:border-neutral-500 rounded-lg w-full"
                      @keydown.enter.prevent="saveEdit"
                      @keydown.esc.prevent="cancelEdit"
                    />
                  </template>
                  <template v-else>
                    {{ item.title }}
                  </template>
                </td>
                <td>
                  <div class="flex items-center gap-2">
                    <template v-if="editingId === item.id">
                      <button
                        type="button"
                        class="w-8 h-8 bg-success-100 text-success-600 rounded-full inline-flex items-center justify-center"
                        @click="saveEdit"
                      >
                        <iconify-icon icon="lucide:check"></iconify-icon>
                      </button>
                      <button
                        type="button"
                        class="w-8 h-8 bg-neutral-100 text-neutral-600 rounded-full inline-flex items-center justify-center"
                        @click="cancelEdit"
                      >
                        <iconify-icon icon="lucide:x"></iconify-icon>
                      </button>
                    </template>
                    <template v-else>
                      <button
                        type="button"
                        class="w-8 h-8 bg-success-100 dark:bg-success-600/25 text-success-600 dark:text-success-400 rounded-full inline-flex items-center justify-center"
                        @click="startEdit(item)"
                      >
                        <iconify-icon icon="lucide:edit"></iconify-icon>
                      </button>
                      <button
                        type="button"
                        class="w-8 h-8 bg-danger-100 dark:bg-danger-600/25 text-danger-600 dark:text-danger-400 rounded-full inline-flex items-center justify-center"
                        @click="emit('remove', item.id)"
                      >
                        <iconify-icon icon="mingcute:delete-2-line"></iconify-icon>
                      </button>
                    </template>
                  </div>
                </td>
              </tr>
              <tr v-if="!items.length">
                <td colspan="3" class="text-neutral-500">No items yet.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="mobile-only mobile-card-list">
          <div v-for="item in items" :key="item.id" class="mobile-card-item">
            <template v-if="editingId === item.id">
              <input
                v-model="editingTitle"
                type="text"
                class="bg-white dark:bg-dark-2 border-neutral-200 dark:border-neutral-500 rounded-lg w-full mb-3"
                @keydown.enter.prevent="saveEdit"
                @keydown.esc.prevent="cancelEdit"
              />
              <div class="mobile-card-item__actions">
                <button
                  type="button"
                  class="w-8 h-8 bg-success-100 text-success-600 rounded-full inline-flex items-center justify-center"
                  @click="saveEdit"
                >
                  <iconify-icon icon="lucide:check"></iconify-icon>
                </button>
                <button
                  type="button"
                  class="w-8 h-8 bg-neutral-100 text-neutral-600 rounded-full inline-flex items-center justify-center"
                  @click="cancelEdit"
                >
                  <iconify-icon icon="lucide:x"></iconify-icon>
                </button>
              </div>
            </template>
            <template v-else>
              <div class="mobile-card-item__title">{{ item.title }}</div>
              <div class="mobile-card-item__meta">
                <span>ID {{ item.id }}</span>
              </div>
              <div class="mobile-card-item__actions">
                <button
                  type="button"
                  class="w-8 h-8 bg-success-100 text-success-600 rounded-full inline-flex items-center justify-center"
                  @click="startEdit(item)"
                >
                  <iconify-icon icon="lucide:edit"></iconify-icon>
                </button>
                <button
                  type="button"
                  class="w-8 h-8 bg-danger-100 text-danger-600 rounded-full inline-flex items-center justify-center"
                  @click="emit('remove', item.id)"
                >
                  <iconify-icon icon="mingcute:delete-2-line"></iconify-icon>
                </button>
              </div>
            </template>
          </div>
          <p v-if="!items.length" class="text-neutral-500 mb-0">No items yet.</p>
        </div>
      </template>
    </div>
  </div>
</template>
