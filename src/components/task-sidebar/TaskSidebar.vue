<template>
    <aside :class="rootClasses">
        <md-elevation></md-elevation>

        <div class="fab">
            <slot name="fab"></slot>
        </div>

        <div
            class="scrollable"
            ref="scrollable"
        >
            <span
                ref="top-anchor"
                class="top-anchor"
                aria-hidden="true"
            ></span>

            <span
                class="top-divider"
                aria-hidden="true"
            ></span>

            <nav class="tabs">
                <slot name="tabs"></slot>
            </nav>

            <div class="lists">
                <slot name="lists"></slot>
            </div>

            <span
                class="bottom-divider"
                aria-hidden="true"
            ></span>
            <span
                ref="bottom-anchor"
                class="bottom-anchor"
                aria-hidden="true"
            ></span>
        </div>

        <span class="end">
            <slot name="end"></slot>
        </span>
    </aside>
    <span
        class="scrim"
        aria-hidden="true"
        @click="() => emits('scrim-click')"
    ></span>
</template>

<script setup lang="ts">
import { useIntersectionAnchor } from '@/composables/useIntersectionAnchor';
import { computed, useTemplateRef, type ClassValue } from 'vue';

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

const scrollableElementRef = useTemplateRef<HTMLElement>('scrollable')
const topAnchorElementRef = useTemplateRef<HTMLElement>('top-anchor')
const bottomAnchorElementRef = useTemplateRef<HTMLElement>('bottom-anchor')

const topAnchor = useIntersectionAnchor(topAnchorElementRef, {
    root: scrollableElementRef
})
const bottomAnchor = useIntersectionAnchor(bottomAnchorElementRef, {
    root: scrollableElementRef
})

const rootClasses = computed<ClassValue>(() => ({
    'sidebar': true,
    'open': props.open,
    'modal': props.modal,
    'show-top-divider': !topAnchor.isVisible.value,
    'show-bottom-divider': !bottomAnchor.isVisible.value,
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
    gap: 0;
    border-right-width: 1px;
    border-right-color: transparent;
    border-right-style: solid;
    @apply bg-surface text-on-surface;

    transition-property: display, opacity, transform, border-color;
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
    margin: 12px 12px 0px;
}

.scrollable {
    overflow: auto;
    overscroll-behavior: contain;
    min-height: 0;
    flex: 1 1 auto;
    position: relative;
    z-index: 0;
    box-sizing: border-box;
    margin: 12px 0px;
}

:where(.top-anchor, .bottom-anchor) {
    display: block;
    visibility: hidden;
    height: 1px;
}

:where(.top-divider, .bottom-divider) {
    display: block;
    box-sizing: border-box;
    height: 1px;
    width: 100%;
    opacity: 0;
    transition-duration: 200ms;
    transition-property: opacity;
    background: var(--md-sys-color-outline-variant);

    position: sticky;
    z-index: 1;
}

.top-divider {
    top: 0;
}

.bottom-divider {
    bottom: 0;
}

.sidebar.show-top-divider .top-divider {
    opacity: 1;
}

.sidebar.show-bottom-divider .bottom-divider {
    opacity: 1;
}

.tabs {
    display: flex;
    flex-direction: column;
    gap: 2px;
    margin: 0px 12px;
    box-sizing: border-box;
}

.lists {
    margin: 0px 12px;
    box-sizing: border-box;
}

.end {
    position: relative;
    box-sizing: border-box;
    margin: 12px 12px;
    display: flex;
    flex-direction: column;
    gap: var(--md-sys-measurement-space50);
    margin-block-start: auto;
}
</style>
