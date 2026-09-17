<template>

    <TaskSidebar
        :modal="isModal"
        :open="navigation.isOpen"
        @scrim-click="() => navigation.updateOpen(false)"
    >
        <template #fab>
            <NewTaskFab @click="() => emit('create-task')"></NewTaskFab>
        </template>

        <template #tabs>
            <Tab
                :active="props.activeView === 'all'"
                @click="() => emit('select-all')"
                label="All Tasks"
            >
                <Icon class="view-icon" name="task_alt" />
            </Tab>
            <Tab
                :active="props.activeView === 'starred'"
                @click="() => emit('select-starred')"
                label="Starred"
            >
                <Icon class="view-icon" name="star" />
            </Tab>
        </template>

        <template #lists>
            <Lists
                :tabs="tabs"
                :is-lists-collapsed="isListsCollapsed"
                :visible="visible"
                :counts="counts"
                @toggle-list="(label) => emit('toggle-list', label)"
                @toggle-lists-collapsed="() => emit('toggle-lists-collapsed')"
            ></Lists>
            <NewListButton @click="() => emit('create-list')"></NewListButton>
        </template>

        <template #end>
            <LinkToSettingPageButton
                @click="() => { settingDialog.toggle(true); if (mediaQuery.currentBreakpoint === 'compact') { navigation.updateOpen(false) } }"
            >
            </LinkToSettingPageButton>
        </template>
    </TaskSidebar>

    <SettingDialogLayout></SettingDialogLayout>

</template>

<script setup lang="ts">
import Icon from '@components/Icon.vue'
import Lists from '@/components/task-sidebar/Lists.vue'
import NewListButton from '@/components/task-sidebar/NewListButton.vue'
import NewTaskFab from '@/components/task-sidebar/NewTaskFab.vue'
import Tab from '@/components/task-sidebar/Tab.vue'
import { useSettingDialog } from '@/stores/setting-dialog.js'
import TaskSidebar from '@components/task-sidebar/TaskSidebar.vue'
import { useMediaQueryStore } from '@stores/media-query'
import { useNavigationStore } from '@stores/navigation'
import { useTodoListStore } from '@stores/todo-list'
import type { ITodoTab } from '@stores/todo-tabs'
import { computed } from 'vue'
import LinkToSettingPageButton from './LinkToSettingPageButton.vue'
import SettingDialogLayout from './SettingDialogLayout.vue'

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

const settingDialog = useSettingDialog()
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
</style>
