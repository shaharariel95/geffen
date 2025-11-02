<template>
  <header class="bg-slate-200 rounded-xl dark:bg-gray-800 shadow-sm sticky top-0 z-10 transition-colors">
    <div class="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
      <h1 class="text-xl font-bold">🍼 Baby Feeding Tracker</h1>
      <button
        @click="$emit('toggle-theme')"
        class="p-2 rounded-lg bg-slate-300 hover:bg-blue-600 text-white transition-colors"
        aria-label="Toggle theme"
      >
        <Sun v-if="isDark" :size="20" />
        <Moon v-else :size="20" color="black" />
      </button>
    </div>
  </header>
</template>

<script setup>
import { toRef } from 'vue'
import { Sun, Moon } from 'lucide-vue-next'

const props = defineProps({
  isDark: { type: Boolean, default: false }
})
</script>
