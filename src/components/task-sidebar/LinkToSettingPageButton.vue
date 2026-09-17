<template>
    <button
        tabindex="0"
        class="button"
    >
        <md-icon>settings</md-icon>
        <span class="label">
            Settings
        </span>
        <md-icon class="last-icon">open_in_new</md-icon>

        <md-ripple></md-ripple>
        <md-focus-ring></md-focus-ring>
    </button>
</template>

<script setup lang="ts">

</script>

<style scoped>
@reference "@styles/tailwind.css";

.button {
    all: unset;
    position: relative;
    height: 40px;
    display: inline-flex;
    align-items: center;
    gap: 12px;
    padding-inline: 12px 20px;
    cursor: pointer;
    user-select: none;

    --md-icon-size: 20px;

    @apply bg-surface text-on-surface rounded-full;

    & .label {
        @apply label-medium;
    }

    & .last-icon {
        margin-inline-start: auto;
    }
}
</style>
