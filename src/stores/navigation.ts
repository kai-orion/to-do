import { defineStore } from 'pinia'
import { ref } from 'vue'

export type INavLink = {
    label: string
    url: string
    iconString: string
}

export const useNavigationStore = defineStore('navigation', () => {
    const navLinks: Array<INavLink> = [
        {
            iconString: 'home',
            label: 'Home',
            url: '/'
        },
        {
            iconString: 'settings',
            label: 'Settings',
            url: '/settings'
        },
    ]

    const isOpen = ref(true)

    function updateOpen(value: boolean) {
        isOpen.value = value
    }

    return {
        navLinks,
        isOpen,
        updateOpen,
    }
})
