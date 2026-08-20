<script setup>
defineProps({
  pageTitle: { type: String, required: true },
  activePage: { type: String, required: true },
})
</script>

<template>
  <div class="flex flex-wrap items-center justify-between gap-2 mb-4 md:mb-6">
    <h2 class="h6 font-semibold mb-0 dark:text-white">{{ pageTitle }}</h2>
    <ul class="page-crumb-trail flex items-center gap-[6px]">
      <li class="font-medium">
        <RouterLink
          to="/recipes"
          class="flex items-center gap-2 text-neutral-600 hover:text-primary-600 dark:text-white dark:hover:text-primary-600"
        >
          <iconify-icon icon="solar:home-smile-angle-outline" class="icon text-lg"></iconify-icon>
          Dashboard
        </RouterLink>
      </li>
      <li class="text-neutral-600 dark:text-white">-</li>
      <li class="text-neutral-600 font-medium dark:text-white">{{ activePage }}</li>
    </ul>
  </div>
</template>
