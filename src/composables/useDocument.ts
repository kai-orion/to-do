import { shallowRef, type ShallowRef } from 'vue'

/**
 * SSR-safe shared default. Resolved once at module load: the global
 * `document` on the client, `undefined` on the server / non-DOM runtimes
 * (SSR, workers, plain unit tests without jsdom).
 */
export const defaultDocument: Document | undefined = typeof document !== 'undefined' ? document : undefined

export interface IUseDocumentArgs {
    /**
     * Override the document handle — e.g. an iframe's
     * `contentDocument`, or a mock in tests. Defaults to the global
     * `document`. Pass explicit `null` to force the unsupported state.
     */
    document?: Document | null | undefined
}

export interface IUseDocumentReturn {
    /** The resolved document, or `null` where no DOM exists. Readonly. */
    element: Readonly<ShallowRef<Document | null>>
    /** Whether a document handle was resolved. */
    isSupported: boolean
}

/**
 * Pure composable: synchronous, SSR-safe access to the `Document` handle.
 * No Pinia, no router — usable anywhere, including pure `{name}.vue`
 * components.
 *
 * `document` is a process-global singleton, not a per-component resource,
 * so there is intentionally no `onMounted` / `onUnmounted` wiring: the
 * handle is resolved synchronously during `setup()` and stays valid for
 * the lifetime of the page. Multiple callers share nothing mutable —
 * each call owns its `shallowRef` (shallow: `Document` must never be
 * wrapped in a deep reactive proxy).
 *
 * @example
 * ```vue
 * <script setup lang="ts">
 * import { watchEffect } from 'vue'
 * import { useDocument } from '../composables/useDocument'
 *
 * const { element, isSupported } = useDocument()
 *
 * watchEffect(() => {
 *     if (!isSupported || !element.value) return
 *     element.value.title = 'to-do'
 * })
 * </script>
 * ```
 */
export function useDocument(args: IUseDocumentArgs = {}): IUseDocumentReturn {
    const resolved = args.document === undefined
        ? (defaultDocument ?? null)
        : args.document

    const element = shallowRef<Document | null>(resolved)
    const isSupported = element.value !== null

    return {
        // `ShallowRef` is assignable to its `Readonly` view: callers see
        // a readonly handle, while the inner `Document` type stays intact
        // (runtime `readonly()` would widen it to `DeepReadonly<Document>`).
        element,
        isSupported,
    }
}
