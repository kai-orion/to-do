<template>

    <RouterView v-slot="{ Component }">
        <component :is="Component"></component>
    </RouterView>

</template>

<script lang="ts" setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useAdoptedStyleSheet } from './composables/useAdoptedStyleSheet'
import { useDocument } from './composables/useDocument'
import { useMaterialThemeStore } from "./stores/material-theme"
import { useMediaQueryStore } from './stores/media-query'

const mediaQuery = useMediaQueryStore()
const document = useDocument()
const theme = useMaterialThemeStore()
const adoptedStyleSheet = useAdoptedStyleSheet()
const materialThemeStyleSheet = ref<CSSStyleSheet>(new CSSStyleSheet())

watch(() => theme.cssText, () => {
    materialThemeStyleSheet.value
        .replace(theme.cssText)
        .then(() => {
            adoptedStyleSheet.insertOneStyleSheet(materialThemeStyleSheet.value)
        })
}, {
    immediate: true,
    flush: 'post',
})

watch(() => theme.isDark, (value) => {
    if (!document.isSupported) return
    document.element.value!.documentElement.toggleAttribute(`dark`, value)
}, {
    immediate: true,
    flush: 'post',
})

onMounted(() => {
    if (!document.isSupported) return
    mediaQuery.start(document.element.value!.documentElement)
})
onBeforeUnmount(() => {
    mediaQuery.stop()
})
</script>
