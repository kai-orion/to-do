<template>
    <div
        class="composer"
        :class="[(isSub || checkSmall) && 'is-sub-composer', showRenameActions && 'editing-composer', showDragHint && 'editing-composer']"
    >
        <div class="composer-row">
            <span
                v-if="showCheck"
                class="composer-check"
                :class="[checkSmall && 'small']"
            ></span>
            <input
                ref="titleInputRef"
                :value="title"
                class="composer-title"
                type="text"
                :placeholder="titlePlaceholder"
                @input="emit('update:title', ($event.target as HTMLInputElement).value)"
                @keydown.enter="() => confirmOnEnter && emit('confirm')"
                @keydown.esc="() => emit('cancel')"
            />
            <md-icon
                v-if="showDragHint"
                class="drag-hint"
            >swap_vert</md-icon>
        </div>
        <div
            v-if="description !== undefined"
            class="composer-row indented"
        >
            <md-icon class="composer-icon">notes</md-icon>
            <input
                :value="description"
                class="composer-details"
                type="text"
                placeholder="Details"
                @input="emit('update:description', ($event.target as HTMLInputElement).value)"
                @keydown.enter="() => confirmOnEnter && emit('confirm')"
                @keydown.esc="() => emit('cancel')"
            />
        </div>
        <div
            v-if="due !== undefined && !showRenameActions"
            class="composer-row indented"
        >
            <button
                type="button"
                class="chip"
                :class="[due === 'Today' && 'chip-active']"
                @click="() => emit('update:due', due === 'Today' ? '' : 'Today')"
            >Today</button>
            <button
                type="button"
                class="chip"
                :class="[due === 'Tomorrow' && 'chip-active']"
                @click="() => emit('update:due', due === 'Tomorrow' ? '' : 'Tomorrow')"
            >Tomorrow</button>
            <button
                type="button"
                class="chip chip-icon"
                aria-label="Pick a date"
                @click="() => dateInput?.showPicker?.()"
            >
                <md-icon class="chip-clock">schedule</md-icon>
            </button>
            <input
                :ref="(el) => { dateInput = el as HTMLInputElement | null }"
                type="date"
                class="hidden-input"
                tabindex="-1"
                @change="(e) => emit('update:due', (e.target as HTMLInputElement).value)"
            />
        </div>
        <div
            v-if="due !== undefined && due && due !== 'Today' && due !== 'Tomorrow' && !showRenameActions"
            class="composer-row indented"
        >
            <span class="due-label">{{ due }}</span>
            <button
                type="button"
                class="due-clear"
                @click="() => emit('update:due', '')"
            >Clear</button>
        </div>
        <div
            v-if="showRenameActions"
            class="composer-row indented"
        >
            <md-text-button @click="() => emit('cancel')">Cancel</md-text-button>
            <md-filled-button @click="() => emit('confirm')">Save</md-filled-button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

// Pure component: no Pinia, no router. Reusable inline composer for
// add / rename / edit / sub-add. Tiny chip/menu/circle markup stays as
// inline <template> here instead of spinning up smaller components.
const props = withDefaults(defineProps<{
    title: string
    description?: string
    due?: string
    titlePlaceholder?: string
    showCheck?: boolean
    checkSmall?: boolean
    showDragHint?: boolean
    isSub?: boolean
    autofocus?: 'focus' | 'select' | 'none'
    confirmOnEnter?: boolean
    showRenameActions?: boolean
}>(), {
    description: undefined,
    due: undefined,
    titlePlaceholder: 'Title',
    showCheck: true,
    checkSmall: false,
    showDragHint: false,
    isSub: false,
    autofocus: 'focus',
    confirmOnEnter: true,
    showRenameActions: false,
})

const emit = defineEmits<{
    (e: 'update:title', v: string): void
    (e: 'update:description', v: string): void
    (e: 'update:due', v: string): void
    (e: 'confirm'): void
    (e: 'cancel'): void
}>()

const titleInputRef = ref<HTMLInputElement | null>(null)
const dateInput = ref<HTMLInputElement | null>(null)

onMounted(() => {
    if (props.autofocus === 'none') return
    const el = titleInputRef.value
    if (!el) return
    el.focus()
    if (props.autofocus === 'select') el.select()
})
</script>

<style scoped>
@reference "../../styles/tailwind.css";

/* ---- inline composer (add / edit) ---- */
.composer {
    margin: 4px 0;
    padding: 8px 12px 10px 0;
    border-radius: 8px;
    background-color: transparent;
    transition: background-color 150ms ease;
}

.composer:focus-within {
    background-color: color-mix(in srgb, #0b57d0 7%, transparent);
}

.editing-composer:focus-within {
    background-color: color-mix(in srgb, #0b57d0 9%, transparent);
}

.is-sub-composer {
    margin-left: 24px;
}

.composer-row {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 2px 0;
}

.composer-row.indented {
    padding-left: 44px;
}

.composer-check {
    flex: none;
    width: 20px;
    height: 20px;
    margin-left: 12px;
    border-radius: 999px;
    border: 2px solid var(--md-sys-color-on-surface-variant);
}

.composer-check.small {
    width: 18px;
    height: 18px;
}

.composer-title {
    flex: 1 1 auto;
    min-width: 0;
    border: none;
    outline: none;
    background: transparent;
    font-size: 14px;
    line-height: 20px;
    color: inherit;
}

.composer-details {
    flex: 1 1 auto;
    min-width: 0;
    border: none;
    outline: none;
    background: transparent;
    font-size: 12px;
    line-height: 16px;
    @apply text-on-surface-variant;
}

.composer-icon {
    --md-icon-size: 18px;
    flex: none;
    @apply text-on-surface-variant;
}

.drag-hint {
    --md-icon-size: 20px;
    flex: none;
    @apply text-on-surface-variant;
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

.chip:hover {
    background-color: color-mix(in srgb, var(--md-sys-color-on-surface) 8%, transparent);
}

.chip-active {
    background-color: color-mix(in srgb, #0b57d0 14%, transparent);
    border-color: #0b57d0;
    color: #0b57d0;
    font-weight: 500;
}

.chip-icon {
    padding: 6px 10px;
    display: inline-flex;
    align-items: center;
}

.chip-clock {
    --md-icon-size: 18px;
}

.due-label {
    font-size: 12px;
    @apply text-on-surface-variant;
}

.due-clear {
    font-size: 12px;
    color: #0b57d0;
    cursor: pointer;
}

.hidden-input {
    position: absolute;
    width: 1px;
    height: 1px;
    opacity: 0;
    pointer-events: none;
}
</style>
