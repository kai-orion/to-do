import { type RouteRecordRaw, type Router, createRouter, createWebHashHistory } from 'vue-router'

import Index from '@pages/index.vue'

const routes: RouteRecordRaw[] = [
    {
        path: '/',
        component: Index
    },
]

export const globalRouter: Router = createRouter({
    history: createWebHashHistory(),
    routes,
    linkActiveClass: 'active',
    linkExactActiveClass: 'extra-active'
})
