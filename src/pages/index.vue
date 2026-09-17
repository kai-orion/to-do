<template>
    <Product>
        <template #header>
            <TasksHeader
                :border-bottom="!intersection.isVisible.value"
                @menu-click="() => navigation.updateOpen(!navigation.isOpen)"
            >
                <template #end>
                    <md-icon-button @click="() => handleLightDarkIconButtonSwitch((isDark) => !isDark)">
                        <md-icon v-if="isLightModeIconShown">light_mode</md-icon>
                        <md-icon v-else>dark_mode</md-icon>
                    </md-icon-button>
                </template>
            </TasksHeader>
        </template>

        <template #navigation-drawer>
            <div
                class="tasks-drawer"
                :class="{ 'is-modal': isModal, 'is-open': navigation.isOpen }"
            >
                <TaskSidebar
                    :tabs="tabs"
                    :counts="activeCounts"
                    :visible="visibleLists"
                    :active-view="activeView"
                    :is-lists-collapsed="isListsCollapsed"
                    @select-all="activeView = 'all'"
                    @select-starred="activeView = 'starred'"
                    @toggle-list="toggleListVisible"
                    @toggle-lists-collapsed="isListsCollapsed = !isListsCollapsed"
                    @create-list="() => openCreateList()"
                    @create-task="() => openCreateDialog()"
                />
            </div>
            <span
                v-if="isModal"
                class="tasks-scrim"
                :class="[navigation.isOpen && 'is-open']"
                @click="() => navigation.updateOpen(false)"
            ></span>
        </template>

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
    </Product>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, useTemplateRef } from 'vue'
import TaskDialogs from '@components/board/task-dialogs.vue'
import TaskItem from '@components/board/task-item.vue'
import TaskListCard from '@components/board/task-list-card.vue'
import TasksHeader from '@components/board/tasks-header.vue'
import TaskSidebar from '@components/task-sidebar/TaskSidebar.vue'
import { useBoardDialogs, type IDialogApi } from '@composables/useBoardDialogs'
import { useBoardDrag } from '@composables/useBoardDrag'
import { useBoardView } from '@composables/useBoardView'
import { useComposers } from '@composables/useComposers'
import { useIntersectionAnchor } from '@composables/useIntersectionAnchor'
import { useMasonry } from '@composables/useMasonry'
import Product from '@layouts/Product.vue'
import { useMaterialThemeStore } from '@stores/material-theme'
import { useMediaQueryStore } from '@stores/media-query'
import { useNavigationStore } from '@stores/navigation'
import { useTodoListStore, type ITodo } from '@stores/todo-list'
import { useTodoTabsStore } from '@stores/todo-tabs'

const todoList = useTodoListStore()
const todoTabs = useTodoTabsStore()
const mediaQuery = useMediaQueryStore()
const navigation = useNavigationStore()

/**
 * 監聽 anchor-top 以控制 header 組件的 border-bottom 屬性
 */
const ancorTopElementRef = useTemplateRef<HTMLElement>('anchor-top')
const intersection = useIntersectionAnchor(ancorTopElementRef)
onMounted(() => {
    intersection.start()
})

/**
 * isDark
 * - 用於控制 header 組件的 light dark 圖標切換
 * - 用於處理 light dark 主題切換
 */
const theme = useMaterialThemeStore()
const isLightModeIconShown = computed(() => theme.isDark)
const handleLightDarkIconButtonSwitch = (isDarkValueOrToggle: boolean | ((isDark: boolean) => boolean)) => {
    if (typeof isDarkValueOrToggle === 'boolean') theme.updateIsDark(isDarkValueOrToggle)
    else theme.updateIsDark(isDarkValueOrToggle(theme.isDark))
}

const isModal = computed(() => mediaQuery.currentBreakpoint === 'compact')

// ---- board view-model: view/filter/sort/menu state + derived lists (reads stores) ----
const {
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
} = useBoardView()

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
    openCreateDialog: openCreateTaskDialog,
    closeCreateDialog,
    confirmCreateDialog,
} = useBoardDialogs({
    dialogs: dialogsRef,
    isStarredView: () => activeView.value === 'starred',
    defaultList: () => visibleBoardLists.value[0] ?? tabs.value[0]?.label ?? 'Today',
    ensureVisible,
})

function openCreateDialog() {
    if (isModal.value) navigation.updateOpen(false)
    openCreateTaskDialog()
}

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
        pinned: activeView.value === 'starred',
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
    if (visibleLists[oldName] !== undefined) {
        visibleLists[next] = visibleLists[oldName]!
        delete visibleLists[oldName]
    }
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
        delete visibleLists[listName]
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

onMounted(() => {
    if (isModal.value) navigation.updateOpen(false)
    else navigation.updateOpen(true)
})
</script>

<style scoped>
@reference "@styles/tailwind.css";

.tasks-drawer {
    width: 260px;
    height: 100%;
    overflow: auto;
    transition: width 200ms ease, opacity 200ms ease;

    transition-duration: 200ms;
    transition-behavior: allow-discrete;
    transition-property: border-right-color;
    border-right-color: transparent;
    border-right-style: solid;
    border-right-width: 1px;
}

:root[dark] .tasks-drawer {
    border-right-color: var(--md-sys-color-outline-variant);
}

:root[compact] .tasks-drawer {
    width: min(90dvw, 320px);
    @apply rounded-r-extra-large;
}

.tasks-drawer:not(.is-modal):not(.is-open) {
    width: 0;
    opacity: 0;
    overflow: hidden;
    pointer-events: none;
}

.tasks-drawer.is-modal {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    z-index: 30;
    transition: transform 200ms ease;
    transform: translateX(-100%);
}

.tasks-drawer.is-modal.is-open {
    transform: translateX(0);
}

.tasks-scrim {
    position: fixed;
    inset: 0;
    z-index: 20;
    background: rgb(0 0 0 / 0.38);
    opacity: 0;
    pointer-events: none;
    transition: opacity 200ms ease;
}

.tasks-scrim.is-open {
    opacity: 1;
    pointer-events: auto;
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
