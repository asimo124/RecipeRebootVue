<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const router = useRouter()
const displayName = computed(() => auth.user?.name || 'Alex H.')

async function logout() {
  await auth.logout()
  router.push({ name: 'login' })
}

onMounted(() => {
  const root = document.documentElement
  const darkIcon = document.getElementById('theme-toggle-dark-icon')
  const lightIcon = document.getElementById('theme-toggle-light-icon')
  const btn = document.getElementById('theme-toggle')
  if (!btn || !darkIcon || !lightIcon) return

  const isDark = () => root.classList.contains('dark')
  const syncIcons = () => {
    darkIcon.classList.toggle('hidden', isDark())
    lightIcon.classList.toggle('hidden', !isDark())
  }

  syncIcons()
  btn.addEventListener('click', () => {
    root.classList.toggle('dark')
    localStorage.setItem('color-theme', isDark() ? 'dark' : 'light')
    syncIcons()
  })
})
</script>

<template>
  <div class="navbar-header border-b border-neutral-200 dark:border-neutral-600">
    <div class="flex items-center justify-between gap-2 min-w-0">
      <div class="flex items-center gap-2 min-w-0">
        <button
          type="button"
          class="twin-collapse hidden items-center justify-center text-neutral-700 transition-colors hover:text-primary-600 xl:flex dark:text-neutral-300"
          aria-label="Toggle sidebar"
        >
          <iconify-icon icon="ph:arrow-arc-left" class="text-2xl"></iconify-icon>
        </button>
      </div>

      <div class="flex items-center gap-2 sm:gap-3 shrink-0">
        <button
          type="button"
          id="theme-toggle"
          class="flex h-11 w-11 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-600 transition-colors hover:border-primary-600 hover:text-primary-600 dark:border-neutral-600 dark:bg-neutral-700 dark:text-white"
          aria-label="Toggle theme"
        >
          <span id="theme-toggle-dark-icon" class="hidden">
            <i class="ri-moon-line text-xl"></i>
          </span>
          <span id="theme-toggle-light-icon" class="hidden">
            <i class="ri-sun-line text-xl"></i>
          </span>
        </button>

        <button
          data-dropdown-toggle="dropdownProfile"
          class="flex items-center gap-2.5"
          type="button"
        >
          <img
            src="/assets/images/user.png"
            alt="Profile"
            class="h-11 w-11 rounded-full object-cover"
          />
          <span class="hidden text-start leading-tight md:block">
            <span class="block text-sm font-semibold text-neutral-900 dark:text-white">{{
              displayName
            }}</span>
            <span class="block text-xs text-neutral-500 dark:text-neutral-400">Admin</span>
          </span>
          <iconify-icon
            icon="lucide:chevron-down"
            class="hidden text-lg text-neutral-500 dark:text-neutral-400 md:inline-block"
          ></iconify-icon>
        </button>
        <div
          id="dropdownProfile"
          class="dropdown-menu-sm z-10 hidden rounded-lg bg-white p-3 shadow-lg dark:bg-neutral-700"
        >
          <div
            class="mb-4 flex items-center justify-between gap-2 rounded-lg bg-primary-50 px-4 py-3 dark:bg-primary-600/25"
          >
            <div>
              <h2 class="mb-0 text-lg font-semibold text-neutral-900 dark:text-white">
                {{ displayName }}
              </h2>
              <span class="text-neutral-500 dark:text-neutral-400">{{ auth.user?.email }}</span>
            </div>
          </div>
          <ul class="flex flex-col">
            <li>
              <button
                type="button"
                class="flex w-full items-center gap-4 px-0 py-2 text-black hover:text-danger-600 dark:text-white"
                @click="logout"
              >
                <iconify-icon icon="lucide:power" class="icon text-xl"></iconify-icon>
                Log Out
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>
