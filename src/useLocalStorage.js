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
export { loadEntries }

const saveEntries = () => {
    try {
        localStorage.setItem('gridEntries', JSON.stringify(entries.value))
    } catch (err) {
        console.error('Fehler beim Speichern:', err)
    }
}
export { saveEntries }

const updateLastUpdateTime = () => {
    lastUpdateTime.value = new Date().toLocaleString()
}
export { updateLastUpdateTime }

const clearEntries = () => {
    if (entries.value.length > 0 && confirm('Möchten Sie wirklich alle Einträge löschen?')) {
        entries.value = []
        updateLastUpdateTime()
    }
}
export { clearEntries }