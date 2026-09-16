import type { BreakpointObserverInstance, BreakpointState, WidthBreakpointMap } from '@sandlada/breakpoint'
import { createBreakpointObserver } from '@sandlada/breakpoint'
import { defineStore } from 'pinia'
import type { Subscription } from 'rxjs'
import { ref } from 'vue'

export const MEDIA_WIDTH_BREAKPOINTS: WidthBreakpointMap = {
    compact: '< 600px',
    medium: { and: ['>= 600px', '< 840px'] },
    expanded: { and: ['>= 840px', '< 1200px'] },
    large: { and: ['>= 1200px', '< 1600px'] },
    'extra-large': '>= 1600px',
}

const MEDIA_BREAKPOINT_KEYS = Object.keys(MEDIA_WIDTH_BREAKPOINTS)

export const useMediaQueryStore = defineStore('media-query', () => {
    const currentWidth = ref<number>(0)
    const currentBreakpoint = ref<string>('compact')

    let observer: BreakpointObserverInstance | null = null
    let subscription: Subscription | null = null
    let target: HTMLElement | null = null

    function syncBodyClass(breakpoint: string) {
        if (!target) return
        MEDIA_BREAKPOINT_KEYS.filter((key) => key !== breakpoint).forEach((key) => target!.removeAttribute(key))
        if (target.hasAttribute(breakpoint)) return
        target.setAttribute(breakpoint, ``)
    }

    function applyState(state: BreakpointState) {
        currentWidth.value = state.width
        currentBreakpoint.value = state.primaryWidthBreakpoint ?? 'compact'
        syncBodyClass(currentBreakpoint.value)
    }

    function start(element: HTMLElement) {
        stop()
        target = element
        observer = createBreakpointObserver({
            dimension: 'width',
            widthBreakpoints: MEDIA_WIDTH_BREAKPOINTS,
        })
        applyState(observer.snapshot)
        subscription = observer.state$.subscribe(applyState)
    }

    function stop() {
        subscription?.unsubscribe()
        subscription = null
        observer?.dispose()
        observer = null
        target = null
    }

    return {
        currentWidth,
        currentBreakpoint,
        start,
        stop,
    }
})
