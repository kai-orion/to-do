<template>
    <aside :class="rootClasses">
        <div class="fab">
            <slot name="fab"></slot>
        </div>

        <nav class="tabs">
            <slot name="tabs"></slot>
        </nav>

        <div class="lists">
            <slot name="lists"></slot>
        </div>

        <md-elevation></md-elevation>
    </aside>
    <span
        class="scrim"
        aria-hidden="true"
        @click="() => emits('scrim-click')"
    ></span>
</template>

<script setup lang="ts">
import { computed, type ClassValue } from 'vue';

const props = withDefaults(defineProps<{
    open?: boolean
    modal?: boolean
}>(), {
    open: false,
    modal: false,
})

const emits = defineEmits<{
    (e: 'scrim-click'): void
}>()

const rootClasses = computed<ClassValue>(() => ({
    'sidebar': true,
    'open': props.open,
    'modal': props.modal,
}))
</script>

<style scoped>
@reference "@styles/tailwind.css";

.sidebar {
    all: unset;
    position: relative;
    z-index: 0;
    box-sizing: border-box;
    flex-direction: column;
    width: 260px;
    height: 100%;
    padding: 8px 12px 16px 8px;
    gap: 0;
    @apply bg-surface text-on-surface;

    transition-property: display, opacity, transform;
    transition-duration: 200ms;
    transition-behavior: allow-discrete;

    &:not(.open) {
        transform: translateX(-100%);
        opacity: 0;
        display: none;

        @starting-style {
            transform: translateX(0%);
            opacity: 1;
        }
    }

    &.open {
        transform: translateX(0%);
        opacity: 1;
        display: flex;

        @starting-style {
            transform: translateX(-100%);
            opacity: 0;
        }
    }

    &.modal {
        position: fixed;
        inset: 0;
        z-index: 1;
        --md-elevation-level: 2;
    }

}

:root[dark] .sidebar:not(.modal) {
    border-right-color: var(--md-sys-color-outline-variant);
}

:root[compact] .sidebar.modal {
    width: min(90dvw, 320px);
    @apply rounded-r-extra-large;
}

.scrim {
    all: unset;
    position: fixed;
    inset: 0;
    z-index: 0;
    opacity: 0;
    pointer-events: none;

    @apply bg-scrim;

    transition-property: display, opacity;
    transition-duration: 500ms;
    transition-behavior: allow-discrete;
}

.sidebar.modal {

    &:not(.open)+.scrim {
        opacity: 0;

        @starting-style {
            opacity: 0.38;
        }
    }

    &.open+.scrim {
        pointer-events: auto;
        opacity: 0.38;

        @starting-style {
            opacity: 0;
        }
    }
}

.fab {
    padding: 8px 8px 20px 8px;
}

.tabs {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 0 0 12px 0;
}
</style>
