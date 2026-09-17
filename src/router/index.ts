import { type RouteRecordRaw, type Router, createRouter, createWebHashHistory } from 'vue-router'

import Index from '@pages/index.vue'
import Settings from '@pages/settings.vue'

const routes: RouteRecordRaw[] = [
    {
        path: '/',
        component: Index
    },
    {
        path: '/settings',
        component: Settings
    }
]

export const globalRouter: Router = createRouter({
    history: createWebHashHistory(),
    routes,
    linkActiveClass: 'active',
    linkExactActiveClass: 'extra-active'
})
