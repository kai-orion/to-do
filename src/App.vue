<template>
    <MaterialThemeProvider>

        <RouterView v-slot="{ Component }">
            <component :is="Component"></component>
        </RouterView>

    </MaterialThemeProvider>
</template>

<script lang="ts" setup>
import { onBeforeUnmount, onMounted } from 'vue'
import { MaterialThemeProvider } from './components/material-provider/material-theme-provider'
import { useMediaQueryStore } from './stores/media-query'

const mediaQuery = useMediaQueryStore()

onMounted(() => {
    mediaQuery.start(document.documentElement)
})
onBeforeUnmount(() => {
    mediaQuery.stop()
})
</script>
