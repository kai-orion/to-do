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
        tabs.value.push({ label: 'All' })
        tabs.value.push({ label: 'Pinned' })
        saveToStorage(tabs.value)
    }

    function create(tab: ITodoTab) {
        tabs.value.push(tab)
        saveToStorage(tabs.value)
    }

    function remove(tab: ITodoTab) {
        tabs.value.splice(tabs.value.findIndex(e => e.label === tab.label), 1)
        saveToStorage(tabs.value)
    }

    return {
        tabs,
        create,
        remove,
    }
})
