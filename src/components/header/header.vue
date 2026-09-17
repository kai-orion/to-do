<template>
    <header class="header">
        <span
            v-if="$slots.start"
            class="start"
        >
            <slot name="start"></slot>
        </span>

        <span class="headline">{{ headline }}</span>

        <span
            v-if="$slots.end"
            class="end"
        >
            <slot name="end"></slot>
        </span>
    </header>
</template>

<script setup lang="ts">
defineProps<{
    headline: string
}>()
</script>

<style scoped>
@reference "@styles/tailwind.css";
.header {
    --header-height: 64px;
    --header-start-width: 48px;

    height: var(--header-height);
    width: 100%;

    display: grid;
    grid-template-columns: var(--header-start-width) 1fr auto;
    grid-template-rows: 1fr;
    align-items: center;

    padding-left: 16px;
    padding-right: 16px;

    @apply bg-surface-container;


    &>:is(.start, .end) {
        display: block;
    }

    &>.start {
        grid-column: 1/2;
    }

    &>.headline {
        grid-column: 2/3;
        @apply text-on-surface text-title-medium;
    }

    &>.end {
        grid-column: 3/4;
    }

    &:not(:has(.start))>.headline {
        grid-column: 1/3;
    }

    &:not(:has(.end))>.headline {
        grid-column: 2/4;
    }

    &:not(:has(:is(.start, .end)))>.headline {
        grid-column: 1/4;
    }
}
</style>
