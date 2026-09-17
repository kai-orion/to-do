<template>
    <div class="lists-section">
        <button
            type="button"
            class="lists-header"
            @click="emits('toggle-lists-collapsed')"
        >
            <span class="lists-title">Lists</span>
            <md-icon class="lists-arrow-icon">
                {{ props.isListsCollapsed ? 'keyboard_arrow_right' : 'keyboard_arrow_down' }}
            </md-icon>
        </button>

        <div
            v-if="!props.isListsCollapsed"
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
                    @click.prevent="emits('toggle-list', tab.label)"
                ></md-checkbox>
                <span class="list-label">{{ tab.label }}</span>
                <span class="list-count">{{ props.counts[tab.label] ?? 0 }}</span>

                <md-ripple></md-ripple>
            </label>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { ITodoTab } from '@/stores/todo-tabs';

const props = withDefaults(defineProps<{
    tabs: Array<ITodoTab>
    visible: Record<string, boolean>
    isListsCollapsed: boolean
    counts: Record<string, number>
}>(), {

})

const emits = defineEmits<{
    (e: 'toggle-lists-collapsed'): void
    (e: 'toggle-list', label: string): void
}>()
</script>

<style scoped>
@reference "@styles/tailwind.css";

.lists-section {
    display: flex;
    flex-direction: column;
}

.lists-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 40px;
    padding: 0 8px 0 16px;
    cursor: pointer;
    border-radius: 8px;
}

.lists-title {
    font-size: 14px;
    font-weight: 500;
}

.lists-arrow-icon {
    --md-icon-size: 20px;
    @apply text-on-surface-variant;
}

.lists-rows {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.list-row {
    position: relative;
    display: grid;
    grid-template-columns: 40px 1fr auto;
    align-items: center;
    height: 40px;
    padding-right: 12px;
    border-radius: 8px;
    cursor: pointer;

    --md-ripple-pressed-color: transparent;
}

.list-check {
    --md-checkbox-container-size: 14px;
    --md-checkbox-icon-size: 14px;
    --md-checkbox-selected-container-color: var(--md-sys-color-on-surface);
    --md-checkbox-selected-icon-color: var(--md-sys-color-surface);
    --md-checkbox-selected-hover-container-color: var(--md-sys-color-on-surface);
    --md-checkbox-selected-pressed-container-color: var(--md-sys-color-on-surface);
    --md-checkbox-selected-focus-container-color: var(--md-sys-color-on-surface);
    --md-checkbox-state-layer-size: 32px;
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
</style>
