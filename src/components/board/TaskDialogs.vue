<template>
    <Teleport to="body">
        <md-dialog
            ref="createListDialogRef"
            class="create-list-dialog"
        >
            <span slot="headline">Create new list</span>
            <form
                slot="content"
                method="dialog"
                id="create-list-dialog-form"
            >
                <md-filled-text-field
                    label="Enter name"
                    type="text"
                    name="list-name"
                ></md-filled-text-field>
            </form>
            <div slot="actions">
                <md-text-button
                    form="create-list-dialog-form"
                    value="cancel"
                >Cancel</md-text-button>
                <md-text-button
                    form="create-list-dialog-form"
                    value="commit"
                    :disabled="isCreateListDoneDisabled"
                >Done</md-text-button>
            </div>
        </md-dialog>

        <md-dialog
            ref="createTaskDialogRef"
            class="create-task-dialog"
        >
            <form
                id="create-task-dialog-form"
                slot="content"
                method="dialog"
            >
                <div class="ct-top">
                    <span></span>
                    <md-icon-button
                        @click="emit('close-create-task')"
                        aria-label="Close"
                    >
                        <Icon name="close" />
                    </md-icon-button>
                </div>
                <md-filled-text-field
                    class="ct-title"
                    label="Add title"
                    type="text"
                    name="task-title"
                ></md-filled-text-field>
                <div class="ct-row">
                    <Icon class="ct-icon" name="schedule" />
                    <button
                        type="button"
                        class="chip chip-toggle"
                        :class="[ctDateLabel && 'chip-active']"
                        @click="() => dateInput?.showPicker?.()"
                    >{{ ctDateLabel || 'Date' }}</button>
                    <input
                        :ref="(el) => { dateInput = el as HTMLInputElement | null }"
                        type="date"
                        class="hidden-input"
                        tabindex="-1"
                        @change="(e) => emit('update:ct-date', (e.target as HTMLInputElement).value)"
                    />
                    <button
                        type="button"
                        class="chip chip-toggle"
                        :class="[ctTime && 'chip-active']"
                        @click="() => timeInput?.showPicker?.()"
                    >{{ ctTime || 'Time' }}</button>
                    <input
                        :ref="(el) => { timeInput = el as HTMLInputElement | null }"
                        type="time"
                        class="hidden-input"
                        tabindex="-1"
                        @change="(e) => emit('update:ct-time', (e.target as HTMLInputElement).value)"
                    />
                </div>
                <label class="ct-check-row">
                    <md-checkbox
                        :checked="isAllDay"
                        @click.prevent="emit('update:is-all-day', !isAllDay)"
                    ></md-checkbox>
                    <span>All day</span>
                </label>
                <div class="ct-row">
                    <span class="ct-icon-spacer"></span>
                    <select
                        :value="ctRepeat"
                        class="ct-select"
                        aria-label="Repeat"
                        @change="(e) => emit('update:ct-repeat', (e.target as HTMLSelectElement).value)"
                    >
                        <option>Does not repeat</option>
                        <option>Daily</option>
                        <option>Weekly</option>
                        <option>Monthly</option>
                        <option>Yearly</option>
                    </select>
                </div>
                <div class="ct-row">
                    <Icon class="ct-icon" name="notes" />
                    <md-filled-text-field
                        class="ct-desc"
                        label="Add description"
                        type="textarea"
                        name="task-desc"
                    ></md-filled-text-field>
                </div>
                <div class="ct-row">
                    <Icon class="ct-icon" name="grid_view" />
                    <select
                        :value="ctList"
                        class="ct-select"
                        aria-label="List"
                        @change="(e) => emit('update:ct-list', (e.target as HTMLSelectElement).value)"
                    >
                        <option
                            v-for="t in tabs"
                            :key="t.label"
                            :value="t.label"
                        >{{ t.label }}</option>
                    </select>
                </div>
            </form>
            <div slot="actions">
                <md-filled-tonal-button
                    :disabled="isSaveDisabled"
                    @click="emit('confirm-create-task')"
                >Save</md-filled-tonal-button>
            </div>
        </md-dialog>
    </Teleport>
</template>

<script setup lang="ts">
import Icon from '@components/Icon.vue'
import type { MdDialog } from '@material/web/all';
import { onMounted, ref } from 'vue';
import type { ITodoTab } from '@stores/todo-tabs';

// Pure component: no Pinia, no router. Dialog field values flow out via
// emits; show/close is exposed so the top-level Layout (index.vue) —
// which owns all stores — drives the dialogs.
const props = defineProps<{
    tabs: Array<ITodoTab>
    isCreateListDoneDisabled: boolean
    ctDateLabel: string
    ctTime: string
    isAllDay: boolean
    ctRepeat: string
    ctList: string
    isSaveDisabled: boolean
}>()

const emit = defineEmits<{
    (e: 'list-name-input', v: string): void
    (e: 'task-title-input', v: string): void
    (e: 'create-list-close', returnValue: string, name: string): void
    (e: 'update:ct-date', v: string): void
    (e: 'update:ct-time', v: string): void
    (e: 'update:is-all-day', v: boolean): void
    (e: 'update:ct-repeat', v: string): void
    (e: 'update:ct-list', v: string): void
    (e: 'close-create-task'): void
    (e: 'confirm-create-task'): void
}>()

const createListDialogRef = ref<MdDialog | null>(null)
const createTaskDialogRef = ref<MdDialog | null>(null)
const dateInput = ref<HTMLInputElement | null>(null)
const timeInput = ref<HTMLInputElement | null>(null)

function showCreateList() {
    const field = createListDialogRef.value?.querySelector('[name="list-name"]') as unknown as { value?: string } | null
    if (field) field.value = ''
    createListDialogRef.value?.show()
}

function showCreateTask() {
    createTaskDialogRef.value?.show()
    requestAnimationFrame(() => {
        const title = createTaskDialogRef.value?.querySelector('[name="task-title"]') as unknown as { focus?: () => void } | null
        title?.focus?.()
    })
}

function closeCreateTask(value = 'cancel') {
    createTaskDialogRef.value?.close(value)
}

function findOneFieldValueByName(name: string): string {
    const scope = name === 'task-title' || name === 'task-desc' ? createTaskDialogRef.value : createListDialogRef.value
    const el = scope?.querySelector(`[name="${name}"]`) as unknown as { value?: string } | null
    return el?.value ?? ''
}

defineExpose({ showCreateList, showCreateTask, closeCreateTask, findOneFieldValueByName })

onMounted(() => {
    createListDialogRef.value?.querySelector('[name="list-name"]')?.addEventListener('input', (e: Event) => {
        emit('list-name-input', ((e.target as unknown as { value?: string }).value ?? ''))
    })
    createTaskDialogRef.value?.querySelector('[name="task-title"]')?.addEventListener('input', (e: Event) => {
        emit('task-title-input', ((e.target as unknown as { value?: string }).value ?? ''))
    })
    createListDialogRef.value?.addEventListener('close', () => {
        emit('create-list-close', createListDialogRef.value?.returnValue ?? '', findOneFieldValueByName('list-name').trim())
    })
    void props
})
</script>

<style scoped>
@reference "@styles/tailwind.css";

/* ---- dialogs ---- */
.create-list-dialog {
    --md-dialog-container-shape: 28px;
}

.create-task-dialog {
    --md-dialog-container-shape: 28px;
    --md-dialog-container-min-width: min(560px, calc(100vw - 32px));
}

#create-list-dialog-form {
    display: flex;
    min-width: min(420px, 70vw);
}

#create-task-dialog-form {
    display: flex;
    flex-direction: column;
    gap: 12px;
    min-width: min(480px, calc(100vw - 96px));
}

.ct-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 24px;
    margin-bottom: -8px;
}

.ct-title {
    width: 100%;
}

.ct-row {
    display: flex;
    align-items: center;
    gap: 12px;
}

.ct-icon {
    --md-icon-size: 20px;
    flex: none;
    @apply text-on-surface-variant;
}

.ct-icon-spacer {
    flex: none;
    width: 20px;
}

.chip {
    border: 1px solid var(--md-sys-color-outline);
    border-radius: 999px;
    padding: 6px 14px;
    font-size: 13px;
    line-height: 18px;
    cursor: pointer;
    background: transparent;
    color: inherit;
    white-space: nowrap;
}

.chip-toggle {
    border-color: transparent;
}

.chip-active {
    background-color: var(--md-sys-color-secondary-container);
    color: var(--md-sys-color-on-secondary-container);
    font-weight: 500;
}

.ct-check-row {
    display: flex;
    align-items: center;
    gap: 8px;
    padding-left: 32px;
    font-size: 14px;
    cursor: pointer;
}

.ct-select {
    border: none;
    border-radius: 8px;
    padding: 10px 12px;
    font-size: 14px;
    cursor: pointer;
    color: inherit;
}

.ct-desc {
    flex: 1 1 auto;
}

.hidden-input {
    position: absolute;
    width: 1px;
    height: 1px;
    opacity: 0;
    pointer-events: none;
}
</style>
