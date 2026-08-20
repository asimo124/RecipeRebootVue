<script setup>
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const sidebarEl = ref(null)
const isCollapsed = ref(false)
const isMobileOpen = ref(false)

const navItems = [
  { name: 'recipes', to: '/recipes', label: 'Recipes', icon: 'ph-cooking-pot' },
  { name: 'inventory', to: '/inventory', label: 'Inventory', icon: 'ph-fridge' },
  { name: 'proteins', to: '/proteins', label: 'Proteins', icon: 'ph-fish' },
  { name: 'meal-styles', to: '/meal-styles', label: 'Meal Styles', icon: 'ph-globe-hemisphere-west' },
]

function isActive(name) {
  return route.name === name
}

function toggleCollapse() {
  isCollapsed.value = !isCollapsed.value
  document.body.classList.toggle('twin-collapsed', isCollapsed.value)
  sidebarEl.value?.classList.toggle('is-collapsed', isCollapsed.value)
}

function openMobile() {
  isMobileOpen.value = true
  sidebarEl.value?.classList.add('is-open')
  document.querySelector('.twin-backdrop')?.classList.add('show')
  document.body.classList.add('sidebar-open')
}

function closeMobile() {
  isMobileOpen.value = false
  sidebarEl.value?.classList.remove('is-open')
  document.querySelector('.twin-backdrop')?.classList.remove('show')
  document.body.classList.remove('sidebar-open')
}

function onCollapseClick() {
  toggleCollapse()
}

function onMobileToggle() {
  if (isMobileOpen.value) closeMobile()
  else openMobile()
}

onMounted(() => {
  document.querySelector('.twin-collapse')?.addEventListener('click', onCollapseClick)
  document.querySelector('.twin-mobile-toggle')?.addEventListener('click', onMobileToggle)
  document.querySelector('.twin-backdrop')?.addEventListener('click', closeMobile)
})

onBeforeUnmount(() => {
  document.querySelector('.twin-collapse')?.removeEventListener('click', onCollapseClick)
  document.querySelector('.twin-mobile-toggle')?.removeEventListener('click', onMobileToggle)
  document.querySelector('.twin-backdrop')?.removeEventListener('click', closeMobile)
  document.body.classList.remove('twin-collapsed')
  document.body.classList.remove('sidebar-open')
})

watch(
  () => route.fullPath,
  () => closeMobile(),
)
</script>

<template>
  <button type="button" class="twin-mobile-toggle" aria-label="Open menu">
    <i class="ph ph-list"></i>
  </button>
  <div class="twin-backdrop"></div>

  <aside ref="sidebarEl" class="twin-sidebar" aria-label="Primary navigation">
    <div class="twin-rail">
      <RouterLink to="/recipes" class="twin-rail__brand" aria-label="Home">
        <img src="/assets/images/logo-icon.png" alt="Recipes" />
      </RouterLink>
    </div>

    <div class="twin-panel">
      <div class="twin-panel__head">
        <RouterLink to="/recipes" class="twin-panel__logo" aria-label="Recipes">Recipes</RouterLink>
      </div>

      <div class="twin-panel__body">
        <ul class="twin-menu active" data-menu="apps">
          <li v-for="item in navItems" :key="item.name" :class="{ active: isActive(item.name) }">
            <RouterLink :to="item.to">
              <i class="ph" :class="item.icon"></i>
              <span>{{ item.label }}</span>
            </RouterLink>
          </li>
        </ul>
      </div>

      <div class="twin-panel__foot">
        <span class="twin-version">v1.0</span>
      </div>
    </div>
  </aside>
</template>
