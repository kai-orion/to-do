<template>
    <template v-if="isEditingTask">
        <li class="composer editing-composer">
            <TaskComposer
                :title="editTitle"
                :description="editDesc"
                :due="editDue"
                :has-drag-hint="true"
                autofocus="select"
                @update:title="emit('update:edit-title', $event)"
                @update:description="emit('update:edit-desc', $event)"
                @update:due="emit('update:edit-due', $event)"
                @confirm="emit('confirm-edit')"
                @cancel="emit('cancel-edit')"
            />
        </li>
    </template>
    <li
        v-else
        class="task-row"
        :class="[dropPos && `drop-${dropPos}`]"
        draggable="true"
        @dragstart="emit('dragstart', $event)"
        @dragend="emit('dragend')"
        @dragover.prevent="emit('dragover', $event)"
        @dragleave="emit('dragleave')"
        @drop="emit('drop', $event)"
    >
        <button
            type="button"
            class="circle-check"
            @click="emit('complete')"
            aria-label="Mark complete"
        >
            <md-ripple></md-ripple>
        </button>
        <div
            class="task-text"
            @click="emit('start-edit')"
        >
            <div class="task-title">{{ todo.data.headline }}</div>
            <div
                v-if="todo.data.description"
                class="task-desc"
            >{{ todo.data.description }}</div>
            <div
                v-if="todo.data.dueLabel"
                class="task-due"
            >{{ todo.data.dueLabel }}</div>
        </div>
        <span class="row-actions">
            <md-icon-button
                class="row-menu-btn"
                @click.stop="emit('menu')"
                aria-label="Task options"
            >
                <md-icon>more_vert</md-icon>
            </md-icon-button>
            <md-icon-button
                class="task-star"
                :class="[todo.isPinned && 'starred']"
                @click.stop="emit('star')"
                aria-label="Star"
            >
                <md-icon>{{ todo.isPinned ? 'star' : 'star_outline' }}</md-icon>
            </md-icon-button>
        </span>

        <div
            v-if="isTaskMenuOpen"
            class="pop-menu task-menu"
            @click.stop
        >
            <button
                type="button"
                class="menu-item"
                @click="emit('menu-edit')"
            >
                <md-icon class="menu-icon">schedule</md-icon>
                <span>Add deadline</span>
            </button>
            <button
                type="button"
                class="menu-item"
                @click="emit('start-sub-add')"
            >
                <md-icon class="menu-icon">subdirectory_arrow_right</md-icon>
                <span>Add a subtask</span>
            </button>
            <button
                type="button"
                class="menu-item"
                @click="emit('attach')"
            >
                <md-icon class="menu-icon">change_history</md-icon>
                <span>Add attachment</span>
            </button>
            <button
                type="button"
                class="menu-item"
                @click="emit('delete-task')"
            >
                <md-icon class="menu-icon">delete</md-icon>
                <span>Delete</span>
            </button>
            <div class="menu-divider"></div>
            <button
                v-for="t in tabs"
                :key="t.label"
                type="button"
                class="menu-item"
                @click="emit('move-task', t.label)"
            >
                <md-icon class="menu-check">{{ todo.data.collectionName === t.label ? 'check' : '' }}</md-icon>
                <span>{{ t.label }}</span>
            </button>
            <button
                type="button"
                class="menu-item"
                @click="emit('new-list')"
            >
                <md-icon class="menu-icon">playlist_add</md-icon>
                <span>New list</span>
            </button>
        </div>
    </li>

    <!-- subtask composer -->
    <li
        v-if="isSubAdding"
        class="composer editing-composer is-sub-composer"
    >
        <TaskComposer
            :title="subTitle"
            :description="subDesc"
            :due="subDue"
            :is-check-small="true"
            :is-sub="true"
            autofocus="focus"
            @update:title="emit('update:sub-title', $event)"
            @update:description="emit('update:sub-desc', $event)"
            @update:due="emit('update:sub-due', $event)"
            @confirm="emit('confirm-sub-add')"
            @cancel="emit('cancel-edit')"
        />
    </li>

    <!-- subtasks via <template>: not a separate component -->
    <template
        v-for="(step, stepIdx) in steps"
        :key="`${todo.data.uuid}-step-${stepIdx}`"
    >
        <li
            v-if="editingStepIndex === stepIdx"
            class="composer editing-composer is-sub-composer"
        >
            <TaskComposer
                :title="editTitle"
                :description="editDesc"
                :is-check-small="true"
                :is-sub="true"
                autofocus="select"
                @update:title="emit('update:edit-title', $event)"
                @update:description="emit('update:edit-desc', $event)"
                @confirm="emit('confirm-edit')"
                @cancel="emit('cancel-edit')"
            />
        </li>
        <li
            v-else
            class="task-row is-sub"
        >
            <button
                type="button"
                class="circle-check small"
                aria-label="Mark subtask complete"
                @click="emit('complete-step', stepIdx)"
            >
                <md-ripple></md-ripple>
            </button>
            <div
                class="task-text"
                @click="emit('start-step-edit', stepIdx)"
            >
                <div class="task-title">{{ step.headline }}</div>
            </div>
            <span class="row-actions">
                <md-icon-button
                    class="row-menu-btn"
                    @click.stop="emit('step-menu', stepIdx)"
                    aria-label="Subtask options"
                >
                    <md-icon>more_vert</md-icon>
                </md-icon-button>
                <md-icon-button
                    class="task-star"
                    aria-label="Star subtask"
                    @click.stop="emit('star')"
                >
                    <md-icon>{{ todo.isPinned ? 'star' : 'star_outline' }}</md-icon>
                </md-icon-button>
            </span>

            <div
                v-if="openStepMenuIndex === stepIdx"
                class="pop-menu task-menu"
                @click.stop
            >
                <button
                    type="button"
                    class="menu-item"
                    @click="emit('menu-step-edit', stepIdx)"
                >
                    <md-icon class="menu-icon">schedule</md-icon>
                    <span>Add deadline</span>
                </button>
                <button
                    type="button"
                    class="menu-item"
                    @click="emit('step-unindent', stepIdx)"
                >
                    <md-icon class="menu-icon">format_indent_decrease</md-icon>
                    <span>Unindent</span>
                </button>
                <button
                    type="button"
                    class="menu-item"
                    @click="emit('attach')"
                >
                    <md-icon class="menu-icon">change_history</md-icon>
                    <span>Add attachment</span>
                </button>
                <button
                    type="button"
                    class="menu-item"
                    @click="emit('step-delete', stepIdx)"
                >
                    <md-icon class="menu-icon">delete</md-icon>
                    <span>Delete</span>
                </button>
                <div class="menu-divider"></div>
                <button
                    v-for="t in tabs"
                    :key="t.label"
                    type="button"
                    class="menu-item"
                    @click="emit('step-move', stepIdx, t.label)"
                >
                    <md-icon class="menu-check">{{ todo.data.collectionName === t.label ? 'check' : '' }}</md-icon>
                    <span>{{ t.label }}</span>
                </button>
                <button
                    type="button"
                    class="menu-item"
                    @click="emit('step-new-list', stepIdx)"
                >
                    <md-icon class="menu-icon">playlist_add</md-icon>
                    <span>New list</span>
                </button>
            </div>
        </li>
    </template>
</template>

<script setup lang="ts">
import type { ITodo } from '../../stores/todo-list';
import type { ITodoTab } from '../../stores/todo-tabs';
import TaskComposer from './task-composer.vue';

// Pure component: no Pinia, no router. Subtasks stay as inline
// <template v-for> here instead of a separate subtask component.
defineProps<{
    todo: ITodo
    steps: Array<{ headline: string, isCompleted: boolean }>
    tabs: Array<ITodoTab>
    isTaskMenuOpen: boolean
    openStepMenuIndex: number | null
    dropPos: 'before' | 'after' | null
    isEditingTask: boolean
    editTitle: string
    editDesc: string
    editDue: string
    isSubAdding: boolean
    subTitle: string
    subDesc: string
    subDue: string
    editingStepIndex: number | null
}>()

const emit = defineEmits<{
    (e: 'complete'): void
    (e: 'star'): void
    (e: 'menu'): void
    (e: 'menu-edit'): void
    (e: 'start-edit'): void
    (e: 'update:edit-title', v: string): void
    (e: 'update:edit-desc', v: string): void
    (e: 'update:edit-due', v: string): void
    (e: 'confirm-edit'): void
    (e: 'cancel-edit'): void
    (e: 'start-sub-add'): void
    (e: 'update:sub-title', v: string): void
    (e: 'update:sub-desc', v: string): void
    (e: 'update:sub-due', v: string): void
    (e: 'confirm-sub-add'): void
    (e: 'complete-step', index: number): void
    (e: 'start-step-edit', index: number): void
    (e: 'step-menu', index: number): void
    (e: 'menu-step-edit', index: number): void
    (e: 'step-unindent', index: number): void
    (e: 'step-delete', index: number): void
    (e: 'step-move', index: number, listName: string): void
    (e: 'step-new-list', index: number): void
    (e: 'move-task', listName: string): void
    (e: 'new-list'): void
    (e: 'delete-task'): void
    (e: 'attach'): void
    (e: 'dragstart', ev: DragEvent): void
    (e: 'dragend'): void
    (e: 'dragover', ev: DragEvent): void
    (e: 'dragleave'): void
    (e: 'drop', ev: DragEvent): void
}>()
</script>

<style scoped>
@reference "../../styles/tailwind.css";

/* ---- task rows ---- */
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

.task-row:hover .row-menu-btn,
.task-row:hover .task-star {
    opacity: 1;
}

.task-row.drop-before::before,
.task-row.drop-after::after {
    content: '';
    position: absolute;
    left: 8px;
    right: 8px;
    height: 2px;
    border-radius: 2px;
    background: var(--md-sys-color-secondary);
    z-index: 5;
}

.task-row.drop-before::before {
    top: -1px;
}

.task-row.drop-after::after {
    bottom: -1px;
}

.circle-check {
    position: relative;
    width: 20px;
    height: 20px;
    margin: 2px 0 0 12px;
    border-radius: 999px;
    border: 2px solid var(--md-sys-color-on-surface-variant);
    background: transparent;
    cursor: pointer;
    overflow: hidden;
    padding: 0;
}

.circle-check:hover {
    border-color: var(--md-sys-color-on-surface);
    background-color: color-mix(in srgb, var(--md-sys-color-on-surface) 8%, transparent);
}

.circle-check.small {
    width: 18px;
    height: 18px;
}

.task-text {
    min-width: 0;
    padding-top: 1px;
    cursor: text;
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

.task-due {
    font-size: 12px;
    line-height: 16px;
    margin-top: 2px;
    color: #0b57d0;
}

.row-actions {
    display: flex;
    align-items: center;
}

.row-menu-btn {
    opacity: 0;
    width: 32px;
    height: 32px;
    --md-icon-button-icon-size: 18px;
}

.task-star {
    opacity: 0;
    width: 32px;
    height: 32px;
    --md-icon-button-icon-size: 18px;
}

.task-star.starred {
    opacity: 1;
}

.task-star.starred md-icon {
    font-variation-settings: 'FILL' 1;
    color: #0b57d0;
}

.task-row.is-sub {
    margin-left: 20px;
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

.menu-icon {
    --md-icon-size: 20px;
    flex: none;
    @apply text-on-surface-variant;
}

.menu-check {
    --md-icon-size: 20px;
    flex: none;
    width: 20px;
    color: #0b57d0;
}

.menu-divider {
    height: 1px;
    margin: 8px 0;
    background-color: var(--md-sys-color-outline-variant);
}

.composer {
    margin: 4px 0;
    padding: 8px 12px 10px 0;
    border-radius: 8px;
}

.is-sub-composer {
    margin-left: 24px;
}

.editing-composer:focus-within {
    background-color: color-mix(in srgb, #0b57d0 9%, transparent);
}
</style>
