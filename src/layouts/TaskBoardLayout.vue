<template>
    <span
        aria-hidden="true"
        class="anchor-top"
        aria-label="用於控制header border-bottom 屬性的錨點元素"
        ref="anchor-top"
    ></span>

    <div class="board-scroll">
        <div
            ref="boardRef"
            class="board"
        >
            <TaskListCard
                v-for="listName in visibleBoardLists"
                :key="listName"
                :list-name="listName"
                :sort-mode="sortMode[listName] ?? 'my-order'"
                :sort-options="sortOptions"
                :is-default-list="isDefaultList(listName)"
                :is-list-menu-open="openPop?.type === 'list' && openPop.name === listName"
                :is-adding="addingTo === listName"
                :draft-title="draftTitle"
                :draft-desc="draftDesc"
                :draft-due="draftDue"
                :is-renaming="renaming === listName"
                :rename-draft="renameDraft"
                :completed-count="completedCounts[listName] ?? 0"
                :is-completed-expanded="!!expandedCompleted[listName]"
                :completed-todos="completedByList[listName] ?? []"
                :is-card-drop-target="dragCardOver === listName"
                :is-task-drop-target="dragTaskOverList === listName"
                :is-draggable-card="!draggingCard"
                @card-dragstart="(e) => onCardDragStart(e, listName)"
                @card-dragend="onCardDragEnd"
                @card-dragover="(e) => onCardDragOver(e, listName)"
                @card-dragleave="() => { if (dragCardOver === listName) dragCardOver = null; if (dragTaskOverList === listName) dragTaskOverList = null }"
                @card-drop="(e) => onCardDrop(e, listName)"
                @menu-toggle="() => toggleListMenu(listName)"
                @sort="(mode) => setSort(listName, mode)"
                @rename-start="() => startRename(listName)"
                @update:rename-draft="(v) => { renameDraft = v }"
                @confirm-rename="() => confirmRename(listName)"
                @delete-list="() => deleteList(listName)"
                @print="printList"
                @delete-completed="() => deleteAllCompleted(listName)"
                @clean-old="() => cleanOldTasks(listName)"
                @add-start="() => startAdd(listName)"
                @update:draft-title="(v) => { draftTitle = v }"
                @update:draft-desc="(v) => { draftDesc = v }"
                @update:draft-due="(v) => { draftDue = v }"
                @confirm-add="() => confirmAdd(listName)"
                @cancel-composer="cancelComposer"
                @toggle-completed="() => toggleCompleted(listName)"
                @uncomplete-task="(uuid) => { const t = todoList.findOneTodoByUuid(uuid); if (t) todoList.updateOneTodoCompletion(t, false) }"
                @delete-completed-task="(uuid) => { const t = todoList.findOneTodoByUuid(uuid); if (t) todoList.removeOneTodo(t) }"
            >
                <template
                    v-for="todo in orderedActive(listName)"
                    :key="todo.data.uuid"
                >
                    <TaskItem
                        :todo="todo"
                        :steps="todoList.findManyStepsByParent(todo).filter(s => !s.isCompleted)"
                        :tabs="tabs"
                        :is-task-menu-open="openPop?.type === 'task' && openPop.uuid === todo.data.uuid"
                        :open-step-menu-index="openPop?.type === 'step' && openPop.parentUuid === todo.data.uuid ? openPop.index : null"
                        :drop-pos="dropIndicator?.uuid === todo.data.uuid ? dropIndicator.pos : null"
                        :is-editing-task="editing?.kind === 'task' && editing.uuid === todo.data.uuid"
                        :edit-title="editTitle"
                        :edit-desc="editDesc"
                        :edit-due="editDue"
                        :is-sub-adding="subAddingTo === todo.data.uuid"
                        :sub-title="subDraftTitle"
                        :sub-desc="subDraftDesc"
                        :sub-due="subDraftDue"
                        :editing-step-index="editing?.kind === 'step' && editing.parentUuid === todo.data.uuid ? editing.index : null"
                        @complete="() => todoList.updateOneTodoCompletion(todo, !todo.isCompleted)"
                        @star="() => todoList.updateOneTodoPinned(todo, !todo.isPinned)"
                        @menu="() => toggleTaskMenu(todo.data.uuid)"
                        @menu-edit="() => { startEdit(todo); closePop() }"
                        @start-edit="() => startEdit(todo)"
                        @update:edit-title="(v) => { editTitle = v }"
                        @update:edit-desc="(v) => { editDesc = v }"
                        @update:edit-due="(v) => { editDue = v }"
                        @confirm-edit="confirmEdit"
                        @cancel-edit="cancelComposer"
                        @start-sub-add="() => startSubAdd(todo.data.uuid)"
                        @update:sub-title="(v) => { subDraftTitle = v }"
                        @update:sub-desc="(v) => { subDraftDesc = v }"
                        @update:sub-due="(v) => { subDraftDue = v }"
                        @confirm-sub-add="() => confirmSubAdd(todo)"
                        @complete-step="(idx) => completeStep(todo, idx, true)"
                        @start-step-edit="(idx) => startStepEdit(todo, idx)"
                        @step-menu="(idx) => toggleStepMenu(todo.data.uuid, idx)"
                        @menu-step-edit="(idx) => { startStepEdit(todo, idx); closePop() }"
                        @step-unindent="(idx) => unindentStep(todo, idx)"
                        @step-delete="(idx) => deleteStep(todo, idx)"
                        @step-move="(idx, list) => moveStepTo(todo, idx, list)"
                        @step-new-list="(idx) => newListForMove({ kind: 'step', parentUuid: todo.data.uuid, index: idx })"
                        @move-task="(list) => moveTaskTo(todo, list)"
                        @new-list="() => newListForMove({ kind: 'task', uuid: todo.data.uuid })"
                        @delete-task="() => { todoList.removeOneTodo(todo); closePop() }"
                        @attach="() => triggerAttach(todo.data.uuid)"
                        @dragstart="(e) => onTaskDragStart(e, todo)"
                        @dragend="onTaskDragEnd"
                        @dragover="(e) => onTaskDragOver(e, todo)"
                        @dragleave="onTaskDragLeave"
                        @drop="(e) => onTaskDrop(e, todo)"
                    />
                </template>
            </TaskListCard>
        </div>
    </div>

    <!-- click-away layer for pop menus -->
    <div
        v-if="openPop"
        class="pop-scrim"
        @click="closePop"
    ></div>

    <input
        :ref="(el) => { attachInputRef = el as HTMLInputElement | null }"
        type="file"
        class="hidden-input"
        tabindex="-1"
        @change="onAttachPicked"
    />

    <TaskDialogs
        ref="dialogsRef"
        :tabs="tabs"
        :is-create-list-done-disabled="isCreateListDoneDisabled"
        :ct-date-label="ctDateLabel"
        :ct-time="ctTime"
        :is-all-day="isAllDay"
        :ct-repeat="ctRepeat"
        :ct-list="ctList"
        :is-save-disabled="!ctTitle.trim()"
        @list-name-input="(v) => { isCreateListDoneDisabled = v.trim().length === 0 }"
        @task-title-input="(v) => { ctTitle = v }"
        @create-list-close="(ret, name) => handleCreateListClose(ret, name)"
        @update:ct-date="(v) => { ctDate = v }"
        @update:ct-time="(v) => { ctTime = v }"
        @update:is-all-day="(v) => { isAllDay = v }"
        @update:ct-repeat="(v) => { ctRepeat = v }"
        @update:ct-list="(v) => { ctList = v }"
        @close-create-task="closeCreateDialog"
        @confirm-create-task="confirmCreateDialog"
    />
</template>

<script setup lang="ts">
import { computed, reactive, ref, useTemplateRef } from 'vue'
import TaskDialogs from '@components/board/TaskDialogs.vue'
import TaskItem from '@components/board/TaskItem.vue'
import TaskListCard from '@components/board/TaskListCard.vue'
import { useBoardDialogs, type IDialogApi } from '@composables/useBoardDialogs'
import { useBoardDrag } from '@composables/useBoardDrag'
import { useComposers } from '@composables/useComposers'
import { useIntersectionAnchor } from '@composables/useIntersectionAnchor'
import { useMasonry } from '@composables/useMasonry'
import { useMediaQueryStore } from '@stores/media-query'
import { useTodoListStore, type ITodo } from '@stores/todo-list'
import { useTodoTabsStore } from '@stores/todo-tabs'
import type { ISortMode, ISortOption } from '@utils/board'

export type IBoardPopState =
    | { type: 'list', name: string }
    | { type: 'task', uuid: string }
    | { type: 'step', parentUuid: string, index: number }

// Layout: owns all board-local state (sort/menu/composers/drag/dialogs)
// plus todo stores. Shared filters (activeView/visible) arrive via props
// so the page stays the single source; filter mutations leave via emits.
const props = defineProps<{
    activeView: 'all' | 'starred'
    visible: Record<string, boolean>
}>()

const emit = defineEmits<{
    (e: 'ensure-visible', label: string): void
    (e: 'visible-rename', oldName: string, newName: string): void
    (e: 'visible-delete', label: string): void
}>()

const todoList = useTodoListStore()
const todoTabs = useTodoTabsStore()
const mediaQuery = useMediaQueryStore()

const tabs = computed(() => todoTabs.tabs)

const sortOptions: Array<ISortOption> = [
    { value: 'my-order', label: 'My order' },
    { value: 'date', label: 'Date' },
    { value: 'deadline', label: 'Deadline' },
    { value: 'starred', label: 'Starred recently' },
    { value: 'title', label: 'Title' },
]

const expandedCompleted = reactive<Record<string, boolean>>({})
const sortMode = reactive<Record<string, ISortMode>>({})
const openPop = ref<IBoardPopState | null>(null)

function ensureVisible(label: string) {
    emit('ensure-visible', label)
}

function baseActive(listName: string): Array<ITodo> {
    const out: Array<ITodo> = []
    for (const todo of todoList.todos) {
        if (todo.isCompleted) continue
        if (props.activeView === 'starred' && !todo.isPinned) continue
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
        if (props.activeView === 'starred' && !todo.isPinned) continue
        if (!map[todo.data.collectionName]) map[todo.data.collectionName] = []
        map[todo.data.collectionName].push(todo)
    }
    for (const k of Object.keys(map)) {
        map[k].sort((a, b) => (b.completedAt ?? 0) - (a.completedAt ?? 0))
    }
    return map
})

const completedCounts = computed(() => {
    const counts: Record<string, number> = {}
    for (const t of tabs.value) counts[t.label] = (completedByList.value[t.label] ?? []).length
    return counts
})

const visibleBoardLists = computed(() => {
    if (props.activeView === 'starred') return tabs.value.map(t => t.label)
    return tabs.value.map(t => t.label).filter(l => props.visible[l] !== false)
})

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

function setSort(listName: string, mode: ISortMode) {
    sortMode[listName] = mode
    closePop()
}

function isDefaultList(listName: string): boolean {
    return todoTabs.tabs.length > 0 && todoTabs.tabs[0].label === listName
}

// ---- anchor for header border (owned here with the board scroll) ----
const ancorTopElementRef = useTemplateRef<HTMLElement>('anchor-top')
const intersection = useIntersectionAnchor(ancorTopElementRef)

const attachInputRef = ref<HTMLInputElement | null>(null)
const pendingAttachUuid = ref<string | null>(null)

// ---- drag & drop: tasks + cards (reads stores) ----
const {
    draggingCard,
    dragCardOver,
    dragTaskOverList,
    dropIndicator,
    onTaskDragStart,
    onTaskDragOver,
    onTaskDragLeave,
    onTaskDragEnd,
    onTaskDrop,
    onCardDragStart,
    onCardDragOver,
    onCardDrop,
    onCardDragEnd,
} = useBoardDrag({
    isBusy: () => !!editing.value || !!addingTo.value,
    ensureVisible,
})

// ---- create dialogs: elements live in pure TaskDialogs; data + logic from hook ----
const dialogsRef = ref<IDialogApi | null>(null)
const {
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
} = useBoardDialogs({
    dialogs: dialogsRef,
    isStarredView: () => props.activeView === 'starred',
    defaultList: () => visibleBoardLists.value[0] ?? tabs.value[0]?.label ?? 'Today',
    ensureVisible,
})

// ---- inline composers: pure draft state machine (no store inside) ----
const {
    addingTo,
    draftTitle,
    draftDesc,
    draftDue,
    renaming,
    renameDraft,
    editing,
    editTitle,
    editDesc,
    editDue,
    subAddingTo,
    subDraftTitle,
    subDraftDesc,
    subDraftDue,
    startAdd,
    cancelComposer,
    startRename,
    startEdit,
    startStepEdit: startStepComposer,
    startSubAdd,
} = useComposers({ closePop })

function startStepEdit(todo: ITodo, index: number) {
    startStepComposer(todo.data.uuid, index, todoList.findManyStepsByParent(todo)[index]?.headline)
}

function confirmAdd(listName: string) {
    const title = draftTitle.value.trim()
    if (!title) {
        cancelComposer()
        return
    }
    todoList.insertOneTodoFromFields({
        headline: title,
        description: draftDesc.value.trim(),
        collectionName: listName,
        dueLabel: draftDue.value || undefined,
        pinned: props.activeView === 'starred',
    })
    // keep the composer open for rapid entry, like Google Tasks
    draftTitle.value = ''
    draftDesc.value = ''
    draftDue.value = ''
}

function confirmEdit() {
    const st = editing.value
    if (!st) return
    const title = editTitle.value.trim()
    if (st.kind === 'task') {
        const todo = todoList.findOneTodoByUuid(st.uuid)
        if (todo) {
            if (!title) {
                todoList.removeOneTodo(todo)
            } else {
                todoList.updateOneTodo(todo, {
                    headline: title,
                    description: editDesc.value.trim(),
                    dueLabel: editDue.value || undefined,
                })
            }
        }
    } else {
        const parent = todoList.findOneTodoByUuid(st.parentUuid)
        if (parent) {
            if (!title) {
                todoList.removeOneStepByParent(parent, st.index)
            } else {
                todoList.updateOneStepByParent(parent, st.index, title)
            }
        }
    }
    cancelComposer()
}

// ---- subtasks ----
function confirmSubAdd(parent: ITodo) {
    const title = subDraftTitle.value.trim()
    if (!title) {
        cancelComposer()
        return
    }
    todoList.insertOneStepByParent(parent, title, subDraftDue.value || undefined)
    subDraftTitle.value = ''
    subDraftDesc.value = ''
    subDraftDue.value = ''
}

function completeStep(parent: ITodo, index: number, value: boolean) {
    todoList.updateOneStepCompletionByParent(parent, index, value)
}

function deleteStep(parent: ITodo, index: number) {
    todoList.removeOneStepByParent(parent, index)
    closePop()
}

function unindentStep(parent: ITodo, index: number) {
    todoList.insertOneTodoFromStep(parent, index)
    closePop()
}

function moveStepTo(parent: ITodo, index: number, listName: string) {
    todoList.insertOneTodoFromStep(parent, index, listName)
    ensureVisible(listName)
    closePop()
}

// ---- task move / attach ----
function moveTaskTo(todo: ITodo, listName: string) {
    todoList.updateOneTodoCollection(todo, listName)
    ensureVisible(listName)
    closePop()
}

function triggerAttach(uuid: string) {
    closePop()
    pendingAttachUuid.value = uuid
    attachInputRef.value?.click()
}

function onAttachPicked(e: Event) {
    const input = e.target as HTMLInputElement
    const file = input.files?.[0]
    const uuid = pendingAttachUuid.value
    pendingAttachUuid.value = null
    input.value = ''
    if (!file || !uuid) return
    const todo = todoList.findOneTodoByUuid(uuid)
    if (!todo) return
    todoList.updateOneTodoAttachment(todo, file.name)
}

// ---- list rename / delete / cleanup ----
function confirmRename(oldName: string) {
    const next = renameDraft.value.trim()
    if (!next || next === oldName) {
        cancelComposer()
        return
    }
    if (!todoTabs.updateOneTab(oldName, next)) {
        cancelComposer()
        return
    }
    todoList.updateManyTodosCollection(oldName, next)
    emit('visible-rename', oldName, next)
    if (sortMode[oldName] !== undefined) {
        sortMode[next] = sortMode[oldName]!
        delete sortMode[oldName]
    }
    cancelComposer()
}

function deleteList(listName: string) {
    closePop()
    if (isDefaultList(listName)) return
    if (todoTabs.removeOneTabByLabel(listName)) {
        todoList.removeManyTodosByList(listName)
        emit('visible-delete', listName)
    }
}

function deleteAllCompleted(listName: string) {
    closePop()
    todoList.removeManyCompletedTodosByList(listName)
}

function cleanOldTasks(listName: string) {
    closePop()
    todoList.removeManyOldCompletedTodosByList(listName, Date.now() - 30 * 86400000)
}

function printList() {
    closePop()
    window.print()
}

// ---- masonry spans (fallback while native grid masonry is unsupported) ----
function isMasonryBreakpoint(): boolean {
    return mediaQuery.currentBreakpoint === 'expanded'
        || mediaQuery.currentBreakpoint === 'large'
        || mediaQuery.currentBreakpoint === 'extra-large'
}

const { boardRef } = useMasonry({
    breakpoint: computed(() => mediaQuery.currentBreakpoint),
    isMasonry: isMasonryBreakpoint,
})

defineExpose({
    openCreateList,
    openCreateDialog,
    intersection,
    boardRef,
})
</script>

<style scoped>
@reference "@styles/tailwind.css";

.anchor-top {
    display: block;
    height: 1px;
    width: 100%;
}

.board-scroll {
    min-height: 100%;
    width: 100%;
    overflow: auto;
}

.board {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 8px;
    align-items: baseline;
    padding: 16px 24px 48px 24px;
    max-width: 1600px;
}

/* Expanded and above: masonry packing on the CSS grid. Native masonry
   syntax first (future browsers), span-based fallback otherwise — the
   fallback unit rows only apply where native masonry is unsupported. */
@supports (display: grid-lanes) {
    html:is([expanded], [large], [extra-large]) .board {
        display: grid-lanes;
    }
}

@supports (grid-template-rows: masonry) {
    html:is([expanded], [large], [extra-large]) .board {
        grid-template-rows: masonry;
    }
}

@supports not ((display: grid-lanes) or (grid-template-rows: masonry)) {
    html:is([expanded], [large], [extra-large]) .board {
        /* grid-auto-rows: 4px; */
        /* dense lets later cards backfill gaps left by shorter cards */
        grid-auto-flow: dense;
    }
}

html:is([expanded], [large], [extra-large]) .board-scroll {
    overflow: visible;
}

.hidden-input {
    position: absolute;
    width: 1px;
    height: 1px;
    opacity: 0;
    pointer-events: none;
}

.pop-scrim {
    position: fixed;
    inset: 0;
    z-index: 40;
    background: transparent;
}
</style>
