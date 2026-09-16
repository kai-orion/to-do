import { computed, ref, type Ref } from 'vue'
import { useTodoListStore } from '../stores/todo-list'
import { useTodoTabsStore } from '../stores/todo-tabs'

export interface DialogApi {
    showCreateList: () => void
    showCreateTask: () => void
    closeCreateTask: (v?: string) => void
    readField: (n: string) => string
}

export type PendingMove =
    | { kind: 'task', uuid: string }
    | { kind: 'step', parentUuid: string, index: number }

/**
 * Business composable (reads Pinia): create-list / create-task dialogs.
 * Only call from a page / *Layout.vue. The dialog *elements* live in the
 * pure TaskDialogs component — the page owns that template ref and passes it
 * in, together with the view callbacks this logic must not own.
 */
export function useBoardDialogs(opts: {
    dialogs: Ref<DialogApi | null>
    isStarredView: () => boolean
    defaultList: () => string
    ensureVisible: (label: string) => void
}) {
    const todoList = useTodoListStore()
    const todoTabs = useTodoTabsStore()

    const pendingMove = ref<PendingMove | null>(null)
    const createListDoneDisabled = ref(true)

    const ctTitle = ref('')
    const ctDate = ref('')
    const ctTime = ref('')
    const ctAllDay = ref(false)
    const ctRepeat = ref('Does not repeat')
    const ctList = ref('')
    const ctDateLabel = computed(() => {
        if (!ctDate.value) return ''
        const d = new Date(`${ctDate.value}T12:00:00`)
        if (Number.isNaN(d.getTime())) return ctDate.value
        return new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric' }).format(d)
    })

    function applyPendingMove(listName: string) {
        const move = pendingMove.value
        pendingMove.value = null
        if (!move) return
        if (move.kind === 'task') {
            const todo = todoList.findByUuid(move.uuid)
            if (todo) {
                todoList.moveTaskTo(todo, listName)
                opts.ensureVisible(listName)
            }
        } else {
            const parent = todoList.findByUuid(move.parentUuid)
            if (parent) {
                todoList.moveStepToList(parent, move.index, listName)
                opts.ensureVisible(listName)
            }
        }
    }

    // ---- create-new-list dialog (supports move-after-create) ----
    function openCreateList() {
        pendingMove.value = null
        createListDoneDisabled.value = true
        opts.dialogs.value?.showCreateList()
    }

    function newListForMove(move: PendingMove) {
        pendingMove.value = move
        createListDoneDisabled.value = true
        opts.dialogs.value?.showCreateList()
    }

    function handleCreateListClose(returnValue: string, name: string) {
        if (returnValue === 'commit') {
            if (name && !todoTabs.tabs.some(t => t.label === name)) {
                todoTabs.create({ label: name })
                opts.ensureVisible(name)
                applyPendingMove(name)
            } else if (name) {
                applyPendingMove(name)
            } else {
                pendingMove.value = null
            }
        } else {
            pendingMove.value = null
        }
    }

    // ---- create-task dialog ----
    function openCreateDialog() {
        ctTitle.value = ''
        const now = new Date()
        const pad = (n: number) => String(n).padStart(2, '0')
        ctDate.value = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
        ctTime.value = ''
        ctAllDay.value = false
        ctRepeat.value = 'Does not repeat'
        ctList.value = opts.defaultList()
        opts.ensureVisible(ctList.value)
        opts.dialogs.value?.showCreateTask()
    }

    function closeCreateDialog() {
        opts.dialogs.value?.closeCreateTask('cancel')
    }

    function confirmCreateDialog() {
        const title = (opts.dialogs.value?.readField('task-title') ?? ctTitle.value).trim()
        if (!title) return
        const parts: Array<string> = []
        if (ctDateLabel.value) parts.push(ctDateLabel.value)
        if (ctTime.value && !ctAllDay.value) parts.push(ctTime.value)
        if (ctRepeat.value !== 'Does not repeat') parts.push(ctRepeat.value)
        if (ctAllDay.value) parts.push('All day')
        todoList.createTask({
            headline: title,
            description: (opts.dialogs.value?.readField('task-desc') ?? '').trim(),
            collectionName: ctList.value || 'Today',
            dueLabel: parts.join(' · ') || undefined,
            pinned: opts.isStarredView(),
        })
        opts.ensureVisible(ctList.value)
        opts.dialogs.value?.closeCreateTask('save')
    }

    return {
        createListDoneDisabled,
        ctTitle,
        ctDate,
        ctTime,
        ctAllDay,
        ctRepeat,
        ctList,
        ctDateLabel,
        openCreateList,
        newListForMove,
        handleCreateListClose,
        openCreateDialog,
        closeCreateDialog,
        confirmCreateDialog,
    }
}
