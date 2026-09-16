<template>
    <section
        class="list-card"
        :class="[
            isCardDropTarget && 'card-drop-target',
            isTaskDropTarget && 'card-task-target',
        ]"
        @dragover.prevent="emit('card-dragover', $event)"
        @dragleave="emit('card-dragleave')"
        @drop="emit('card-drop', $event)"
    >
        <div
            class="card-head"
            :draggable="draggableCard ? true : undefined"
            @dragstart="emit('card-dragstart', $event)"
            @dragend="emit('card-dragend')"
        >
            <h2 class="card-title">{{ listName }}</h2>
            <md-icon-button
                class="card-menu-btn"
                @click="emit('menu-toggle')"
                aria-label="List options"
            >
                <md-icon>more_vert</md-icon>
            </md-icon-button>

            <div
                v-if="listMenuOpen"
                class="pop-menu list-menu"
                @click.stop
            >
                <div class="menu-section-label">Sort by</div>
                <button
                    v-for="opt in sortOptions"
                    :key="opt.value"
                    type="button"
                    class="menu-item"
                    @click="emit('sort', opt.value)"
                >
                    <md-icon class="menu-check">{{ sortMode === opt.value ? 'check' : '' }}</md-icon>
                    <span>{{ opt.label }}</span>
                </button>
                <div class="menu-divider"></div>
                <button
                    type="button"
                    class="menu-item"
                    @click="emit('rename-start')"
                >
                    <span class="menu-spacer"></span>
                    <span>Rename list</span>
                </button>
                <button
                    type="button"
                    class="menu-item"
                    :disabled="isDefaultList"
                    :title="isDefaultList ? `Default list can't be deleted` : ''"
                    @click="emit('delete-list')"
                >
                    <span class="menu-spacer"></span>
                    <span>Delete list</span>
                </button>
                <div
                    v-if="isDefaultList"
                    class="menu-hint"
                >Default list can't be deleted</div>
                <div class="menu-divider"></div>
                <button
                    type="button"
                    class="menu-item"
                    @click="emit('print')"
                >
                    <span class="menu-spacer"></span>
                    <span>Print list</span>
                </button>
                <button
                    type="button"
                    class="menu-item"
                    @click="emit('delete-completed')"
                >
                    <span class="menu-spacer"></span>
                    <span>Delete all completed tasks</span>
                </button>
                <button
                    type="button"
                    class="menu-item"
                    @click="emit('clean-old')"
                >
                    <span class="menu-spacer"></span>
                    <span>Clean up old tasks</span>
                </button>
            </div>
        </div>

        <button
            type="button"
            class="add-task"
            @click="emit('add-start')"
        >
            <md-icon class="add-task-icon">add_task</md-icon>
            <span>Add a task</span>
        </button>

        <!-- inline composer for a new top-level task -->
        <TaskComposer
            v-if="isAdding"
            :title="draftTitle"
            :description="draftDesc"
            :due="draftDue"
            title-placeholder="Title"
            autofocus="focus"
            @update:title="emit('update:draft-title', $event)"
            @update:description="emit('update:draft-desc', $event)"
            @update:due="emit('update:draft-due', $event)"
            @confirm="emit('confirm-add')"
            @cancel="emit('cancel-composer')"
        />

        <TaskComposer
            v-if="isRenaming"
            :title="renameDraft"
            :show-check="false"
            title-placeholder="List name"
            :show-rename-actions="true"
            autofocus="focus"
            @update:title="emit('update:rename-draft', $event)"
            @confirm="emit('confirm-rename')"
            @cancel="emit('cancel-composer')"
        />

        <ul class="tasks">
            <slot></slot>
        </ul>

        <button
            v-if="completedCount > 0"
            type="button"
            class="completed-toggle"
            @click="emit('toggle-completed')"
        >
            <md-icon class="completed-arrow">{{ completedExpanded ? 'arrow_drop_down' : 'arrow_right' }}</md-icon>
            <span>Completed ({{ completedCount }})</span>
        </button>
        <ul
            v-if="completedExpanded"
            class="tasks completed-list"
        >
            <li
                v-for="todo in completedTodos"
                :key="`c-${todo.data.uuid}`"
                class="task-row is-done"
            >
                <span class="done-check">
                    <md-icon class="done-check-icon">check</md-icon>
                </span>
                <div class="task-text">
                    <div class="task-title">{{ todo.data.headline }}</div>
                    <div class="task-desc">Completed: {{ formatCompleted(todo.completedAt) }}</div>
                </div>
                <span class="row-actions">
                    <md-icon-button
                        class="task-uncomplete"
                        @click="emit('uncomplete-task', todo.data.uuid)"
                        aria-label="Mark not complete"
                    >
                        <md-icon>add_task</md-icon>
                    </md-icon-button>
                    <md-icon-button
                        class="task-delete"
                        @click="emit('delete-completed-task', todo.data.uuid)"
                        aria-label="Delete"
                    >
                        <md-icon>delete</md-icon>
                    </md-icon-button>
                </span>
            </li>
        </ul>
    </section>
</template>

<script setup lang="ts">
import type { ITodo } from '../../stores/todo-list'
import TaskComposer from './task-composer.vue'

// Pure component: no Pinia, no router. Task rows come via default
// <slot> so tiny row markup stays in task-item, not duplicated here.
export type SortMode = 'my-order' | 'date' | 'deadline' | 'starred' | 'title'

defineProps<{
    listName: string
    sortMode: SortMode
    sortOptions: Array<{ value: SortMode, label: string }>
    isDefaultList: boolean
    listMenuOpen: boolean
    isAdding: boolean
    draftTitle: string
    draftDesc: string
    draftDue: string
    isRenaming: boolean
    renameDraft: string
    completedCount: number
    completedExpanded: boolean
    completedTodos: Array<ITodo>
    isCardDropTarget: boolean
    isTaskDropTarget: boolean
    draggableCard: boolean
}>()

const emit = defineEmits<{
    (e: 'card-dragstart', ev: DragEvent): void
    (e: 'card-dragend'): void
    (e: 'card-dragover', ev: DragEvent): void
    (e: 'card-dragleave'): void
    (e: 'card-drop', ev: DragEvent): void
    (e: 'menu-toggle'): void
    (e: 'sort', mode: SortMode): void
    (e: 'rename-start'): void
    (e: 'update:rename-draft', v: string): void
    (e: 'confirm-rename'): void
    (e: 'delete-list'): void
    (e: 'print'): void
    (e: 'delete-completed'): void
    (e: 'clean-old'): void
    (e: 'add-start'): void
    (e: 'update:draft-title', v: string): void
    (e: 'update:draft-desc', v: string): void
    (e: 'update:draft-due', v: string): void
    (e: 'confirm-add'): void
    (e: 'cancel-composer'): void
    (e: 'toggle-completed'): void
    (e: 'uncomplete-task', uuid: string): void
    (e: 'delete-completed-task', uuid: string): void
}>()

function formatCompleted(ts: number | undefined): string {
    if (!ts) return ''
    const d = new Date(ts)
    const nowYear = new Date().getFullYear()
    if (d.getFullYear() === nowYear) {
        return new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).format(d)
    }
    return new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(d)
}
</script>

<style scoped>
@reference "../../styles/tailwind.css";

.list-card {
    @apply bg-surface text-on-surface;
    border: 1px solid var(--md-sys-color-outline-variant);
    border-radius: 16px;
    padding: 8px;
    min-width: 0;
    transition: box-shadow 200ms ease, border-color 200ms ease;
}

.list-card:hover {
    box-shadow: 0 1px 3px rgb(0 0 0 / 0.12), 0 4px 12px rgb(0 0 0 / 0.08);
}

.list-card:focus-within {
    border-color: var(--md-sys-color-outline);
}

.list-card.card-drop-target {
    border-left: 3px solid #0b57d0;
    padding-left: 6px;
}

.list-card.card-task-target {
    outline: 2px dashed color-mix(in srgb, #0b57d0 55%, transparent);
    outline-offset: -6px;
}

.card-head {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 4px 4px 16px;
    border-radius: 12px 12px 0 0;
}

.card-head[draggable="true"] {
    cursor: grab;
}

.card-head[draggable="true"]:active {
    cursor: grabbing;
}

.card-title {
    font-size: 16px;
    line-height: 24px;
    font-weight: 400;
    letter-spacing: 0.15px;
}

.card-menu-btn {
    --md-icon-button-icon-size: 20px;
    width: 32px;
    height: 32px;
}

.add-task {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    padding: 8px 16px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    letter-spacing: 0.1px;
    color: #0b57d0;
    cursor: pointer;
}

.add-task:hover {
    background-color: color-mix(in srgb, #0b57d0 8%, transparent);
}

.add-task-icon {
    --md-icon-size: 20px;
    font-variation-settings: 'FILL' 0;
}

/* ---- pop menus ---- */
.pop-menu {
    position: absolute;
    top: calc(100% - 4px);
    right: 8px;
    min-width: 230px;
    max-width: min(280px, 70vw);
    z-index: 50;
    padding: 8px 0;
    border-radius: 12px;
    @apply bg-surface text-on-surface;
    box-shadow:
        0 4px 12px rgb(0 0 0 / 0.18),
        0 1px 3px rgb(0 0 0 / 0.2);
}

.list-menu {
    top: calc(100% - 8px);
}

.menu-section-label {
    font-size: 12px;
    padding: 4px 16px 4px 52px;
    @apply text-on-surface-variant;
}

.menu-item {
    display: flex;
    align-items: center;
    gap: 16px;
    width: 100%;
    min-height: 40px;
    padding: 8px 16px;
    font-size: 14px;
    line-height: 20px;
    cursor: pointer;
    text-align: left;
}

.menu-item:hover:not(:disabled) {
    background-color: color-mix(in srgb, var(--md-sys-color-on-surface) 8%, transparent);
}

.menu-item:disabled {
    opacity: 0.45;
    cursor: default;
}

.menu-check {
    --md-icon-size: 20px;
    flex: none;
    width: 20px;
    color: #0b57d0;
}

.menu-spacer {
    flex: none;
    width: 20px;
}

.menu-divider {
    height: 1px;
    margin: 8px 0;
    background-color: var(--md-sys-color-outline-variant);
}

.menu-hint {
    font-size: 12px;
    padding: 0 16px 4px 52px;
    @apply text-on-surface-variant;
}

.tasks {
    list-style: none;
    margin: 0;
    padding: 4px 0 0 0;
    display: flex;
    flex-direction: column;
}

/* ---- completed ---- */
.completed-toggle {
    display: flex;
    align-items: center;
    gap: 4px;
    width: 100%;
    padding: 6px 12px 6px 8px;
    font-size: 14px;
    line-height: 20px;
    font-weight: 500;
    border-radius: 8px;
    cursor: pointer;
    @apply text-on-surface-variant;
}

.completed-toggle:hover {
    background-color: color-mix(in srgb, var(--md-sys-color-on-surface) 6%, transparent);
}

.completed-arrow {
    --md-icon-size: 20px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
    position: relative;
    top: 1px;
}

.completed-list .task-title {
    text-decoration: line-through;
}

.task-row {
    position: relative;
    display: grid;
    grid-template-columns: 40px 1fr auto;
    gap: 0;
    align-items: start;
    min-height: 44px;
    padding: 6px 4px 6px 0;
    border-radius: 8px;
}

.task-text {
    min-width: 0;
    padding-top: 1px;
}

.task-title {
    font-size: 14px;
    line-height: 20px;
    letter-spacing: 0.25px;
    overflow-wrap: anywhere;
}

.task-desc {
    font-size: 12px;
    line-height: 16px;
    margin-top: 2px;
    overflow-wrap: anywhere;
    white-space: pre-line;
    @apply text-on-surface-variant;
}

.done-check {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    margin: 2px 0 0 12px;
}

.done-check-icon {
    --md-icon-size: 20px;
    color: #0b57d0;
    font-variation-settings: 'FILL' 0;
}

.task-uncomplete,
.task-delete {
    width: 32px;
    height: 32px;
    --md-icon-button-icon-size: 18px;
}

.task-row.is-done {
    grid-template-columns: 40px 1fr auto;
}

.row-actions {
    display: flex;
    align-items: center;
}
</style>
