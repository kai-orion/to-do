import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface ITodoTab {
    label: string
}

const STORAGE_KEY = 'Symbol(__todo-tabs)'

function loadFromStorage(): Array<ITodoTab> | undefined {
    try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (!raw) return undefined
        return JSON.parse(raw) as Array<ITodoTab>
    } catch {
        return undefined
    }
}

function saveToStorage(tabs: Array<ITodoTab>) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tabs))
    } catch {
        // ignore quota errors
    }
}

export const useTodoTabsStore = defineStore('todo-tabs', () => {
    const tabs = ref<Array<ITodoTab>>(loadFromStorage() ?? [])

    if (tabs.value.length === 0) {
        tabs.value.push({ label: 'Today' })
        tabs.value.push({ label: 'Blog' })
        tabs.value.push({ label: 'MDC' })
        tabs.value.push({ label: 'Concepts' })
        saveToStorage(tabs.value)
    }

    function insertOneTab(tab: ITodoTab) {
        tabs.value.push(tab)
        saveToStorage(tabs.value)
    }

    function persist() {
        saveToStorage(tabs.value)
    }

    function updateOneTab(oldName: string, next: string): boolean {
        if (tabs.value.some(t => t.label === next)) return false
        const tab = tabs.value.find(t => t.label === oldName)
        if (!tab) return false
        tab.label = next
        saveToStorage(tabs.value)
        return true
    }

    function removeOneTabByLabel(label: string): boolean {
        const idx = tabs.value.findIndex(t => t.label === label)
        if (idx === -1) return false
        tabs.value.splice(idx, 1)
        saveToStorage(tabs.value)
        return true
    }

    function updateOneTabPosition(fromLabel: string, toLabel: string) {
        const from = tabs.value.findIndex(t => t.label === fromLabel)
        const to = tabs.value.findIndex(t => t.label === toLabel)
        if (from === -1 || to === -1) return
        const [moved] = tabs.value.splice(from, 1)
        tabs.value.splice(to, 0, moved)
        saveToStorage(tabs.value)
    }

    return {
        tabs,
        insertOneTab,
        persist,
        updateOneTab,
        removeOneTabByLabel,
        updateOneTabPosition,
    }
})
