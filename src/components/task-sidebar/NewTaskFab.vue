<template>
    <button
        class="create-btn"
        type="button"
        tabindex="1"
    >
        <Icon class="create-icon" name="add" />
        <span class="create-label">New Task</span>
        <md-ripple></md-ripple>
        <md-focus-ring></md-focus-ring>
    </button>
</template>

<script setup lang="ts">
import Icon from '@components/Icon.vue'
</script>

<style scoped>
@reference "@styles/tailwind.css";

.create-btn {
    all: unset;
    position: relative;
    display: flex;
    align-items: center;
    height: 56px;
    gap: 12px;
    padding-inline: 12px 20px;
    border-radius: var(--md-sys-shape-corner-value-large);
    cursor: pointer;
    user-select: none;

    @apply bg-tertiary-container text-on-tertiary-container;

    --md-ripple-hover-color: var(--md-sys-color-on-tertiary-container);
    --md-ripple-pressed-color: var(--md-sys-color-on-tertiary-container);
    --md-icon-size: 24px;

    --md-focus-ring-shape: var(--md-sys-shape-corner-value-large);

    transition-property: color, background;
    transition-duration: 150ms;

    & .create-label {
        @apply label-medium;
    }
}
</style>
