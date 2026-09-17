<template>
    <div
        class="tasks-drawer"
        :class="{ 'is-modal': isModal, 'is-open': navigation.isOpen }"
    >
        <TaskSidebar
            :tabs="tabs"
            :counts="counts"
            :visible="visible"
            :active-view="activeView"
            :is-lists-collapsed="isListsCollapsed"
            @select-all="emit('select-all')"
            @select-starred="emit('select-starred')"
            @toggle-list="(label) => emit('toggle-list', label)"
            @toggle-lists-collapsed="emit('toggle-lists-collapsed')"
            @create-list="emit('create-list')"
            @create-task="emit('create-task')"
        />
    </div>
    <span
        v-if="isModal"
        class="tasks-scrim"
        :class="[navigation.isOpen && 'is-open']"
        @click="() => navigation.updateOpen(false)"
    ></span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ITodoTab } from '@stores/todo-tabs'
import TaskSidebar from '@components/task-sidebar/TaskSidebar.vue'
import { useMediaQueryStore } from '@stores/media-query'
import { useNavigationStore } from '@stores/navigation'
import { useTodoListStore } from '@stores/todo-list'

// Layout: owns drawer chrome (modal vs docked) + sidebar counts via stores.
// Filter state (tabs/visible/activeView/collapsed) arrives via props so the
// page stays the single source for shared filters; intents leave via emits.
const props = defineProps<{
    tabs: Array<ITodoTab>
    visible: Record<string, boolean>
    activeView: 'all' | 'starred'
    isListsCollapsed: boolean
}>()

const emit = defineEmits<{
    (e: 'select-all'): void
    (e: 'select-starred'): void
    (e: 'toggle-list', label: string): void
    (e: 'toggle-lists-collapsed'): void
    (e: 'create-list'): void
    (e: 'create-task'): void
}>()

const mediaQuery = useMediaQueryStore()
const navigation = useNavigationStore()
const todoList = useTodoListStore()

const isModal = computed(() => mediaQuery.currentBreakpoint === 'compact')

const counts = computed(() => {
    const out: Record<string, number> = {}
    for (const t of props.tabs) {
        let n = 0
        for (const todo of todoList.todos) {
            if (todo.isCompleted) continue
            if (props.activeView === 'starred' && !todo.isPinned) continue
            if (todo.data.collectionName !== t.label) continue
            n += 1
            n += todoList.findManyStepsByParent(todo).filter(s => !s.isCompleted).length
        }
        out[t.label] = n
    }
    return out
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
</style>
