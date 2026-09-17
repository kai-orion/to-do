<template>
    <button
        type="button"
        class="new-list-row"
        tabindex="0"
    >
        <Icon name="add" />
        <span class="label">New List</span>
        <md-ripple></md-ripple>
        <md-focus-ring></md-focus-ring>
    </button>
</template>

<script setup lang="ts">
import Icon from '@components/Icon.vue'
</script>

<style scoped>
@reference "@styles/tailwind.css";

.new-list-row {
    all: unset;
    position: relative;
    display: flex;
    align-items: center;
    gap: 8px;
    height: 40px;
    width: 100%;
    box-sizing: border-box;
    padding-inline: 12px 20px;
    margin-block: 12px;
    border-radius: 999px;
    cursor: pointer;
    user-select: none;

    border: 1px solid var(--md-sys-color-outline-variant);

    --md-icon-size: 20px;

    & .label {
        overflow: hidden;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 1;

        @apply label-small;
    }
}
</style>
