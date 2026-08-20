<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const email = ref('alex@recipes.local')
const password = ref('')
const localError = ref('')

async function submit() {
  localError.value = ''
  try {
    await auth.login(email.value.trim(), password.value)
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/recipes'
    router.replace(redirect)
  } catch {
    localError.value = auth.error || 'Login failed'
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center px-4 py-8 relative z-[1]">
    <img
      src="/assets/images/body-bg.png"
      alt=""
      class="absolute top-0 left-0 h-full w-full -z-10 dark:hidden object-cover"
    />
    <div class="card border-0 w-full max-w-md p-0 overflow-hidden">
      <div class="card-body p-6 sm:p-8">
        <div class="text-center mb-8">
          <img src="/assets/images/logo-icon.png" alt="Recipes" class="mx-auto mb-4 h-12 w-12" />
          <h1 class="text-2xl font-semibold mb-1">Recipe Book</h1>
          <p class="text-neutral-500 mb-0">Sign in to continue</p>
        </div>

        <form class="space-y-4" @submit.prevent="submit">
          <div>
            <label class="block text-sm font-medium mb-1" for="email">Email</label>
            <input
              id="email"
              v-model="email"
              type="email"
              required
              autocomplete="username"
              class="bg-white dark:bg-dark-2 border-neutral-200 dark:border-neutral-500 rounded-lg w-full"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1" for="password">Password</label>
            <input
              id="password"
              v-model="password"
              type="password"
              required
              autocomplete="current-password"
              class="bg-white dark:bg-dark-2 border-neutral-200 dark:border-neutral-500 rounded-lg w-full"
            />
          </div>

          <p v-if="localError" class="text-danger-600 text-sm mb-0">{{ localError }}</p>

          <button
            type="submit"
            class="btn w-full text-white bg-primary-600 hover:bg-primary-700 py-3"
            :disabled="auth.loading"
          >
            {{ auth.loading ? 'Signing in…' : 'Sign in' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>
