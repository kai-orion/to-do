import { computed, ref, type Ref } from 'vue'
import { useTodoListStore } from '@stores/todo-list'
import { useTodoTabsStore } from '@stores/todo-tabs'

export interface IDialogApi {
    showCreateList: () => void
    showCreateTask: () => void
    closeCreateTask: (v?: string) => void
    findOneFieldValueByName: (n: string) => string
}

export type IPendingMove =
    | { kind: 'task', uuid: string }
    | { kind: 'step', parentUuid: string, index: number }

export interface IUseBoardDialogsArgs {
    dialogs: Ref<IDialogApi | null>
    isStarredView: () => boolean
    defaultList: () => string
    ensureVisible: (label: string) => void
}

/**
 * Business composable (reads Pinia): create-list / create-task dialogs.
 * Only call from a page / *Layout.vue. The dialog *elements* live in the
 * pure TaskDialogs component — the page owns that template ref and passes it
 * in, together with the view callbacks this logic must not own.
 */
export function useBoardDialogs(args: IUseBoardDialogsArgs) {
    const todoList = useTodoListStore()
    const todoTabs = useTodoTabsStore()

    const pendingMove = ref<IPendingMove | null>(null)
    const isCreateListDoneDisabled = ref(true)

    const ctTitle = ref('')
    const ctDate = ref('')
    const ctTime = ref('')
    const isAllDay = ref(false)
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
            const todo = todoList.findOneTodoByUuid(move.uuid)
            if (todo) {
                todoList.updateOneTodoCollection(todo, listName)
                args.ensureVisible(listName)
            }
        } else {
            const parent = todoList.findOneTodoByUuid(move.parentUuid)
            if (parent) {
                todoList.insertOneTodoFromStep(parent, move.index, listName)
                args.ensureVisible(listName)
            }
        }
    }

    // ---- create-new-list dialog (supports move-after-create) ----
    function openCreateList() {
        pendingMove.value = null
        isCreateListDoneDisabled.value = true
        args.dialogs.value?.showCreateList()
    }

    function newListForMove(move: IPendingMove) {
        pendingMove.value = move
        isCreateListDoneDisabled.value = true
        args.dialogs.value?.showCreateList()
    }

    function handleCreateListClose(returnValue: string, name: string) {
        if (returnValue === 'commit') {
            if (name && !todoTabs.tabs.some(t => t.label === name)) {
                todoTabs.insertOneTab({ label: name })
                args.ensureVisible(name)
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
        isAllDay.value = false
        ctRepeat.value = 'Does not repeat'
        ctList.value = args.defaultList()
        args.ensureVisible(ctList.value)
        args.dialogs.value?.showCreateTask()
    }

    function closeCreateDialog() {
        args.dialogs.value?.closeCreateTask('cancel')
    }

    function confirmCreateDialog() {
        const title = (args.dialogs.value?.findOneFieldValueByName('task-title') ?? ctTitle.value).trim()
        if (!title) return
        const parts: Array<string> = []
        if (ctDateLabel.value) parts.push(ctDateLabel.value)
        if (ctTime.value && !isAllDay.value) parts.push(ctTime.value)
        if (ctRepeat.value !== 'Does not repeat') parts.push(ctRepeat.value)
        if (isAllDay.value) parts.push('All day')
        todoList.insertOneTodoFromFields({
            headline: title,
            description: (args.dialogs.value?.findOneFieldValueByName('task-desc') ?? '').trim(),
            collectionName: ctList.value || 'Today',
            dueLabel: parts.join(' · ') || undefined,
            pinned: args.isStarredView(),
        })
        args.ensureVisible(ctList.value)
        args.dialogs.value?.closeCreateTask('save')
    }

    return {
        isCreateListDoneDisabled,
        ctTitle,
        ctDate,
        ctTime,
        isAllDay,
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
