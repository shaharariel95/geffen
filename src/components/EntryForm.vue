<template>
  <div class="space-y-4">
    <h2 class="text-2xl font-bold mb-6">{{ editingId ? 'Edit Entry' : 'Add New Entry' }}</h2>

    <form @submit.prevent="onSubmit" class="space-y-4">
      <div>
        <label class="block text-sm font-medium mb-2">Feeding Amount (ml)</label>
        <input
          v-model.number="localForm.feedingAmount"
          type="number"
          step="0.1"
          required
          class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          placeholder="Enter amount"
        />
      </div>

      <div>
        <label class="block text-sm font-medium mb-2">Glucometer Reading (mg/dL)</label>
        <input
          v-model.number="localForm.glucometerReading"
          type="number"
          step="0.1"
          class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          placeholder="Optional"
        />
      </div>

      <div>
        <label class="block text-sm font-medium mb-2">Nutrition Type</label>
        <select
          v-model="localForm.nutritionType"
          required
          class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
        >
          <option value="">Select type</option>
          <option value="Breast Milk">Breast Milk</option>
          <option value="Formula">Formula</option>
          <option value="Mixed">Mixed</option>
          <option value="Solid Food">Solid Food</option>
        </select>
      </div>

      <div>
        <label class="block text-sm font-medium mb-2">Nutrition Amount (ml/g)</label>
        <input
          v-model.number="localForm.nutritionAmount"
          type="number"
          step="0.1"
          required
          class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          placeholder="Enter amount"
        />
      </div>

      <div>
        <label class="block text-sm font-medium mb-2">Time</label>
        <input
          v-model="localForm.time"
          type="datetime-local"
          required
          class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
        />
      </div>

      <div class="flex gap-3 pt-2">
        <button
          type="submit"
          class="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-medium py-3 px-6 rounded-2xl transition-colors"
        >
          {{ editingId ? 'Update Entry' : 'Add Entry' }}
        </button>
        <button
          v-if="editingId"
          type="button"
          @click="$emit('cancel')"
          class="bg-gray-500 hover:bg-gray-600 text-white font-medium py-3 px-6 rounded-2xl transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { reactive, watch } from 'vue'

const props = defineProps({
  initial: { type: Object, default: null },
  editingId: { type: [Number, String, null], default: null }
})

const emit = defineEmits(['save', 'cancel'])

const makeDefault = () => {
  const now = new Date()
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
  return {
    feedingAmount: '',
    glucometerReading: '',
    nutritionType: '',
    nutritionAmount: '',
    time: now.toISOString().slice(0, 16)
  }
}

const localForm = reactive(props.initial ? { ...props.initial } : makeDefault())

watch(() => props.initial, (nv) => {
  if (nv) {
    Object.assign(localForm, nv)
  } else {
    Object.assign(localForm, makeDefault())
  }
}, { immediate: true })

const onSubmit = () => {
  // ensure numbers are numbers
  const payload = {
    feedingAmount: Number(localForm.feedingAmount),
    glucometerReading: localForm.glucometerReading !== '' && localForm.glucometerReading !== null
      ? Number(localForm.glucometerReading)
      : null,
    nutritionType: localForm.nutritionType,
    nutritionAmount: Number(localForm.nutritionAmount),
    time: localForm.time
  }
  emit('save', payload)
}
</script>
