import { defineStore } from 'pinia'
import { ref } from 'vue'

export type NavLinkType = {
    label: string
    url: string
    iconString: string
}

export const useNavigationStore = defineStore('navigation', () => {
    const navLinks: Array<NavLinkType> = [
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

    const open = ref(false)

    function setOpen(value: boolean) {
        open.value = value
    }

    function toggleOpen() {
        open.value = !open.value
    }

    return {
        navLinks,
        open,
        setOpen,
        toggleOpen,
    }
})
