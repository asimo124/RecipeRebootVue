<script setup>
import { ref, watch } from 'vue'
import { useIngredientsStore } from '../stores/ingredients'

const props = defineProps({
  placeholder: { type: String, default: 'Search ingredients…' },
})

const emit = defineEmits(['select'])

const ingredients = useIngredientsStore()
const query = ref('')
const open = ref(false)
const timer = ref(null)

watch(query, (value) => {
  clearTimeout(timer.value)
  if (!value || value.length < 1) {
    ingredients.results = []
    open.value = false
    return
  }
  timer.value = setTimeout(async () => {
    await ingredients.search(value)
    open.value = true
  }, 200)
})

async function pickExisting(item) {
  emit('select', item)
  query.value = ''
  open.value = false
  ingredients.results = []
}

async function createNew() {
  const title = query.value.trim()
  if (!title) return
  const item = await ingredients.create(title)
  emit('select', item)
  query.value = ''
  open.value = false
  ingredients.results = []
}

function onBlur() {
  setTimeout(() => {
    open.value = false
  }, 150)
}
</script>

<template>
  <div class="relative w-full max-w-md ingredient-picker">
    <div class="icon-field relative">
      <input
        v-model="query"
        type="text"
        class="bg-white dark:bg-dark-2 ps-10 border-neutral-200 dark:border-neutral-500 rounded-lg w-full"
        :placeholder="placeholder"
        autocomplete="off"
        @focus="open = ingredients.results.length > 0"
        @blur="onBlur"
        @keydown.enter.prevent="createNew"
      />
      <span class="icon absolute top-1/2 left-0 text-lg flex -translate-y-1/2 ps-3">
        <iconify-icon icon="ion:search-outline"></iconify-icon>
      </span>
    </div>

    <div
      v-if="open"
      class="absolute z-20 mt-1 w-full rounded-lg border border-neutral-200 bg-white shadow-lg dark:border-neutral-600 dark:bg-neutral-700"
    >
      <ul class="max-h-60 overflow-y-auto py-1 text-sm">
        <li
          v-for="item in ingredients.results"
          :key="item.id"
          class="cursor-pointer px-3 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-600"
          @mousedown.prevent="pickExisting(item)"
        >
          {{ item.title }}
          <span v-if="item.type" class="text-neutral-400 ms-2">{{ item.type.title }}</span>
        </li>
        <li
          v-if="query.trim()"
          class="cursor-pointer border-t border-neutral-200 px-3 py-2 text-primary-600 dark:border-neutral-600 dark:text-primary-400"
          @mousedown.prevent="createNew"
        >
          Create “{{ query.trim() }}”
        </li>
        <li
          v-if="!ingredients.results.length && !query.trim()"
          class="px-3 py-2 text-neutral-400"
        >
          Type to search
        </li>
      </ul>
    </div>
  </div>
</template>
