import { onBeforeUnmount, readonly, ref, shallowRef, toValue, watch, type MaybeRefOrGetter, type Ref, type ShallowRef } from 'vue'

export interface IUseIntersectionAnchorArgs {
    /** Element to use as the viewport for visibility checks. Accepts a Ref/getter so a template-ref container resolved after mount works. Defaults to the browser viewport. */
    root?: MaybeRefOrGetter<Element | Document | null>
    /** Margin around the root. Same syntax as the IntersectionObserver rootMargin. */
    rootMargin?: string
    /** Ratio(s) at which visibility is reported. Defaults to 0 (any pixel visible). */
    threshold?: number | Array<number>
    /** When true, stop observing after the element becomes visible once. */
    once?: boolean
}

export interface IUseIntersectionAnchorReturn {
    /** Whether the target is currently visible inside the root (viewport by default, or the given container). */
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
 * Pure composable: watch an element's position and report whether it appears
 * inside the visible area — the browser viewport by default, or a given
 * scroll container via `args.root`. No Pinia, no router — usable anywhere,
 * including pure `{name}.vue` components.
 *
 * `root` accepts a plain value, a Ref (e.g. `useTemplateRef('scrollable')`),
 * or a getter, so containers resolved after mount are supported. Both target
 * and root are watched; the observer restarts whenever either resolves.
 *
 * @example
 * ```vue
 * <script setup lang="ts">
 * import { useTemplateRef } from 'vue'
 * import { useIntersectionAnchor } from '@composables/useIntersectionAnchor'
 *
 * const scrollableRef = useTemplateRef<HTMLElement>('scrollable')
 * const sentinelRef = useTemplateRef<HTMLElement>('sentinel')
 * const { isVisible } = useIntersectionAnchor(sentinelRef, { root: scrollableRef })
 * </script>
 *
 * <template>
 *   <div ref="scrollable">
 *     <div ref="sentinel"></div>
 *   </div>
 *   <button v-if="isVisible">Back to top</button>
 * </template>
 * ```
 */
export function useIntersectionAnchor(
    target: Ref<Element | null | undefined>,
    args: IUseIntersectionAnchorArgs = {},
): IUseIntersectionAnchorReturn {
    const { rootMargin = '0px', threshold = 0, once = false } = args

    const isSupported = typeof IntersectionObserver !== 'undefined'
    const isVisible = ref(false)
    const entry = shallowRef<IntersectionObserverEntry | null>(null)
    let observer: IntersectionObserver | null = null

    function resolveRoot(): Element | Document | null {
        return toValue(args.root ?? null) ?? null
    }

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
        }, { root: resolveRoot(), rootMargin, threshold })
        observer.observe(el)
    }

    watch([() => target.value, resolveRoot], () => {
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
