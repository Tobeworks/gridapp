// useLocalStorage.js
import { ref, watch } from 'vue'

export function useLocalStorage(key, defaultValue = []) {
    const data = ref(defaultValue)

    // Lade initial gespeicherte Daten
    const loadData = () => {
        try {
            const saved = localStorage.getItem(key)
            if (saved) {
                data.value = JSON.parse(saved)
            }
        } catch (err) {
            console.error('Fehler beim Laden der Daten:', err)
            data.value = defaultValue
        }
    }

    // Speichere Daten bei Änderungen
    const saveData = () => {
        try {
            localStorage.setItem(key, JSON.stringify(data.value))
        } catch (err) {
            console.error('Fehler beim Speichern der Daten:', err)
        }
    }

    // Automatisches Speichern bei Änderungen
    watch(data, saveData, { deep: true })

    // Initial laden
    loadData()

    return {
        data,
        saveData,
        loadData
    }
}