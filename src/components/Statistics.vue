<template>
  <div class="space-y-6">
  <h2 class="text-2xl font-bold">סטטיסטיקה</h2>

    <!-- Global Glucose Chart -->
    <section class="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
  <h3 class="font-medium mb-2">גלוקוז לאורך זמן</h3>
      <div class="chart-container">
        <canvas ref="globalChart" class="chart-canvas"></canvas>
      </div>
    </section>

    <!-- Per-Food Glucose Chart -->
    <section class="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
      <div class="flex items-center justify-between mb-2">
        <h3 class="font-medium">גלוקוז לפי מזון לאורך זמן</h3>
        <div class="text-sm text-gray-500">בחר אילו מזונות להציג</div>
      </div>

      <div class="mb-3 flex flex-wrap gap-2">
        <button class="px-3 py-1 rounded-full bg-slate-100 dark:bg-gray-700 text-sm" @click.prevent="selectAllFoods">
          בחר הכל
        </button>
        <button class="px-3 py-1 rounded-full bg-slate-100 dark:bg-gray-700 text-sm" @click.prevent="clearSelection">
          נקה
        </button>
      </div>

      <div class="mb-4 flex flex-wrap gap-2">
        <label v-for="food in foodOptions" :key="food" class="inline-flex items-center gap-2 text-sm">
          <input type="checkbox" :value="food" v-model="selectedFoods" class="form-checkbox" />
          <span class="px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-xs">{{ food }}</span>
        </label>
      </div>

      <div v-if="selectedFoods.length === 0" class="text-sm text-gray-500 mb-2">
        לא נבחרו מזונות — בחר/י כדי לראות נתונים.
      </div>

      <div class="chart-container">
        <canvas ref="perFoodChart" class="chart-canvas"></canvas>
      </div>
    </section>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref, watch, nextTick, computed } from 'vue'
import Chart from 'chart.js/auto'

const props = defineProps({
  entries: { type: Array, default: () => [] }
})

const globalChart = ref(null)
const perFoodChart = ref(null)
let globalInstance = null
let perFoodInstance = null
const isMounted = ref(false)
let rebuildQueued = false

const colorPalette = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'
]

const foodOptions = computed(() => {
  const set = new Set()
  props.entries.forEach(e => set.add(e.nutritionType || 'Unknown'))
  return Array.from(set)
})

const selectedFoods = ref([])

const selectAllFoods = () => { selectedFoods.value = [...foodOptions.value] }
const clearSelection = () => { selectedFoods.value = [] }

watch(foodOptions, (opts) => {
  if (selectedFoods.value.length === 0) {
    selectedFoods.value = [...opts]
  } else {
    selectedFoods.value = selectedFoods.value.filter(f => opts.includes(f))
  }
}, { immediate: true })

function scheduleBuild() {
  if (rebuildQueued) return
  rebuildQueued = true
  requestAnimationFrame(async () => {
    rebuildQueued = false
    await nextTick()
    if (!isMounted.value) return
    buildCharts()
  })
}

watch(() => props.entries, scheduleBuild, { deep: true })
watch(selectedFoods, scheduleBuild, { deep: true })

function buildCharts() {
  if (!isMounted.value) return

  const entries = props.entries
    .filter(e => e.glucometerReading != null)
    .sort((a, b) => new Date(a.time) - new Date(b.time))

  const labels = entries.map(e => new Date(e.time).toISOString())
  const glucoseData = entries.map(e => e.glucometerReading)

  // ----- Global Chart -----
  if (globalChart.value) {
    const ctx = globalChart.value.getContext('2d')
    if (!ctx) return
    if (!globalInstance) {
      globalInstance = new Chart(ctx, {
        type: 'line',
        data: {
          labels,
          datasets: [{
            label: 'גלוקוז (mg/dL)',
            data: glucoseData,
            borderColor: colorPalette[0],
            backgroundColor: colorPalette[0] + '33',
            fill: true,
            tension: 0.2,
            pointRadius: 3,
            pointHoverRadius: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: { mode: 'nearest', intersect: false },
          plugins: {
            tooltip: { enabled: true },
            legend: { display: true, position: 'top' }
          },
          scales: { x: { display: true }, y: { display: true } }
        }
      })
    } else {
      globalInstance.data.labels = labels
      globalInstance.data.datasets[0].data = glucoseData
      globalInstance.update('none')
    }
  }

  // ----- Per-Food Chart -----
  if (!perFoodChart.value) return
  const ctx2 = perFoodChart.value.getContext('2d')
  if (!ctx2) return

  const byFood = {}
  entries.forEach(e => {
    const key = e.nutritionType || 'Unknown'
    if (!byFood[key]) byFood[key] = []
    byFood[key].push({ time: new Date(e.time).toISOString(), value: e.glucometerReading })
  })

  const datasets = Object.keys(byFood)
    .filter(food => selectedFoods.value.includes(food))
    .map((food, i) => {
      const map = new Map(byFood[food].map(item => [item.time, item.value]))
      const data = labels.map(l => map.get(l) ?? null)
      return {
        label: food,
        data,
        borderColor: colorPalette[(i + 1) % colorPalette.length],
        backgroundColor: colorPalette[(i + 1) % colorPalette.length] + '33',
        tension: 0.2,
        spanGaps: true
      }
    })

  if (datasets.length === 0) {
    if (perFoodInstance) {
      perFoodInstance.destroy()
      perFoodInstance = null
    }
    return
  }

  if (!perFoodInstance) {
    perFoodInstance = new Chart(ctx2, {
      type: 'line',
      data: { labels, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'nearest', intersect: false },
        plugins: {
          tooltip: { enabled: true },
          legend: { display: true, position: 'top', labels: { usePointStyle: true } }
        },
        scales: { x: { display: true }, y: { display: true } }
      }
    })
  } else {
    perFoodInstance.data.labels = labels
    perFoodInstance.data.datasets = datasets
    perFoodInstance.update('none')
  }
}

onMounted(async () => {
  isMounted.value = true
  await nextTick()
  buildCharts()
})

onBeforeUnmount(() => {
  isMounted.value = false
  if (globalInstance) {
    globalInstance.destroy()
    globalInstance = null
  }
  if (perFoodInstance) {
    perFoodInstance.destroy()
    perFoodInstance = null
  }
})
</script>

<style scoped>
.chart-container {
  height: 180px;
  position: relative;
}
.chart-canvas {
  width: 100% !important;
  height: 100% !important;
}
</style>
