<template>
    <div
        role="dialog"
        :class="rootClasses"
    >
        <slot></slot>
    </div>
    <span
        class="scrim"
        aria-hidden="true"
        @click="() => emits('scrim-click')"
    ></span>
</template>

<script setup lang="ts">
import { computed, type StyleValue } from 'vue';


const props = withDefaults(defineProps<{
    open?: boolean
}>(), {
    open: false,
})

const emits = defineEmits<{
    (e: 'scrim-click'): void
}>()

const rootClasses = computed<StyleValue>(() => ({
    'dialog': true,
    'open': props.open,
}))

</script>

<style scoped>
.dialog {
    position: fixed;
    inset: 0;
    z-index: 1;
    margin: auto;
    flex-direction: column;
    height: min(560px, 80dvh);
    width: min(840px, 80dvw);
    background: var(--md-sys-color-surface);
    border: 1px solid var(--md-sys-color-outline-variant);
    overflow: clip;
    border-radius: var(--md-sys-shape-corner-value-extra-large);

    transition-duration: 300ms;
    transition-property: opacity, transform, display, border-color, color, background, border-radius, width, height;
    transition-behavior: allow-discrete;
    transition-timing-function: var(--md-sys-motion-easing-emphasized, cubic-bezier(0.2, 0.0, 0, 1.0));

    &:not(.open) {
        opacity: 0;
        display: none;
        transform: scale(0.75);
        transition-timing-function: var(--md-sys-motion-easing-emphasized-accelerate, cubic-bezier(0.3, 0.0, 0.8, 0.15));
        transition-duration: 200ms;

        @starting-style {
            opacity: 1;
            transform: scale(1) translateY(0px);
        }
    }

    &.open {
        opacity: 1;
        display: flex;
        transform: scale(1) translateY(0);

        @starting-style {
            opacity: 0;
            transform: scale(0.7);
        }
    }
}

:root[medium] .dialog {
    height: min(960px, 85dvh);
    width: min(840px, 80dvw);
}

:root[compact] .dialog {
    height: 100dvh;
    width: 100dvw;
    border-radius: 0px;
}

.scrim {
    position: fixed;
    inset: 0;
    z-index: 0;
    background: var(--md-sys-color-scrim);
    opacity: 0;
    pointer-events: none;
    display: none;

    transition-duration: 500ms;
    transition-property: opacity, display, background;
    transition-behavior: allow-discrete;
}

.dialog.open+.scrim {
    pointer-events: auto;
    display: flex;
    opacity: 0.38;

    @starting-style {
        opacity: 0;
    }
}
</style>
