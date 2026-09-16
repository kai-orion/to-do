import { ref } from 'vue'
import { useTodoListStore, type ITodo } from '../stores/todo-list'
import { useTodoTabsStore } from '../stores/todo-tabs'

export type DropPos = 'before' | 'after'

export interface IUseBoardDragArgs {
    isBusy: () => boolean
    ensureVisible: (label: string) => void
}

function dragChip(label: string): HTMLElement {
    const el = document.createElement('div')
    el.textContent = label
    el.className = 'drag-chip'
    document.body.appendChild(el)
    return el
}

/**
 * Business composable (reads Pinia): task + list-card drag & drop.
 * Only call from a page / *Layout.vue. Cross-cutting bits it must not own
 * (composer-busy guard, ensureVisible) arrive as params — hooks never import
 * each other, the page composes them.
 */
export function useBoardDrag(args: IUseBoardDragArgs) {
    const todoList = useTodoListStore()
    const todoTabs = useTodoTabsStore()

    const draggingTaskUuid = ref<string | null>(null)
    const dropIndicator = ref<{ uuid: string, pos: DropPos } | null>(null)
    const draggingCard = ref<string | null>(null)
    const dragCardOver = ref<string | null>(null)
    const dragTaskOverList = ref<string | null>(null)

    // ---- drag & drop: tasks ----
    function onTaskDragStart(e: DragEvent, todo: ITodo) {
        if (args.isBusy()) {
            e.preventDefault()
            return
        }
        draggingTaskUuid.value = todo.data.uuid
        if (e.dataTransfer) {
            e.dataTransfer.effectAllowed = 'move'
            e.dataTransfer.setData('text/plain', todo.data.uuid)
            const chip = dragChip(todo.data.headline)
            e.dataTransfer.setDragImage(chip, 20, 20)
            requestAnimationFrame(() => chip.remove())
        }
    }

    function onTaskDragOver(e: DragEvent, target: ITodo) {
        const uuid = draggingTaskUuid.value
        if (!uuid || uuid === target.data.uuid) return
        const row = (e.currentTarget as HTMLElement).getBoundingClientRect()
        const pos = (e.clientY - row.top) < row.height / 2 ? 'before' : 'after'
        dropIndicator.value = { uuid: target.data.uuid, pos }
    }

    function onTaskDragLeave() {
        dropIndicator.value = null
    }

    function onTaskDragEnd() {
        draggingTaskUuid.value = null
        dropIndicator.value = null
        dragTaskOverList.value = null
    }

    function onTaskDrop(e: DragEvent, target: ITodo) {
        e.preventDefault()
        e.stopPropagation()
        const uuid = draggingTaskUuid.value
        const indicator = dropIndicator.value
        dropIndicator.value = null
        draggingTaskUuid.value = null
        if (!uuid || uuid === target.data.uuid) return
        const dragged = todoList.findOneTodoByUuid(uuid)
        if (!dragged) return
        dragged.data.collectionName = target.data.collectionName
        const delta = indicator?.pos === 'before' ? -0.5 : 0.5
        todoList.updateOneTodoTimestamp(dragged, target.data.creationTimestamp + delta)
        args.ensureVisible(target.data.collectionName)
    }

    // ---- drag & drop: cards (lists) ----
    function onCardDragStart(e: DragEvent, listName: string) {
        if ((e.target as HTMLElement).closest('.task-row, .composer, .add-task, .completed-toggle, .pop-menu')) {
            e.preventDefault()
            return
        }
        draggingCard.value = listName
        if (e.dataTransfer) {
            e.dataTransfer.effectAllowed = 'move'
            e.dataTransfer.setData('text/plain', `list:${listName}`)
            const chip = dragChip(listName)
            e.dataTransfer.setDragImage(chip, 20, 20)
            requestAnimationFrame(() => chip.remove())
        }
    }

    function onCardDragOver(e: DragEvent, listName: string) {
        if (draggingCard.value && draggingCard.value !== listName) {
            e.preventDefault()
            dragCardOver.value = listName
        } else if (draggingTaskUuid.value) {
            e.preventDefault()
            dragTaskOverList.value = listName
        }
    }

    function onCardDrop(e: DragEvent, listName: string) {
        if (draggingCard.value && draggingCard.value !== listName) {
            e.preventDefault()
            e.stopPropagation()
            todoTabs.updateOneTabPosition(draggingCard.value, listName)
            draggingCard.value = null
            dragCardOver.value = null
            return
        }
        if (draggingTaskUuid.value) {
            e.preventDefault()
            e.stopPropagation()
            const dragged = todoList.findOneTodoByUuid(draggingTaskUuid.value)
            draggingTaskUuid.value = null
            dragTaskOverList.value = null
            dropIndicator.value = null
            if (!dragged) return
            todoList.updateOneTodoCollection(dragged, listName)
            todoList.updateOneTodoTimestamp(dragged, Date.now())
            args.ensureVisible(listName)
        }
    }

    function onCardDragEnd() {
        draggingCard.value = null
        dragCardOver.value = null
        dragTaskOverList.value = null
    }

    return {
        draggingTaskUuid,
        dropIndicator,
        draggingCard,
        dragCardOver,
        dragTaskOverList,
        onTaskDragStart,
        onTaskDragOver,
        onTaskDragLeave,
        onTaskDragEnd,
        onTaskDrop,
        onCardDragStart,
        onCardDragOver,
        onCardDrop,
        onCardDragEnd,
    }
}
