<template>
    <header class="tasks-header">
        <md-icon-button
            class="menu-btn"
            @click="emit('menu-click')"
            aria-label="Menu"
        >
            <md-icon>menu</md-icon>
        </md-icon-button>
        <div class="brand">
            <span class="brand-mark">
                <md-icon class="brand-check">check</md-icon>
            </span>
            <span class="brand-name">Tasks</span>
        </div>
        <span class="header-spacer"></span>
        <md-icon-button aria-label="Help">
            <md-icon>help_outline</md-icon>
        </md-icon-button>
        <md-icon-button aria-label="Apps">
            <md-icon>apps</md-icon>
        </md-icon-button>
        <span
            class="avatar"
            title="Account"
        >K</span>
    </header>
</template>

<script setup lang="ts">
// Pure component: no Pinia, no router, no external inject/provide.
// Data in via props (none needed), actions out via emits.
const emit = defineEmits<{
    (e: 'menu-click'): void
}>()
</script>

<style scoped>
@reference "../../styles/tailwind.css";

.tasks-header {
    display: flex;
    align-items: center;
    gap: 4px;
    height: 64px;
    width: 100%;
    padding: 8px 16px 8px 8px;
    @apply bg-surface-container text-on-surface;
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
    background: linear-gradient(135deg, #0b57d0 0%, #4b90ff 100%);
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

.avatar {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    margin-left: 4px;
    border-radius: 999px;
    font-size: 16px;
    font-weight: 500;
    color: #fff;
    background: #5f6368;
    outline: 2px solid #0b57d0;
    outline-offset: 2px;
    cursor: pointer;
    user-select: none;
}
</style>
