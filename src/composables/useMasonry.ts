import { onBeforeUnmount, onMounted, ref, watch, type Ref } from 'vue'

const MASONRY_UNIT = 4
const MASONRY_GAP = 8
const nativeMasonry = typeof CSS !== 'undefined'
    && (CSS.supports('display', 'grid-lanes') || CSS.supports('grid-template-rows', 'masonry'))

/**
 * Pure composable: span-based masonry fallback for the board grid.
 * Breakpoint knowledge stays outside — the page passes `breakpoint` and an
 * `isMasonry` predicate, so this hook never touches Pinia. Lifecycle wiring
 * (watch + observers) is fully self-contained.
 */
export function useMasonry(opts: { breakpoint: Ref<string>, isMasonry: (breakpoint: string) => boolean }) {
    const boardRef = ref<HTMLElement | null>(null)

    function layoutMasonry() {
        const board = boardRef.value
        if (!board) return
        const cards = [...board.children].filter((el) => el.classList.contains('list-card')) as Array<HTMLElement>
        if (nativeMasonry || !opts.isMasonry(opts.breakpoint.value)) {
            for (const card of cards) card.style.gridRowEnd = ''
            return
        }
        for (const card of cards) {
            const height = card.getBoundingClientRect().height
            // round (not ceil) so the mean vertical rhythm equals the gap
            const span = Math.max(1, Math.round((height + MASONRY_GAP) / (MASONRY_UNIT + MASONRY_GAP)))
            card.style.gridRowEnd = `span ${span}`
        }
    }

    let resizeObserver: ResizeObserver | null = null
    let mutationObserver: MutationObserver | null = null
    let raf = 0

    function scheduleMasonry() {
        if (raf) return
        raf = requestAnimationFrame(() => {
            raf = 0
            layoutMasonry()
        })
    }

    function startMasonryObservers() {
        stopMasonryObservers()
        const board = boardRef.value
        if (!board || typeof ResizeObserver === 'undefined') return
        resizeObserver = new ResizeObserver(() => scheduleMasonry())
        resizeObserver.observe(board)
        for (const child of [...board.children]) resizeObserver.observe(child)
        if (typeof MutationObserver !== 'undefined') {
            mutationObserver = new MutationObserver((mutations) => {
                let structureChanged = false
                for (const m of mutations) {
                    if (m.type === 'childList') {
                        structureChanged = true
                        for (const node of [...m.addedNodes]) {
                            if (node instanceof HTMLElement) resizeObserver?.observe(node)
                        }
                    }
                }
                if (structureChanged) scheduleMasonry()
            })
            mutationObserver.observe(board, { childList: true, subtree: false })
        }
        scheduleMasonry()
    }

    function stopMasonryObservers() {
        if (raf) {
            cancelAnimationFrame(raf)
            raf = 0
        }
        resizeObserver?.disconnect()
        resizeObserver = null
        mutationObserver?.disconnect()
        mutationObserver = null
    }

    watch(() => opts.breakpoint.value, () => {
        layoutMasonry()
    })

    onMounted(() => {
        startMasonryObservers()
    })

    onBeforeUnmount(() => {
        stopMasonryObservers()
    })

    return {
        boardRef,
        layoutMasonry,
    }
}
