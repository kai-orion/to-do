<template>
    <aside class="task-sidebar">
        <div class="fab">
            <slot name="fab"></slot>
        </div>

        <nav class="tabs">
            <slot name="tabs"></slot>
        </nav>

        <div class="lists">
            <slot name="lists"></slot>
        </div>
    </aside>
</template>

<script setup lang="ts">

</script>

<style scoped>
@reference "@styles/tailwind.css";

.task-sidebar {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    padding: 8px 12px 16px 8px;
    gap: 0;
    @apply bg-transparent text-on-surface;
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



.view-label {
    font-size: 14px;
    line-height: 20px;
    letter-spacing: 0.25px;
}
</style>
