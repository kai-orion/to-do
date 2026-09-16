<template>
    <Product>

        <md-tabs
            class="tabs"
            ref="tabsRef"
        >
            <template v-for="tab of tabs">
                <md-primary-tab :data-collection-name="tab.label">{{ tab.label }}</md-primary-tab>
            </template>

            <CreateCollectionTab></CreateCollectionTab>
        </md-tabs>

        <div class="tab-panel">
            <template v-if="currentCollectionTodos.length !== 0">
                <md-list class="todo-list">
                    <md-list-item
                        class="todo-list-item"
                        v-for="todo in currentCollectionTodos"
                        :class="[todo.isCompleted && 'completed', todo.isPinned && 'pinned']"
                        :key="todo.data.creationTimestamp"
                    >
                        <md-checkbox
                            slot="start"
                            @click="() => setCompleteField(todo)"
                            :checked="todo.isCompleted"
                        ></md-checkbox>
                        <span
                            slot="headline"
                            class="headline"
                        >{{ todo.data.headline }}</span>
                        <span
                            slot="supporting-text"
                            class="description"
                        >{{ todo.data.description }}</span>
                        <md-icon-button
                            slot="end"
                            @click="() => removeTodoItem(todo)"
                        >
                            <md-icon>delete</md-icon>
                        </md-icon-button>
                        <md-icon-button
                            slot="end"
                            @click="() => setPinField(todo, !todo.isPinned)"
                        >
                            <md-icon class="pin-icon">keep</md-icon>
                        </md-icon-button>
                    </md-list-item>
                </md-list>
            </template>
            <template v-else-if="currentCollectionName !== 'All'">
                <div class="empty-alert">
                    <md-icon>done_all</md-icon>
                    <span class="title">All done.</span>

                    <md-text-button @click="removeCurrentTab">
                        Remove This Collection
                        <md-icon slot="icon">delete_forever</md-icon>
                    </md-text-button>
                </div>
            </template>
        </div>


        <span class="create-todo-fab">
            <CreateTodoFab></CreateTodoFab>
        </span>
    </Product>
</template>

<script setup lang="ts">
import type { MdPrimaryTab, MdTabs } from '@material/web/all'
import { computed, onMounted, ref } from 'vue'
import CreateCollectionTab from '../components/create-collection/CreateCollectionTab.vue'
import CreateTodoFab from '../components/create-todo/CreateTodoFab.vue'
import Product from '../layouts/Product.vue'
import { useTodoListStore, type ITodo } from '../stores/todo-list'
import { useTodoTabsStore } from '../stores/todo-tabs'

const todoTabs = useTodoTabsStore()
const todoList = useTodoListStore()

const setCompleteField = (todo: ITodo) => {
    todoList.completeField(todo, !todo.isCompleted)
}
const setPinField = (todo: ITodo, isPinned: boolean) => {
    todoList.pinField(todo, isPinned)
}
const removeTodoItem = (todo: ITodo) => {
    todoList.remove(todo)
}
const removeCurrentTab = () => {
    const index = todoTabs.tabs.findIndex(e => e.label === currentCollectionName.value)
    todoTabs.remove({ label: currentCollectionName.value })
    currentCollectionName.value = index - 1 !== -1 && todoTabs.tabs.length >= 2 ? todoTabs.tabs[index - 1].label : todoTabs.tabs[0].label
}

const currentCollectionName = ref<string>('All')
const allTodos = computed(() => todoList.todos)
const currentCollectionTodos = computed(() =>
    allTodos.value
        .filter(e => e.data.collectionName === currentCollectionName.value)
        .sort((a, b) => a.data.creationTimestamp - b.data.creationTimestamp)
        .sort((a, _) => a.isPinned ? 1 : -1)
        .sort((a, _) => a.isCompleted ? 1 : -1)
)

const tabs = computed(() => todoTabs.tabs)
const tabsRef = ref<MdTabs | null>(null)

onMounted(() => {
    tabsRef.value?.addEventListener('click', (event: Event) => {
        if ((event.target as MdPrimaryTab).getAttribute('is-tab')) {
            event.preventDefault()
        } else {
            currentCollectionName.value = (event.target as MdPrimaryTab).getAttribute('data-collection-name')!
        }
    })
})
</script>

<style scoped>
@reference "../styles/tailwind.css";
.todo-list {
    padding-left: 8px;
    padding-right: 8px;

    gap: 4px;

    .todo-list-item {
        --md-checkbox-container-shape: 12px;
        --md-checkbox-container-size: 22px;
        --md-checkbox-icon-size: 22px;

        border-radius: 16px;

        &.completed>:is(.headline, .description) {
            text-decoration: line-through;
        }

        &.pinned {
            & md-icon.pin-icon {
                font-variation-settings: 'FILL' 1;
                animation-name: icon-fill;
                animation-duration: 200ms;
            }
        }

        &.pinned {
            background-color: var(--md-sys-color-primary-container);
            --md-list-item-label-text-color: var(--md-sys-color-on-primary-container);

            --md-focus-ring-color: var(--md-sys-color-on-primary-container);

            --md-checkbox-outline-color: var(--md-sys-color-on-primary-container);
            --md-checkbox-hover-outline-color: var(--md-sys-color-on-primary-container);
            --md-checkbox-pressed-outline-color: var(--md-sys-color-on-primary-container);
            --md-checkbox-focus-outline-color: var(--md-sys-color-on-primary-container);
            --md-checkbox-selected-container-color: var(--md-sys-color-on-primary-container);
            --md-checkbox-selected-icon-color: var(--md-sys-color-primary-container);
            --md-checkbox-hover-state-layer-color: var(--md-sys-color-on-primary-container);
            --md-checkbox-pressed-state-layer-color: var(--md-sys-color-on-primary-container);

            --md-icon-button-hover-state-layer-color: var(--md-sys-color-on-primary-container);
            --md-icon-button-pressed-state-layer-color: var(--md-sys-color-on-primary-container);
            --md-icon-button-icon-color: var(--md-sys-color-on-primary-container);
            --md-icon-button-focus-icon-color: var(--md-sys-color-on-primary-container);
            --md-icon-button-hover-icon-color: var(--md-sys-color-on-primary-container);
            --md-icon-button-pressed-icon-color: var(--md-sys-color-on-primary-container);
        }

        &.pinned.complete {
            background-color: var(--md-sys-color-surface-container);
        }

        &:hover {
            position: relative;

            &::after {
                content: '';
                border-radius: inherit;
                position: absolute;
                inset: 0;
                opacity: 0.08;
                background-color: var(--md-sys-color-primary);
                pointer-events: none;
            }
        }
    }
}

@keyframes icon-fill {
    from {
        font-variation-settings: 'FILL' 0;
    }

    to {
        font-variation-settings: 'FILL' 1;
    }
}

.tabs {
    position: sticky;
    top: 0px;
    z-index: 1;

    @media (max-width: 600px) {
        --md-primary-tab-container-color: var(--md-sys-color-surface-container);
    }
}

.tab-panel {
    overflow: auto;
}

.create-todo-fab {
    z-index: 0;
    position: absolute;
    right: 28px;
    bottom: 28px;
}

.empty-alert {
    display: flex;
    flex-direction: column;

    align-items: center;
    justify-content: center;

    margin-top: 64px;

    &>md-icon {
        --md-icon-size: 128px;
        @apply text-primary;
    }

    &>.title {
        @apply text-on-surface text-title-medium text-center;
    }
}
</style>
