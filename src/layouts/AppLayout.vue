<script setup>
import { onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import AppSidebar from '../components/AppSidebar.vue'
import AppNavbar from '../components/AppNavbar.vue'
import AppFooter from '../components/AppFooter.vue'

const route = useRoute()

function initFlowbiteDropdowns() {
  // Flowbite binds once on load; re-init after Vue mounts / navigates
  if (typeof window.initFlowbite === 'function') {
    window.initFlowbite()
  }
}

onMounted(() => {
  initFlowbiteDropdowns()
})

watch(
  () => route.fullPath,
  () => {
    requestAnimationFrame(initFlowbiteDropdowns)
  },
)
</script>

<template>
  <h1 class="sr-only">Recipes Admin</h1>
  <img
    src="/assets/images/body-bg.png"
    alt=""
    class="absolute top-0 left-0 h-full w-full -z-10 dark:hidden"
  />

  <AppSidebar />

  <main class="dashboard-main">
    <AppNavbar />
    <div class="dashboard-main-body">
      <RouterView />
    </div>
    <AppFooter />
  </main>
</template>
