<template>
    <NavigationDrawer
        :nav-links="navigation.navLinks"
        :active-url="route.path"
        :is-modal="isModal"
        :is-open="navigation.isOpen"
        @scrim-click="() => navigation.updateOpen(false)"
        @navigate="handleNavigate"
    />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import NavigationDrawer from '@components/navigation-drawer/NavigationDrawer.vue'
import { useMediaQueryStore } from '@stores/media-query'
import { useNavigationStore } from '@stores/navigation'

const navigation = useNavigationStore()
const mediaQuery = useMediaQueryStore()
const route = useRoute()
const router = useRouter()

const isModal = computed(() => mediaQuery.currentBreakpoint === 'compact')

function handleNavigate(url: string) {
    if (isModal.value) navigation.updateOpen(false)
    if (route.path !== url) void router.push(url)
}
</script>
