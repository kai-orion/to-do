<template>
    <Teleport
        v-if="isModal"
        to="body"
    >
        <div :class="['navigation-drawer', isModal && 'modal', isOpen && 'open']">
            <div class="nav-buttons">
                <RouterLink
                    v-for="link in navLinks"
                    :key="link.url"
                    :to="link.url"
                    class="nav-button"
                    active-class="active"
                    exact-active-class="extra-active"
                >
                    <md-icon class="start">{{ link.iconString }}</md-icon>
                    <span class="label">{{ link.label }}</span>
                    <span class="alert"></span>
                    <md-ripple></md-ripple>
                </RouterLink>
            </div>
            <md-elevation></md-elevation>
        </div>
        <span
            :class="['scrim', isOpen && 'open']"
            @click="emit('scrimClick')"
        ></span>
    </Teleport>
    <div
        v-else
        :class="['navigation-drawer', isModal && 'modal', isOpen && 'open']"
    >
        <div class="nav-buttons">
            <RouterLink
                v-for="link in navLinks"
                :key="link.url"
                :to="link.url"
                class="nav-button"
                active-class="active"
                exact-active-class="extra-active"
            >
                <md-icon class="start">{{ link.iconString }}</md-icon>
                <span class="label">{{ link.label }}</span>
                <span class="alert"></span>
                <md-ripple></md-ripple>
            </RouterLink>
        </div>
        <md-elevation></md-elevation>
    </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import type { INavLink } from '@stores/navigation'

withDefaults(defineProps<{
    navLinks: Array<INavLink>
    isModal?: boolean
    isOpen?: boolean
}>(), {
    isModal: false,
    isOpen: true,
})

const emit = defineEmits<{
    (e: 'scrimClick'): void
}>()
</script>

<style scoped>
@reference "@styles/tailwind.css";
.navigation-drawer {
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr auto;

    --navigation-drawer-width: 280px;

    width: var(--navigation-drawer-width);
    height: 100%;
    opacity: 1;
    border-top-right-radius: 28px;
    border-bottom-right-radius: 28px;

    @apply bg-surface;


    &.modal {
        position: fixed;
        inset: 0;
        z-index: 2;
        @apply bg-surface-container;

        &>md-elevation {
            --md-elevation-level: 3;
        }
    }

    &>:is(.start, .end, .nav-buttons) {
        display: block;
    }

    transition-property: width,
    opacity,
    color,
    background-color;
    @apply ease-emphasized-decelerate duration-400;

    &:not(.open) {
        pointer-events: none;

        &:not(.modal) {
            @apply ease-emphasized-accelerate duration-200;
            width: 0px;
            opacity: 0;
        }

        &.modal {
            @apply ease-emphasized-accelerate duration-200;
            width: 0px;
            opacity: 0;
        }
    }

    &>.start {}

    &>.nav-buttons {
        display: grid;
        grid-template-columns: 1fr;
        grid-auto-rows: var(--navigation-drawer-nav-button-height);

        padding-left: 16px;
        padding-right: 16px;
        padding-top: 16px;
        padding-bottom: 16px;

        overflow: auto;

        --navigation-drawer-nav-button-height: 56px;

        &>.nav-button {
            display: grid;
            grid-template-rows: 1fr;
            grid-template-columns: 48px 1fr 48px;
            align-items: center;

            padding-left: 8px;
            padding-right: 24px;

            position: relative;
            height: var(--navigation-drawer-nav-button-height);
            width: 100%;
            border-radius: 28px;

            &>.start {
                grid-column: 1/2;
                align-self: center;
                justify-self: center;
            }

            &>.label {
                grid-column: 2/3;
            }

            &>.alert {
                grid-column: 3/4;
            }

            &.active,
            &.extra-active {
                @apply bg-secondary-container text-on-secondary-container;
            }

            &:not(.active),
            &:not(.extra-active) {
                @apply bg-transparent text-on-surface;
            }
        }
    }

    &>.end {}


}

.scrim {
    @apply bg-scrim;
    display: block;
    opacity: 0.38;
    width: 100%;
    height: 100%;
    position: fixed;
    z-index: 1;
    inset: 0;

    transition-property: opacity;
    @apply ease-emphasized-decelerate duration-400;

    &:not(.open) {
        @apply ease-emphasized-accelerate duration-200;
        opacity: 0;
        pointer-events: none;
    }
}
</style>
