<template>
  <div class="space-y-4">
  <h2 class="text-2xl font-bold mb-6">{{ editingId ? 'ערוך רשומה' : 'הוסף רשומה חדשה' }}</h2>

    <form @submit.prevent="onSubmit" class="space-y-4">
      <div>
  <label class="block text-sm font-medium mb-2">כמות האכלה (מ״ל)</label>
        <input
          v-model.number="localForm.feedingAmount"
          type="number"
          step="0.1"
          required
          class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          placeholder="הזן כמות"
        />
      </div>

      <div>
        <label class="block text-sm font-medium mb-2">קריאת גלוקומטר (mg/dL)</label>
        <input
          v-model.number="localForm.glucometerReading"
          type="number"
          step="0.1"
          class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          placeholder="אופציונלי"
        />
      </div>

      <div>
        <label class="block text-sm font-medium mb-2">סוג מזון</label>
        <input
          v-model="localForm.nutritionType"
          type="text"
          required
          class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          placeholder="הזן סוג מזון (למשל פורמולה, בננה, חלב אם)"
        />
      </div>

      <div>
        <label class="block text-sm font-medium mb-2">כמות מזון (מ״ל/גרם או טקסט חופשי)</label>
        <input
          v-model="localForm.nutritionAmount"
          type="text"
          required
          class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          placeholder="הזן כמות (למשל 120, ~1/2 כוס, 'לפי הצורך')"
        />
      </div>

      <div>
        <label class="block text-sm font-medium mb-2">זמן</label>
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
          {{ editingId ? 'עדכן רשומה' : 'הוסף רשומה' }}
        </button>
        <button
          v-if="editingId"
          type="button"
          @click="$emit('cancel')"
          class="bg-gray-500 hover:bg-gray-600 text-white font-medium py-3 px-6 rounded-2xl transition-colors"
        >
          ביטול
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
    // keep feedingAmount numeric for calculations
    feedingAmount: Number(localForm.feedingAmount),
    glucometerReading: localForm.glucometerReading !== '' && localForm.glucometerReading !== null
      ? Number(localForm.glucometerReading)
      : null,
    // free text nutrition type
    nutritionType: localForm.nutritionType,
    // keep nutritionAmount as string to allow variable inputs
    nutritionAmount: String(localForm.nutritionAmount),
    time: localForm.time
  }
  emit('save', payload)
}
</script>
