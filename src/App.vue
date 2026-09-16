<template>
    <MaterialThemeProvider>

        <RouterView v-slot="{ Component }">
            <component :is="Component"></component>
        </RouterView>

    </MaterialThemeProvider>
</template>

<script lang="ts" setup>
import { onBeforeUnmount, onMounted } from 'vue';
import {MaterialThemeProvider} from './components/material-provider/material-theme-provider';
import { useMediaQueryStore } from './stores/media-query';

const mediaQuery = useMediaQueryStore()

const onWindowResize = () => {
    mediaQuery.onWindowResize(window, document.body)
}

onMounted(() => {
    onWindowResize()
    window.addEventListener('resize', onWindowResize)
})
onBeforeUnmount(() => {
    window.removeEventListener('resize', onWindowResize)
})
</script>
