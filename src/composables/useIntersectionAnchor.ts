import { onBeforeUnmount, readonly, ref, shallowRef, watch, type Ref, type ShallowRef } from 'vue'

export interface IUseIntersectionAnchorArgs {
    /** Element to use as the viewport for visibility checks. Defaults to the browser viewport. */
    root?: Element | Document | null
    /** Margin around the root. Same syntax as the IntersectionObserver rootMargin. */
    rootMargin?: string
    /** Ratio(s) at which visibility is reported. Defaults to 0 (any pixel visible). */
    threshold?: number | Array<number>
    /** When true, stop observing after the element becomes visible once. */
    once?: boolean
}

export interface IUseIntersectionAnchorReturn {
    /** Whether the target is currently inside the visible viewport. */
    isVisible: Readonly<Ref<boolean>>
    /** Latest observer entry (ratios / rects). Null before the first report. */
    entry: Readonly<ShallowRef<IntersectionObserverEntry | null>>
    /** Whether the runtime supports IntersectionObserver. */
    isSupported: boolean
    /** (Re)start observing the current target. Called automatically. */
    start: () => void
    /** Stop observing. */
    stop: () => void
}

/**
 * Pure composable: watch an element's position on the page and report whether
 * it appears inside the visible viewport. No Pinia, no router — usable
 * anywhere, including pure `{name}.vue` components.
 *
 * @example
 * ```vue
 * <script setup lang="ts">
 * import { ref } from 'vue'
 * import { useIntersectionAnchor } from '../composables/useIntersectionAnchor'
 *
 * const sentinelRef = ref<Element | null>(null)
 * const { isVisible } = useIntersectionAnchor(sentinelRef, { threshold: 0.1 })
 * </script>
 *
 * <template>
 *   <div ref="sentinelRef"></div>
 *   <button v-if="isVisible">Back to top</button>
 * </template>
 * ```
 */
export function useIntersectionAnchor(
    target: Ref<Element | null | undefined>,
    args: IUseIntersectionAnchorArgs = {},
): IUseIntersectionAnchorReturn {
    const { root = null, rootMargin = '0px', threshold = 0, once = false } = args

    const isSupported = typeof IntersectionObserver !== 'undefined'
    const isVisible = ref(false)
    const entry = shallowRef<IntersectionObserverEntry | null>(null)
    let observer: IntersectionObserver | null = null

    function disconnect() {
        observer?.disconnect()
        observer = null
    }

    function stop() {
        disconnect()
    }

    function start() {
        const el = target.value
        if (!el || !isSupported) return
        disconnect()
        observer = new IntersectionObserver((entries) => {
            const latest = entries[entries.length - 1]
            entry.value = latest
            isVisible.value = latest.isIntersecting
            if (latest.isIntersecting && once) disconnect()
        }, { root, rootMargin, threshold })
        observer.observe(el)
    }

    watch(target, () => {
        entry.value = null
        isVisible.value = false
        start()
    }, { immediate: true })

    onBeforeUnmount(() => {
        disconnect()
    })

    return {
        isVisible: readonly(isVisible),
        entry,
        isSupported,
        start,
        stop,
    }
}
