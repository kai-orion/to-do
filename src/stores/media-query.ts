import { defineStore } from 'pinia'
import { ref } from 'vue'

export type MediaBreakpointType = {
    min: number | -1
    max: number | -1
}

export const MEDIA_BREAKPOINTS: Record<string, MediaBreakpointType> = {
    compact: {
        min: -1,
        max: 600
    },
    medium: {
        min: 600,
        max: 840
    },
    expanded: {
        min: 840,
        max: 1200
    },
    large: {
        min: 1200,
        max: 1600
    },
    'extra-large': {
        min: 1600,
        max: -1
    }
}

export const useMediaQueryStore = defineStore('media-query', () => {
    const currentWidth = ref<number>(0)
    const currentBreakpoint = ref<string>('compact')

    function onWindowResize(window: Window, target: HTMLElement) {
        currentWidth.value = window.innerWidth

        for (const [k, v] of Object.entries(MEDIA_BREAKPOINTS)) {
            if ((v.min === -1 || currentWidth.value >= v.min) && (v.max === -1 || currentWidth.value < v.max)) {
                currentBreakpoint.value = k
            }
        }

        target.classList.remove(...Object.keys(MEDIA_BREAKPOINTS).filter(e => e !== currentBreakpoint.value))
        if (!target.classList.contains(currentBreakpoint.value)) {
            target.classList.add(currentBreakpoint.value)
        }
    }

    return {
        currentWidth,
        currentBreakpoint,
        onWindowResize,
    }
})
