import { computed, reactive, ref } from 'vue'
import type { SortMode } from '../components/board/task-list-card.vue'
import { useTodoListStore, type ITodo } from '../stores/todo-list'
import { useTodoTabsStore } from '../stores/todo-tabs'

export type IPopState =
    | { type: 'list', name: string }
    | { type: 'task', uuid: string }
    | { type: 'step', parentUuid: string, index: number }

/**
 * Business composable (reads Pinia): board view-model for the tasks board.
 * Owns view/filter/sort/menu state plus the derived lists and counts.
 * Only call from a page / *Layout.vue — never from a pure `{name}.vue`.
 */
export function useBoardView() {
    const todoList = useTodoListStore()
    const todoTabs = useTodoTabsStore()

    const tabs = computed(() => todoTabs.tabs)

    const sortOptions: Array<{ value: SortMode, label: string }> = [
        { value: 'my-order', label: 'My order' },
        { value: 'date', label: 'Date' },
        { value: 'deadline', label: 'Deadline' },
        { value: 'starred', label: 'Starred recently' },
        { value: 'title', label: 'Title' },
    ]

    const activeView = ref<'all' | 'starred'>('all')
    const isListsCollapsed = ref(false)
    const visibleLists = reactive<Record<string, boolean>>({})
    const expandedCompleted = reactive<Record<string, boolean>>({})
    const sortMode = reactive<Record<string, SortMode>>({})
    const openPop = ref<IPopState | null>(null)

    function ensureVisible(label: string) {
        if (visibleLists[label] === undefined) visibleLists[label] = true
    }
    for (const t of todoTabs.tabs) {
        if (visibleLists[t.label] === undefined) visibleLists[t.label] = true
    }
    for (const t of tabs.value) ensureVisible(t.label)

    function baseActive(listName: string): Array<ITodo> {
        const out: Array<ITodo> = []
        for (const todo of todoList.todos) {
            if (todo.isCompleted) continue
            if (activeView.value === 'starred' && !todo.isPinned) continue
            if (todo.data.collectionName !== listName) continue
            out.push(todo)
        }
        return out
    }

    function orderedActive(listName: string): Array<ITodo> {
        const arr = baseActive(listName)
        const mode = sortMode[listName] ?? 'my-order'
        if (mode === 'title') {
            arr.sort((a, b) => a.data.headline.localeCompare(b.data.headline))
        } else if (mode === 'starred') {
            arr.sort((a, b) => Number(b.isPinned) - Number(a.isPinned) || a.data.creationTimestamp - b.data.creationTimestamp)
        } else if (mode === 'date' || mode === 'deadline') {
            arr.sort((a, b) => (a.data.dueLabel ? 0 : 1) - (b.data.dueLabel ? 0 : 1) || a.data.creationTimestamp - b.data.creationTimestamp)
        } else {
            arr.sort((a, b) => a.data.creationTimestamp - b.data.creationTimestamp)
        }
        return arr
    }

    const completedByList = computed(() => {
        const map: Record<string, Array<ITodo>> = {}
        for (const t of tabs.value) map[t.label] = []
        for (const todo of todoList.todos) {
            if (!todo.isCompleted) continue
            if (activeView.value === 'starred' && !todo.isPinned) continue
            if (!map[todo.data.collectionName]) map[todo.data.collectionName] = []
            map[todo.data.collectionName].push(todo)
        }
        for (const k of Object.keys(map)) {
            map[k].sort((a, b) => (b.completedAt ?? 0) - (a.completedAt ?? 0))
        }
        return map
    })

    const activeCounts = computed(() => {
        const counts: Record<string, number> = {}
        for (const t of tabs.value) {
            const top = baseActive(t.label)
            let steps = 0
            for (const todo of top) steps += todoList.findManyStepsByParent(todo).filter(s => !s.isCompleted).length
            counts[t.label] = top.length + steps
        }
        return counts
    })

    const completedCounts = computed(() => {
        const counts: Record<string, number> = {}
        for (const t of tabs.value) counts[t.label] = (completedByList.value[t.label] ?? []).length
        return counts
    })

    const visibleBoardLists = computed(() => {
        if (activeView.value === 'starred') return tabs.value.map(t => t.label)
        return tabs.value.map(t => t.label).filter(l => visibleLists[l] !== false)
    })

    function toggleListVisible(label: string) {
        visibleLists[label] = visibleLists[label] === false ? true : false
    }

    function toggleCompleted(label: string) {
        expandedCompleted[label] = !expandedCompleted[label]
    }

    function closePop() {
        openPop.value = null
    }

    function toggleListMenu(label: string) {
        openPop.value = openPop.value?.type === 'list' && openPop.value.name === label
            ? null
            : { type: 'list', name: label }
    }

    function toggleTaskMenu(uuid: string) {
        openPop.value = openPop.value?.type === 'task' && openPop.value.uuid === uuid
            ? null
            : { type: 'task', uuid }
    }

    function toggleStepMenu(parentUuid: string, index: number) {
        openPop.value = openPop.value?.type === 'step' && openPop.value.parentUuid === parentUuid && openPop.value.index === index
            ? null
            : { type: 'step', parentUuid, index }
    }

    function setSort(listName: string, mode: SortMode) {
        sortMode[listName] = mode
        closePop()
    }

    function isDefaultList(listName: string): boolean {
        return todoTabs.tabs.length > 0 && todoTabs.tabs[0].label === listName
    }

    return {
        tabs,
        sortOptions,
        activeView,
        isListsCollapsed,
        visibleLists,
        expandedCompleted,
        sortMode,
        openPop,
        ensureVisible,
        orderedActive,
        completedByList,
        activeCounts,
        completedCounts,
        visibleBoardLists,
        toggleListVisible,
        toggleCompleted,
        closePop,
        toggleListMenu,
        toggleTaskMenu,
        toggleStepMenu,
        setSort,
        isDefaultList,
    }
}
