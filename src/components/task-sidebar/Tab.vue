<template>
    <button
        type="button"
        :class="rootClasses"
        tabindex="0"
    >
        <span class="icon">
            <slot></slot>
        </span>
        <span class="label">{{ props.label }}</span>
        <md-ripple></md-ripple>
        <md-focus-ring></md-focus-ring>
    </button>
</template>

<script setup lang="ts">
import { computed, type ClassValue } from 'vue';


const props = withDefaults(defineProps<{
    active?: boolean
    label?: string
}>(), {
    active: false,
})

const rootClasses = computed<ClassValue>(() => ({
    'button': true,
    'active': props.active,
}))

</script>

<style scoped>
@reference "@styles/tailwind.css";

.button {
    all: unset;
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 16px;
    min-height: 40px;
    padding: 0 16px;
    border-radius: 999px;
    cursor: pointer;
    user-select: none;

    @apply bg-transparent text-on-surface;

    transition-property: color, background;
    transition-duration: 150ms;

    & .icon {
        display: grid;
        place-content: center;
        --md-icon-size: 20px;
        font-variation-settings: 'FILL' 0;
    }

    & .label {
        @apply label-medium;
        overflow: hidden;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 1;
    }

    &.active {
        @apply bg-secondary-container text-on-secondary-container;

        & .label {
            @apply emphasized-label-medium;
        }

        & .icon {
            font-variation-settings: 'FILL' 1;
        }
    }

}
</style>
