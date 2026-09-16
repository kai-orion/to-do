<template>
    <div
        class="accordions"
        ref="accordionsRef"
    >
        <slot></slot>
    </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

const props = withDefaults(defineProps<{
    isSingle?: boolean
}>(), {
    isSingle: true
})

const accordionsRef = ref<HTMLElement | null>(null)
const getAccordions = () => [...accordionsRef.value?.children ?? []]

const accordionOpen = (e: Event) => {
    const target = (e.target as HTMLElement)

        if (props.isSingle) {
        for (const accordion of getAccordions()) {
            if (accordion !== target) {
                accordion.classList.remove('open')
            }
        }
    }

}
onMounted(() => {
    for (const accordion of getAccordions()) {
        accordion.addEventListener('open', accordionOpen)
    }
})
onBeforeUnmount(() => {
    for (const accordion of getAccordions()) {
        accordion.removeEventListener('open', accordionOpen)
    }
})
</script>

<style scoped>
.accordions {
    display: flex;
    flex-direction: column;
    gap: 4px;

    --accordions-margin: 8px;
    margin: 8px;

    position: relative;
}
</style>
