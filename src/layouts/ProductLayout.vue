<template>
    <div class="product-page-layout">

        <slot
            name="header"
            :showBottomBorder="!intersection.isVisible.value"
        ></slot>

        <main
            class="content-view"
            :class="[navigation.isOpen && 'nav-open']"
        >
            <span class="content">
                <span
                    aria-hidden="true"
                    class="anchor-top"
                    aria-label="用於控制header border-bottom 屬性的錨點元素"
                    ref="anchor-top"
                ></span>

                <slot></slot>
            </span>

            <span class="navigation-drawer">
                <slot name="navigation-drawer"></slot>
            </span>

        </main>

    </div>
</template>

<script setup lang="ts">
import { useIntersectionAnchor } from '@/composables/useIntersectionAnchor';
import { useMaterialThemeStore } from '@stores/material-theme';
import { useNavigationStore } from '@stores/navigation';
import { useTemplateRef } from 'vue';

defineSlots<{
    header(props: { showBottomBorder: boolean }): any
    default(): any
    'navigation-drawer'(): any
}>()

const theme = useMaterialThemeStore()
const navigation = useNavigationStore()

// anchor for header border (owned here with the board scroll)
const ancorTopElementRef = useTemplateRef<HTMLElement>('anchor-top')
const intersection = useIntersectionAnchor(ancorTopElementRef)
</script>

<style scoped>
@reference "@styles/tailwind.css";

.product-page-layout {
    &>.content-view {
        display: grid;
        grid-template-columns: auto 1fr;
        grid-template-rows: 1fr;

        &>.content {
            grid-row: 1/2;
            grid-column: 2/3;
        }

        &>.navigation-drawer {
            grid-row: 1/2;
            grid-column: 1/2;
        }
    }
}

.product-page-layout {
    --header-height: 64px;

    min-height: 100svh;
    max-height: 100svh;
    overflow: hidden;
    position: relative;

    &>.content-view {
        --content-view-content-margin: 0px;
        --content-view-height: calc(100svh - var(--header-height) - var(--content-view-content-margin));
        min-height: var(--content-view-height);
        max-height: var(--content-view-height);
        overflow: hidden;


        &>:is(.content, .navigation-drawer) {
            display: block;
            min-height: var(--content-view-height);
            max-height: var(--content-view-height);
        }

        &>.content {
            transition-property: background-color, color, border-radius, margin;
            overflow: auto;
            border-radius: 0px;

            @apply bg-surface;
        }

        &>.navigation-drawer {}

        &:not(.nav-open)>.content {
            @apply ease-emphasized-accelerate duration-200;
        }

        &.nav-open {
            --content-view-content-margin: 8px;

            &>.content {
                @apply ease-emphasized-decelerate duration-400;
            }
        }
    }
}

/* Medium and above (not compact): content margins + rounded container.
   Breakpoints arrive as attributes on <html> from the media-query store —
   no hardcoded px here. The content element carries this component's scoped
   attribute, so the global html prefix composes with scoped matching. */
:global(html:not([compact])) .product-page-layout>.content-view {
    --content-view-content-margin: 8px;
}

:global(html:not([compact])) .product-page-layout>.content-view>.content {
    margin-top: 0px;
    margin-bottom: var(--content-view-content-margin);
    margin-left: var(--content-view-content-margin);
    margin-right: var(--content-view-content-margin);
    border-radius: 28px;
}

:global(html:not([compact])) .product-page-layout>.content-view>.navigation-drawer {
    margin-top: 0px;
    margin-bottom: var(--content-view-content-margin);
    margin-left: 0px;
    margin-right: 0px;
}

/* Expanded and above: the document scrolls instead of the inner content
   pane, and the header sticks to the viewport top. Breakpoints arrive as
   attributes on <html> from the media-query store — no hardcoded px here. */
html:is([expanded], [large], [extra-large]) .product-page-layout {
    max-height: none;
    overflow: visible;

    &>.content-view {
        max-height: none;
        overflow: visible;

        &>:is(.content, .navigation-drawer) {
            max-height: none;
        }

        &>.content {
            overflow: visible;
            /* allow the 1fr column to shrink below the board's
               min-content width instead of blowing out horizontally */
            min-width: 0;
        }

        &>.navigation-drawer {
            align-self: start;
            position: sticky;
            top: var(--header-height);
            height: calc(100svh - var(--header-height));
            min-height: 0;
            max-height: calc(100svh - var(--header-height));
            overflow: auto;
        }
    }
}

/* The header may be slotted content from a page (not this component's own
   element), so it carries no scoped attribute — match it globally. */
:global(html:is([expanded], [large], [extra-large]) .product-page-layout > header) {
    position: sticky;
    top: 0;
    z-index: 10;
}
</style>
