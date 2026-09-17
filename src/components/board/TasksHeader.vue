<template>
    <header
        class="tasks-header"
        :class="{ 'border-bottom': props.borderBottom }"
    >
        <md-icon-button
            class="menu-btn"
            @click="emit('menu-click')"
            aria-label="Menu"
        >
            <Icon name="menu" />
        </md-icon-button>
        <div class="brand">
            <span class="brand-mark">
                <Icon class="brand-check" name="check" />
            </span>
            <span class="brand-name">Tasks</span>
        </div>
        <span class="header-spacer"></span>
        <slot name="end"></slot>
    </header>
</template>

<script setup lang="ts">
import Icon from '@components/Icon.vue'

const props = withDefaults(defineProps<{
    borderBottom?: boolean
}>(), {
    borderBottom: false
})

const emit = defineEmits<{
    (e: 'menu-click'): void
}>()
</script>

<style scoped>
@reference "@styles/tailwind.css";

.tasks-header {
    display: flex;
    align-items: center;
    z-index: 1;
    gap: 4px;
    height: 64px;
    max-height: 64px;
    overflow: clip;
    width: 100%;
    box-sizing: border-box;
    padding: 0px 8px;
    @apply bg-surface-container-low text-on-surface;

    transition-duration: 200ms;
    transition-behavior: allow-discrete;
    transition-property: border-bottom-color;
    border-bottom-color: transparent;
    border-bottom-style: solid;
    border-bottom-width: 1px;

    &.border-bottom {
        border-bottom-color: var(--md-sys-color-outline-variant);
    }
}

.menu-btn {
    flex: none;
}

.brand {
    display: flex;
    align-items: center;
    gap: 8px;
    padding-left: 4px;
    user-select: none;
}

.brand-mark {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 999px;
    background: linear-gradient(135deg, var(--md-sys-color-primary) 0%, var(--md-sys-color-primary-container) 100%);
}

.brand-check {
    --md-icon-size: 20px;
    color: #fff;
    font-variation-settings: 'FILL' 1;
}

.brand-name {
    font-size: 22px;
    line-height: 28px;
    letter-spacing: 0;
    @apply text-on-surface;
}

.header-spacer {
    flex: 1 1 auto;
}
</style>
