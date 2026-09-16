<template>
    <div
        class="accordion"
        ref="accordionRef"
    >

        <span
            class="header"
            @click="accordionClick"
        >
            <span class="headline">{{ props.headline }}</span>
            <span class="description">{{ props.description }}</span>
            <md-icon-button class="action">
                <md-icon class="icon">stat_minus_1</md-icon>
            </md-icon-button>
        </span>

        <div class="content">
            <slot></slot>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

const props = withDefaults(defineProps<{
    headline: string
    description?: string
    isDefaultOpen?: boolean
}>(), {
    description: '',
    isDefaultOpen: false
})

const cancelAnimations = ref(new AbortController())
const maxHeight = ref('900px')
const accordionRef = ref<HTMLElement | null>(null)

const accordionClick = async () => {
    accordionRef.value?.classList.toggle('open')
    accordionRef.value?.dispatchEvent(new Event(accordionRef.value.classList.contains('open') ? 'open' : 'close'))
}


onMounted(() => {
    if (props.isDefaultOpen) {
        accordionRef.value?.classList.add('open')
        accordionRef.value?.dispatchEvent(new Event('open'))
    }
})


</script>

<style scoped>
@reference "../../styles/tailwind.css";
.accordion {
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: 1fr auto;

    &>.content {
        grid-column: 1/2;
        grid-row: 2/3;
    }

    &>.header {
        display: grid;
        grid-template-columns: 1fr 48px;
        grid-template-rows: 1fr 1fr auto;

        grid-column: 1/2;
        grid-row: 1/2;

        &>.headline {
            grid-column: 1/2;
            grid-row: 1/2;
        }

        &>.description {
            grid-column: 1/2;
            grid-row: 2/3;
        }

        &>.action {
            grid-column: 2/3;
            grid-row: 1/3;
            place-self: center;
        }
    }
}

.accordion {
    min-height: 72px;

    --_accordion-max-height: var(--accordion-max-height, 999px);

    --accordion-shape-edge: 24px;
    --accordion-shape: 12px;

    border-top-left-radius: var(--accordion-shape);
    border-top-right-radius: var(--accordion-shape);
    border-bottom-left-radius: var(--accordion-shape);
    border-bottom-right-radius: var(--accordion-shape);

    &:first-child {
        border-top-left-radius: var(--accordion-shape-edge);
        border-top-right-radius: var(--accordion-shape-edge);
    }

    &:last-child {
        border-bottom-left-radius: var(--accordion-shape-edge);
        border-bottom-right-radius: var(--accordion-shape-edge);
    }

    transition-property: background-color,
    color,
    padding-bottom;

    &:not(.open) {
        @apply bg-surface-container;

        &,
        &>.content {
            @apply ease-emphasized-accelerate duration-200;
        }

        &>.header {

            &>.headline {
                @apply text-on-surface;
            }

            &>.description {
                @apply text-on-surface-variant;
            }

            & .icon {
                transform: rotate(0deg);
            }
        }


        &>.content {
            overflow: hidden;
            max-height: 0px;
            transform: scaleY(0);
        }
    }

    &.open {
        @apply bg-secondary-container;

        &,
        &>.content {
            @apply ease-emphasized-decelerate duration-400;
        }

        &>.header {
            --margin-top: var(--padding-top);
            position: sticky;
            top: 0px;
            padding-top: calc(var(--margin-top));
            z-index: 1;

            @apply bg-secondary-container;

            & .icon {
                transform: rotate(180deg);
            }

            &>.headline,
            &>.description {
                @apply text-on-secondary-container;
            }
        }

        &>.content {
            overflow: auto;
            /* max-height: var(--_accordion-max-height); */
            transform: scaleY(1);
            padding-top: 8px;
            padding-bottom: var(--padding-bottom);
        }
    }

    &>.header {
        border-radius: inherit;

        &>:is(.header, .description) {
            display: block;
        }

        &>.headline {
            @apply text-title-medium;
        }

        &>.description {
            @apply text-body-medium;
        }

        & .icon {
            transition-property: transform;
            @apply ease-standard duration-300
        }
    }

    &>.content {
        display: block;
        height: inherit;
        transition-property: max-height, padding;
    }

    --padding-left: 24px;
    --padding-top: 12px;
    --padding-right: 24px;
    --padding-bottom: 16px;

    &>.header {
        padding-left: var(--padding-left);
        padding-right: var(--padding-right);
        padding-top: var(--padding-top);
        padding-bottom: var(--padding-bottom);
    }

    &>.content {
        padding-left: var(--padding-left);
        padding-right: var(--padding-right);
    }
}
</style>
