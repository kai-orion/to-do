<template>
    <ProductLayout>
        <template #header="{ showBottomBorder }">
            <TasksHeader
                :border-bottom="showBottomBorder"
                @menu-click="() => navigation.updateOpen(!navigation.isOpen)"
            >
                <template #end>
                    <md-icon-button @click="() => handleLightDarkIconButtonSwitch((isDark) => !isDark)">
                        <Icon v-if="isLightModeIconShown" name="light_mode" />
                        <Icon v-else name="dark_mode" />
                    </md-icon-button>
                </template>
            </TasksHeader>
        </template>

        <template #navigation-drawer>
            <TaskSidebarLayout
                :tabs="tabs"
                :visible="visibleLists"
                :active-view="activeView"
                :is-lists-collapsed="isListsCollapsed"
                @select-all="activeView = 'all'"
                @select-starred="activeView = 'starred'"
                @toggle-list="toggleListVisible"
                @toggle-lists-collapsed="isListsCollapsed = !isListsCollapsed"
                @create-list="() => boardRef?.openCreateList()"
                @create-task="() => handleCreateTask()"
            />
        </template>

        <TaskBoardLayout
            ref="boardRef"
            :active-view="activeView"
            :visible="visibleLists"
            @ensure-visible="ensureVisible"
            @visible-rename="handleVisibleRename"
            @visible-delete="handleVisibleDelete"
        />
    </ProductLayout>
</template>

<script setup lang="ts">
import TasksHeader from '@components/board/TasksHeader.vue'
import Icon from '@components/Icon.vue'
import TaskSidebarLayout from '@components/task-sidebar/TaskSidebarLayout.vue'
import ProductLayout from '@layouts/ProductLayout.vue'
import TaskBoardLayout from '@layouts/TaskBoardLayout.vue'
import { useMaterialThemeStore } from '@stores/material-theme'
import { useMediaQueryStore } from '@stores/media-query'
import { useNavigationStore } from '@stores/navigation'
import { useTodoTabsStore } from '@stores/todo-tabs'
import { computed, onMounted, reactive, ref } from 'vue'

// Page orchestrator: owns shared filter state (single source for the
// sidebar + board Layouts) plus header/theme/chrome. Board-local state
// (sort/menus/composers/drag/dialogs) lives in TaskBoardLayout;
// drawer chrome lives in TaskSidebarLayout. No leaf store access here
// beyond composing the shared filters.
const todoTabs = useTodoTabsStore()
const mediaQuery = useMediaQueryStore()
const navigation = useNavigationStore()
const theme = useMaterialThemeStore()

const tabs = computed(() => todoTabs.tabs)
const activeView = ref<'all' | 'starred'>('all')
const isListsCollapsed = ref(false)
const visibleLists = reactive<Record<string, boolean>>({})
for (const t of todoTabs.tabs) {
    if (visibleLists[t.label] === undefined) visibleLists[t.label] = true
}

const boardRef = ref<{ openCreateList: () => void, openCreateDialog: () => void, intersection: { isVisible: { value: boolean } } } | null>(null)

const isLightModeIconShown = computed(() => theme.isDark)
function handleLightDarkIconButtonSwitch(isDarkValueOrToggle: boolean | ((isDark: boolean) => boolean)) {
    if (typeof isDarkValueOrToggle === 'boolean') theme.updateIsDark(isDarkValueOrToggle)
    else theme.updateIsDark(isDarkValueOrToggle(theme.isDark))
}

const isModal = computed(() => mediaQuery.currentBreakpoint === 'compact')

function ensureVisible(label: string) {
    if (visibleLists[label] === undefined) visibleLists[label] = true
}

function toggleListVisible(label: string) {
    visibleLists[label] = visibleLists[label] === false ? true : false
}

function handleVisibleRename(oldName: string, newName: string) {
    if (visibleLists[oldName] !== undefined) {
        visibleLists[newName] = visibleLists[oldName]!
        delete visibleLists[oldName]
    }
}

function handleVisibleDelete(label: string) {
    delete visibleLists[label]
}

function handleCreateTask() {
    if (isModal.value) navigation.updateOpen(false)
    boardRef.value?.openCreateDialog()
}

onMounted(() => {
    if (isModal.value) navigation.updateOpen(false)
    else navigation.updateOpen(true)
})
</script>
