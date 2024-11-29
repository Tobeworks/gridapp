<template>
  <div class="card">
    <DataTable :value="entries" :paginator="true" :rows="10" v-model:filters="filters" filterDisplay="menu" :globalFilterFields="['text', 'timestamp', 'attributes']" dataKey="id" :loading="loading" responsiveLayout="scroll" stripedRows :scrollable="true" scrollHeight="400px" v-if="entries.length > 0">
      <!-- Header mit Suche -->
      <template #header>
        <div class="flex justify-between items-center">
          <div class="flex items-center gap-8">
            <h2 class="text-xl">Einträge ({{ entries.length }})</h2>
            <!-- Neuer Clear-Button -->
            <Button v-if="entries.length > 0" icon="pi pi-trash" label="Alle löschen" severity="danger" @click="clearEntries" style="margin-bottom: 10px;"  />
          </div>
          <div class="flex gap-2">
            <span class="p-input-icon-left">
              <i class="pi pi-search" />
              <InputText v-model="filters['global'].value" placeholder="Suchen..." class="p-inputtext-sm" />
            </span>
          </div>
        </div>
      </template>

      <!-- Text Spalte mit Inline-Editing -->
      <Column field="text" header="Text" sortable style="min-width: 200px">
        <template #body="{ data, field }">
          <div v-if="editingId === data.id">
            <InputText v-model="editingText" @keyup.enter="saveEdit(data)" @keyup.esc="cancelEdit" autofocus class="w-full" />
          </div>
          <div v-else @dblclick="startEdit(data)" class="cursor-pointer">
            {{ data[field] }}
          </div>
        </template>
      </Column>

      <!-- Zeitstempel Spalte -->
      <Column field="timestamp" header="Erstellt am" sortable style="min-width: 150px"></Column>

      <!-- Attribute Spalte -->
      <Column field="attributes" header="Attribute" style="min-width: 200px">
        <template #body="{ data }">
          <div class="flex gap-1 flex-wrap">
            <span v-for="attr in data.attributes" :key="attr" class="px-2 py-1 text-xs rounded-full" :class="getAttributeClass(attr)">
              {{ getAttributeLabel(attr) }}
            </span>
          </div>
        </template>
      </Column>

      <!-- Aktionen Spalte -->
      <Column header="Aktionen" :exportable="false" style="min-width: 150px">
        <template #body="{ data }">
          <div class="flex gap-2 justify-center">
            <Button icon="pi pi-pencil" class="p-button-rounded" severity="primary" @click="startEdit(data)" />

            <Menu ref="menu" :model="attributeOptions" :popup="true" />
            <Button icon="pi pi-tags" class="p-button-rounded" severity="primary" @click="toggleAttributeMenu($event, data)" />

            <Button icon="pi pi-trash" class="p-button-rounded" severity="danger" @click="deleteEntry(data.id)" />
          </div>
        </template>
      </Column>

      <!-- Footer -->
      <template #footer>
        <div class="text-right text-sm text-gray-500">
          Letztes Update: {{ lastUpdateTime }}
        </div>
      </template>
    </DataTable>

    <!-- Neuer Eintrag -->
    <div class="card mt-4">
      <div class="p-inputgroup">
        <InputText v-model="newText" placeholder="Neuen Text eingeben..." @keyup.enter="addEntry" :disabled="loading" class="flex-1" />
        <Button label="Hinzufügen" icon="pi pi-plus" severity="primary" @click="addEntry" :loading="loading" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import Menu from 'primevue/menu'
import 'primeicons/primeicons.css'
// State Management
const entries = ref([])
const loading = ref(false)
const newText = ref('')
const editingId = ref(null)
const editingText = ref('')
const menu = ref()
const lastUpdateTime = ref(new Date().toLocaleString())

// Filter Setup
const filters = ref({
  'global': { value: null }
})

// Attribute Definitionen
const availableAttributes = [
  { label: 'Wichtig', value: 'important', class: 'bg-red-100 text-red-800' },
  { label: 'In Bearbeitung', value: 'in-progress', class: 'bg-yellow-100 text-yellow-800' },
  { label: 'Erledigt', value: 'done', class: 'bg-green-100 text-green-800' },
  { label: 'Niedrige Priorität', value: 'low-priority', class: 'bg-gray-100 text-gray-800' }
]

const attributeOptions = availableAttributes.map(attr => ({
  label: attr.label,
  icon: 'pi pi-tag',
  value: attr.value,
  command: (event) => toggleAttribute(event.item.value)
}))

const activeEntry = ref(null)

// Hilfsfunktionen für Attribute
const getAttributeLabel = (value) => {
  const attr = availableAttributes.find(a => a.value === value)
  return attr ? attr.label : value
}

const getAttributeClass = (attr) => {
  const attribute = availableAttributes.find(a => a.value === attr)
  return attribute ? attribute.class : 'bg-gray-100 text-gray-800'
}

// Attribute Menu Funktionen
const toggleAttributeMenu = (event, entry) => {
  activeEntry.value = entry
  menu.value.toggle(event)
}

const toggleAttribute = (attributeValue) => {
  if (!activeEntry.value) return

  const entry = entries.value.find(e => e.id === activeEntry.value.id)
  if (!entry) return

  if (!entry.attributes) {
    entry.attributes = []
  }

  const index = entry.attributes.indexOf(attributeValue)
  if (index > -1) {
    entry.attributes.splice(index, 1)
  } else {
    entry.attributes.push(attributeValue)
  }
  updateLastUpdateTime()
}

// CRUD Operationen
const addEntry = async () => {
  if (newText.value.trim()) {
    loading.value = true
    try {
      entries.value.unshift({
        id: Date.now(),
        text: newText.value,
        timestamp: new Date().toLocaleString(),
        attributes: []
      })
      newText.value = ''
      updateLastUpdateTime()
    } finally {
      loading.value = false
    }
  }
}

const startEdit = (entry) => {
  editingId.value = entry.id
  editingText.value = entry.text
}

const saveEdit = (entry) => {
  if (editingText.value.trim()) {
    const index = entries.value.findIndex(e => e.id === entry.id)
    if (index > -1) {
      entries.value[index] = {
        ...entry,
        text: editingText.value
      }
      updateLastUpdateTime()
    }
  }
  cancelEdit()
}

const cancelEdit = () => {
  editingId.value = null
  editingText.value = ''
}

const deleteEntry = (id) => {
  const index = entries.value.findIndex(entry => entry.id === id)
  if (index > -1 && confirm('Möchten Sie diesen Eintrag wirklich löschen?')) {
    entries.value.splice(index, 1)
    updateLastUpdateTime()
  }
}

// LocalStorage Funktionen
const loadEntries = () => {
  try {
    const saved = localStorage.getItem('gridEntries')
    if (saved) {
      entries.value = JSON.parse(saved)
      entries.value.forEach(entry => {
        if (!entry.attributes) entry.attributes = []
      })
    }
  } catch (err) {
    console.error('Fehler beim Laden:', err)
    entries.value = []
  }
}

const saveEntries = () => {
  try {
    localStorage.setItem('gridEntries', JSON.stringify(entries.value))
  } catch (err) {
    console.error('Fehler beim Speichern:', err)
  }
}

const updateLastUpdateTime = () => {
  lastUpdateTime.value = new Date().toLocaleString()
}

const clearEntries = () => {
  if (entries.value.length > 0 && confirm('Möchten Sie wirklich alle Einträge löschen?')) {
    entries.value = []
    updateLastUpdateTime()
  }
}

// Watchers und Lifecycle
watch(entries, saveEntries, { deep: true })
onMounted(loadEntries)
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

:root {
  --font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

body {
  font-family: var(--font-family);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #1a1a1a;
}

.p-datatable {
  font-family: var(--font-family) !important;
}

.p-datatable .p-datatable-header {
  font-weight: 600;
}

.p-datatable .p-datatable-thead>tr>th {
  font-weight: 500;
  letter-spacing: -0.01em;
}

.p-button {
  font-family: var(--font-family) !important;
  font-weight: 500;
}

.p-inputtext {
  font-family: var(--font-family) !important;
}

.card {
  padding: 1rem;
  margin-bottom: 1rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

h2 {
  font-weight: 600;
  letter-spacing: -0.02em;
}
</style>