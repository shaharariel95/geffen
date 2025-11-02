<template>
  <div class="min-h-screen">
    <div class="min-h-screen rounded-xl bg-slate-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors pb-20">
      <AppHeader :is-dark="isDarkMode" @toggle-theme="toggleTheme" />

      <main class="max-w-4xl mx-auto px-4 py-6">
        <div v-show="currentPage === 'form'">
          <EntryForm
            :key="formKey"
            :initial="editingId ? getEntryById(editingId) : null"
            :editing-id="editingId"
            @save="handleSave"
            @cancel="cancelEdit"
          />
        </div>

        <div v-show="currentPage === 'history'">
          <HistoryList
            :entries="entries"
            @edit-entry="startEdit"
            @delete-entry="deleteEntry"
          />
        </div>
      </main>

      <BottomNav :current-page="currentPage" @change-page="currentPage = $event" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import AppHeader from './components/AppHeader.vue'
import EntryForm from './components/EntryForm.vue'
import HistoryList from './components/HistoryList.vue'
import BottomNav from './components/BottomNav.vue'

// State
const currentPage = ref('form')
const isDarkMode = ref(false)
const entries = ref([])
const editingId = ref(null)

// A key to force EntryForm remount when resetting form
const formKey = ref(Date.now())

const getEntryById = (id) => {
  return entries.value.find(e => e.id === id) || null
}

const toggleTheme = () => {
  isDarkMode.value = !isDarkMode.value
  // Persist theme and apply `dark` class to the document root so global styles react
  localStorage.setItem('theme', isDarkMode.value ? 'dark' : 'light')
  document.documentElement.classList.toggle('dark', isDarkMode.value)
}

const handleSave = (payload) => {
  if (editingId.value) {
    const index = entries.value.findIndex(e => e.id === editingId.value)
    if (index !== -1) {
      entries.value[index] = { ...payload, id: editingId.value }
    }
    editingId.value = null
  } else {
    entries.value.push({ ...payload, id: Date.now() })
  }

  saveToLocalStorage()
  // Reset the form by changing key so EntryForm remounts
  formKey.value = Date.now()
  currentPage.value = 'history'
}

const startEdit = (entry) => {
  editingId.value = entry.id
  currentPage.value = 'form'
}

const cancelEdit = () => {
  editingId.value = null
  formKey.value = Date.now()
}

const deleteEntry = (id) => {
  if (confirm('Are you sure you want to delete this entry?')) {
    entries.value = entries.value.filter(e => e.id !== id)
    saveToLocalStorage()
  }
}

const saveToLocalStorage = () => {
  localStorage.setItem('feedingEntries', JSON.stringify(entries.value))
}

const loadFromLocalStorage = () => {
  const saved = localStorage.getItem('feedingEntries')
  if (saved) {
    entries.value = JSON.parse(saved)
  }

  const savedTheme = localStorage.getItem('theme')
  isDarkMode.value = savedTheme === 'dark'
}

onMounted(() => {
  loadFromLocalStorage()
  // Ensure the document root has the right class on first load
  document.documentElement.classList.toggle('dark', isDarkMode.value)
})
</script>