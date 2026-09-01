<script setup>
import { onBeforeUnmount, watch } from 'vue'

const props = defineProps({
  show: { type: Boolean, default: false },
  title: { type: String, default: 'Confirm' },
  message: { type: String, required: true },
  confirmLabel: { type: String, default: 'Confirm' },
  cancelLabel: { type: String, default: 'Cancel' },
  danger: { type: Boolean, default: false },
  busy: { type: Boolean, default: false },
})

const emit = defineEmits(['confirm', 'cancel'])

watch(
  () => props.show,
  (open) => {
    document.body.classList.toggle('confirm-modal-open', open)
  },
)

onBeforeUnmount(() => {
  document.body.classList.remove('confirm-modal-open')
})

function onConfirm() {
  if (props.busy) return
  emit('confirm')
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="confirm-modal-overlay"
      @click.self="emit('cancel')"
    >
      <div class="card border-0 shadow-xl confirm-modal-panel" role="dialog" aria-modal="true">
        <div class="card-header flex items-center justify-between gap-3">
          <h3 class="mb-0 text-base font-semibold">{{ title }}</h3>
          <button type="button" class="text-neutral-500 shrink-0" :disabled="busy" @click="emit('cancel')">
            <iconify-icon icon="lucide:x" class="text-xl"></iconify-icon>
          </button>
        </div>
        <div class="card-body">
          <p class="mb-0">{{ message }}</p>
        </div>
        <div class="card-footer flex flex-wrap justify-end gap-2">
          <button
            type="button"
            class="btn btn-sm bg-neutral-200 dark:bg-neutral-600"
            :disabled="busy"
            @click="emit('cancel')"
          >
            {{ cancelLabel }}
          </button>
          <button
            type="button"
            class="btn btn-sm text-white"
            :class="danger ? 'bg-danger-600 hover:bg-danger-700' : 'bg-primary-600 hover:bg-primary-700'"
            :disabled="busy"
            @click="onConfirm"
          >
            {{ busy ? 'Working…' : confirmLabel }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
