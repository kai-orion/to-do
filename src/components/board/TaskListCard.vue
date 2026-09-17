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
        <md-elevation></md-elevation>

        <div
            class="card-head"
            :draggable="isDraggableCard ? true : undefined"
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
                v-if="isListMenuOpen"
                class="pop-menu list-menu"
                @click.stop
            >
                <md-elevation></md-elevation>
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
            :has-check="false"
            title-placeholder="List name"
            :has-rename-actions="true"
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
            <md-icon class="completed-arrow">{{ isCompletedExpanded ? 'arrow_drop_down' : 'arrow_right' }}</md-icon>
            <span>Completed ({{ completedCount }})</span>
        </button>
        <ul
            v-if="isCompletedExpanded"
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
import type { ITodo } from '@stores/todo-list';
import type { ISortMode, ISortOption } from '@utils/board';
import TaskComposer from '@components/board/TaskComposer.vue';

// Pure component: no Pinia, no router. Task rows come via default
// <slot> so tiny row markup stays in task-item, not duplicated here.
export type { ISortMode, ISortOption };

const props = withDefaults(defineProps<{
    listName: string
    sortMode: ISortMode
    sortOptions: Array<ISortOption>
    isDefaultList: boolean
    isListMenuOpen: boolean
    isAdding: boolean
    draftTitle: string
    draftDesc: string
    draftDue: string
    isRenaming: boolean
    renameDraft: string
    completedCount: number
    isCompletedExpanded: boolean
    completedTodos: Array<ITodo>
    isCardDropTarget: boolean
    isTaskDropTarget: boolean
    isDraggableCard: boolean
}>(), {
})

const emit = defineEmits<{
    (e: 'card-dragstart', ev: DragEvent): void
    (e: 'card-dragend'): void
    (e: 'card-dragover', ev: DragEvent): void
    (e: 'card-dragleave'): void
    (e: 'card-drop', ev: DragEvent): void
    (e: 'menu-toggle'): void
    (e: 'sort', mode: ISortMode): void
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
@reference "@styles/tailwind.css";

.list-card {
    @apply bg-surface text-on-surface;
    position: relative;
    border: 1px solid var(--md-sys-color-outline-variant);
    border-radius: 16px;
    padding: 8px;
    min-width: 0;
    transition: border-color 200ms ease;

    --md-elevation-level: 0;

    &:focus-within {
        --md-elevation-level: 1;
    }

    &:hover {
        --md-elevation-level: 2;
    }

    &:active {
        --md-elevation-level: 3;
        user-select: none;
    }
}

:root[darl] .list-card {
    --md-elevation-level: 0;

    &:focus-within {
        --md-elevation-level: 0;
    }

    &:hover {
        --md-elevation-level: 0;
    }

    &:active {
        --md-elevation-level: 0;
    }
}

.list-card:focus-within {
    border-color: var(--md-sys-color-outline);
}

.list-card.card-drop-target {
    border-left: 3px solid var(--md-sys-color-primary);
    padding-left: 6px;
}

.list-card.card-task-target {
    outline: 2px dashed var(--md-sys-color-primary);
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
    cursor: pointer;
    user-select: none;
    @apply text-primary bg-transparent;

    &:hover {
        @apply bg-on-primary text-primary;
    }

    & .add-task-icon {
        --md-icon-size: 20px;
        font-variation-settings: 'FILL' 0;
    }


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

    --md-elevation-level: 3;

    transition-duration: 200ms;
    transition-behavior: allow-discrete;
    transition-property: border-color;
    border-color: transparent;
    border-style: solid;
    border-width: 1px;
}

:root[dark] .pop-menu {
    border-color: var(--md-sys-color-outline);
    --md-elevation-level: 0;
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

.menu-item:disabled {
    opacity: 0.45;
    cursor: default;
}

.menu-check {
    --md-icon-size: 20px;
    flex: none;
    width: 20px;
    color: var(--md-sys-color-secondary);
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
    @apply bg-surface-variant text-on-surface-variant;
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
    @apply text-on-surface;
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
