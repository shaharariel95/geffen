<template>
  <div class="space-y-4">
    <h2 class="text-2xl font-bold mb-6">Feeding History</h2>

    <div v-if="entries.length === 0" class="text-center py-12 text-gray-500 dark:text-gray-400">
      <Baby :size="48" class="mx-auto mb-4 opacity-50" />
      <p>No feeding entries yet. Add your first entry!</p>
    </div>

    <div v-else class="space-y-3">
      <div
        v-for="entry in sortedEntries"
        :key="entry.id"
        class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700 transition-colors"
      >
        <div class="flex items-start justify-between mb-3">
          <div class="flex items-center gap-2">
            <Clock :size="18" class="text-blue-500" />
            <span class="font-semibold">{{ formatDateTime(entry.time) }}</span>
          </div>
          <div class="flex gap-2">
            <button
              @click="$emit('edit-entry', entry)"
              class="p-2 bg-slate-300 hover:bg-slate-600 text-white rounded-2xl transition-colors"
              aria-label="Edit entry"
            >
              <Edit2 :size="16" />
            </button>
            <button
              @click="$emit('delete-entry', entry.id)"
              class="p-2 bg-slate-300 hover:bg-slate-600 text-white rounded-2xl transition-colors"
              aria-label="Delete entry"
            >
              <Trash2 :size="16" />
            </button>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3 text-sm">
          <div class="flex items-center gap-2">
            <Milk :size="16" class="text-blue-500" />
            <div>
              <div class="text-gray-500 dark:text-gray-400 text-xs">Feeding</div>
              <div class="font-medium">{{ entry.feedingAmount }} ml</div>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <Activity :size="16" class="text-blue-500" />
            <div>
              <div class="text-gray-500 dark:text-gray-400 text-xs">Glucose</div>
              <div class="font-medium">{{ entry.glucometerReading ?? 'N/A' }}</div>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <Utensils :size="16" class="text-blue-500" />
            <div>
              <div class="text-gray-500 dark:text-gray-400 text-xs">Type</div>
              <div class="font-medium">{{ entry.nutritionType }}</div>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <Scale :size="16" class="text-blue-500" />
            <div>
              <div class="text-gray-500 dark:text-gray-400 text-xs">Nutrition</div>
              <div class="font-medium">{{ entry.nutritionAmount }} ml/g</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Clock, Milk, Activity, Utensils, Scale, Edit2, Trash2, Baby } from 'lucide-vue-next'

const props = defineProps({
  entries: { type: Array, default: () => [] }
})

const emit = defineEmits(['edit-entry', 'delete-entry'])

const sortedEntries = computed(() => {
  return [...props.entries].sort((a, b) => new Date(b.time) - new Date(a.time))
})

const formatDateTime = (dateTime) => {
  const date = new Date(dateTime)
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}
</script>
