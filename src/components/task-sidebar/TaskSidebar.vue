<template>
    <aside class="task-sidebar">
        <div class="create-wrap">
            <button
                class="create-btn"
                type="button"
                @click="emit('create-task')"
            >
                <md-icon class="create-icon">add</md-icon>
                <span class="create-label">Create</span>
                <md-ripple></md-ripple>
            </button>
        </div>

        <nav class="views">
            <button
                type="button"
                class="view-row"
                :class="[props.activeView === 'all' && 'selected']"
                @click="emit('select-all')"
            >
                <md-icon class="view-icon">task_alt</md-icon>
                <span class="view-label">All tasks</span>
                <md-ripple></md-ripple>
            </button>
            <button
                type="button"
                class="view-row"
                :class="[props.activeView === 'starred' && 'selected']"
                @click="emit('select-starred')"
            >
                <md-icon class="view-icon">star</md-icon>
                <span class="view-label">Starred</span>
                <md-ripple></md-ripple>
            </button>
        </nav>

        <div class="lists-section">
            <button
                type="button"
                class="lists-header"
                @click="emit('toggle-lists-collapsed')"
            >
                <span class="lists-title">Lists</span>
                <md-icon class="lists-arrow">{{ props.listsCollapsed ? 'keyboard_arrow_right' : 'keyboard_arrow_up' }}</md-icon>
            </button>

            <div
                v-if="!props.listsCollapsed"
                class="lists-rows"
            >
                <label
                    v-for="tab in props.tabs"
                    :key="tab.label"
                    class="list-row"
                >
                    <md-checkbox
                        class="list-check"
                        :checked="props.visible[tab.label] !== false"
                        @click.prevent="emit('toggle-list', tab.label)"
                    ></md-checkbox>
                    <span class="list-label">{{ tab.label }}</span>
                    <span class="list-count">{{ props.counts[tab.label] ?? 0 }}</span>
                </label>

                <button
                    type="button"
                    class="new-list-row"
                    @click="emit('create-list')"
                >
                    <md-icon class="new-list-icon">add</md-icon>
                    <span class="new-list-label">Create new list</span>
                    <md-ripple></md-ripple>
                </button>
            </div>
        </div>
    </aside>
</template>

<script setup lang="ts">
import type { ITodoTab } from '../../stores/todo-tabs'

const props = defineProps<{
    tabs: Array<ITodoTab>
    counts: Record<string, number>
    visible: Record<string, boolean>
    activeView: 'all' | 'starred'
    listsCollapsed: boolean
}>()

const emit = defineEmits<{
    (e: 'select-all'): void
    (e: 'select-starred'): void
    (e: 'toggle-list', label: string): void
    (e: 'toggle-lists-collapsed'): void
    (e: 'create-list'): void
    (e: 'create-task'): void
}>()
</script>

<style scoped>
@reference "../../styles/tailwind.css";

.task-sidebar {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    padding: 8px 12px 16px 8px;
    gap: 0;
    @apply bg-surface-container text-on-surface;
}

.create-wrap {
    padding: 8px 8px 20px 8px;
}

.create-btn {
    position: relative;
    display: flex;
    align-items: center;
    gap: 12px;
    height: 56px;
    min-width: 110px;
    padding: 0 20px 0 16px;
    border-radius: 16px;
    overflow: hidden;
    cursor: pointer;
    @apply bg-surface text-on-surface;
    box-shadow:
        0 1px 2px rgb(0 0 0 / 0.24),
        0 1px 3px 1px rgb(0 0 0 / 0.12);
}

.create-btn:hover {
    box-shadow:
        0 2px 6px 2px rgb(0 0 0 / 0.14),
        0 1px 2px rgb(0 0 0 / 0.24);
}

.create-icon {
    --md-icon-size: 24px;
}

.create-label {
    font-size: 14px;
    font-weight: 500;
    letter-spacing: 0.1px;
}

.views {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 0 0 12px 0;
}

.view-row {
    position: relative;
    display: flex;
    align-items: center;
    gap: 16px;
    height: 40px;
    width: 100%;
    padding: 0 16px;
    border-radius: 999px;
    overflow: hidden;
    cursor: pointer;
    @apply text-on-surface;
}

.view-row.selected {
    @apply bg-secondary-container text-on-secondary-container;
    font-weight: 500;
}

.view-row:not(.selected):hover {
    background-color: color-mix(in srgb, var(--md-sys-color-on-surface) 8%, transparent);
}

.view-icon {
    --md-icon-size: 20px;
    font-variation-settings: 'FILL' 0;
}

.view-row.selected .view-icon {
    font-variation-settings: 'FILL' 1;
}

.view-label {
    font-size: 14px;
    line-height: 20px;
    letter-spacing: 0.25px;
}

.lists-section {
    display: flex;
    flex-direction: column;
}

.lists-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 40px;
    padding: 0 8px 0 16px;
    cursor: pointer;
    border-radius: 8px;
}

.lists-title {
    font-size: 14px;
    font-weight: 500;
}

.lists-arrow {
    --md-icon-size: 20px;
    @apply text-on-surface-variant;
}

.lists-rows {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.list-row {
    display: grid;
    grid-template-columns: 40px 1fr auto;
    align-items: center;
    height: 40px;
    padding-right: 12px;
    border-radius: 8px;
    cursor: pointer;
}

.list-row:hover {
    background-color: color-mix(in srgb, var(--md-sys-color-on-surface) 8%, transparent);
}

.list-check {
    --md-checkbox-container-size: 18px;
    --md-checkbox-icon-size: 18px;
    --md-checkbox-selected-container-color: var(--md-sys-color-on-surface);
    --md-checkbox-selected-icon-color: var(--md-sys-color-surface);
    --md-checkbox-selected-hover-container-color: var(--md-sys-color-on-surface);
    --md-checkbox-selected-pressed-container-color: var(--md-sys-color-on-surface);
    --md-checkbox-selected-focus-container-color: var(--md-sys-color-on-surface);
    justify-self: center;
    pointer-events: none;
}

.list-label {
    font-size: 14px;
    line-height: 20px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.list-count {
    font-size: 12px;
    min-width: 20px;
    text-align: right;
    @apply text-on-surface-variant;
}

.new-list-row {
    position: relative;
    display: flex;
    align-items: center;
    gap: 16px;
    height: 40px;
    padding: 0 16px;
    border-radius: 999px;
    overflow: hidden;
    cursor: pointer;
}

.new-list-row:hover {
    background-color: color-mix(in srgb, var(--md-sys-color-on-surface) 8%, transparent);
}

.new-list-icon {
    --md-icon-size: 20px;
}

.new-list-label {
    font-size: 14px;
}
</style>
