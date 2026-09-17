<template>
    <SettingDialog
        :open="settingDialog.isOpen"
        @scrim-click="close"
    >
        <div class="setting-body">
            <nav
                class="setting-nav"
                aria-label="Settings sections"
            >
                <template
                    v-for="section in sections"
                    :key="section.title"
                >
                    <p class="nav-group">{{ section.title }}</p>
                    <button
                        v-for="item in section.items"
                        :key="item.id"
                        type="button"
                        :class="['nav-item', { active: item.id === activeId }]"
                        :aria-current="item.id === activeId ? 'page' : undefined"
                        @click="activeId = item.id"
                    >
                        <Icon :name="item.icon" />
                        <span class="nav-label">{{ item.label }}</span>
                    </button>
                </template>
            </nav>

            <div class="setting-content">
                <div class="content-header">
                    <h2 class="content-title">{{ activeLabel }}</h2>
                    <md-icon-button
                        aria-label="Close settings"
                        @click="close"
                    >
                        <Icon name="close" />
                    </md-icon-button>
                </div>

                <div class="row">
                    <div class="row-text">
                        <p class="row-title">Dark theme</p>
                        <p class="row-desc">Use a dark color scheme across the app.</p>
                    </div>
                    <md-switch
                        aria-label="Dark theme"
                        :selected="theme.isDark"
                        @click.prevent="theme.updateIsDark(!theme.isDark)"
                    ></md-switch>
                </div>

                <div class="row">
                    <div class="row-text">
                        <p class="row-title">Theme style</p>
                        <p class="row-desc">How expressive the generated color scheme is.</p>
                    </div>
                    <button
                        id="appearance-variant-anchor"
                        type="button"
                        class="value-button"
                        @click="openMenu(variantMenuRef)"
                    >
                        <span>{{ variantLabel }}</span>
                        <Icon name="keyboard_arrow_down" />
                    </button>
                </div>

                <div class="row">
                    <div class="row-text">
                        <p class="row-title">Contrast level</p>
                        <p class="row-desc">How much contrast text and surfaces have.</p>
                    </div>
                    <button
                        id="appearance-contrast-anchor"
                        type="button"
                        class="value-button"
                        @click="openMenu(contrastMenuRef)"
                    >
                        <span>{{ contrastLabel }}</span>
                        <Icon name="keyboard_arrow_down" />
                    </button>
                </div>

                <div class="row row-column">
                    <div class="slider-head">
                        <p class="row-title">Seed color hue</p>
                        <span class="row-value">{{ Math.round(theme.hue) }}°</span>
                    </div>
                    <md-slider
                        min="0"
                        max="360"
                        step="1"
                        :value="Math.round(theme.hue)"
                        aria-label="Seed color hue"
                        @input="onHueInput"
                    ></md-slider>
                </div>

                <div class="row row-column">
                    <div class="slider-head">
                        <p class="row-title">Seed color chroma</p>
                        <span class="row-value">{{ Math.round(theme.chroma) }}</span>
                    </div>
                    <md-slider
                        min="0"
                        max="150"
                        step="1"
                        :value="Math.round(theme.chroma)"
                        aria-label="Seed color chroma"
                        @input="onChromaInput"
                    ></md-slider>
                </div>

                <div class="row row-column">
                    <div class="slider-head">
                        <p class="row-title">Seed color tone</p>
                        <span class="row-value">{{ Math.round(theme.tone) }}</span>
                    </div>
                    <md-slider
                        min="0"
                        max="100"
                        step="1"
                        :value="Math.round(theme.tone)"
                        aria-label="Seed color tone"
                        @input="onToneInput"
                    ></md-slider>
                </div>
            </div>
        </div>
    </SettingDialog>

    <Teleport to="body">
        <md-menu
            ref="variantMenuRef"
            anchor="appearance-variant-anchor"
            positioning="document"
        >
            <md-menu-item
                v-for="option in variantOptions"
                :key="option.label"
                @click="() => theme.updateVariant(option.value)"
            >
                <div slot="headline">{{ option.label }}</div>
            </md-menu-item>
        </md-menu>

        <md-menu
            ref="contrastMenuRef"
            anchor="appearance-contrast-anchor"
            positioning="document"
        >
            <md-menu-item
                v-for="option in contrastOptions"
                :key="option.label"
                @click="() => theme.updateContrastLevel(option.value)"
            >
                <div slot="headline">{{ option.label }}</div>
            </md-menu-item>
        </md-menu>
    </Teleport>
</template>

<script setup lang="ts">
import Icon from '@components/Icon.vue'
import SettingDialog from '@components/task-sidebar/SettingDialog.vue'
import { useMaterialThemeStore } from '@stores/material-theme'
import { useSettingDialog } from '@stores/setting-dialog'
import type { MdMenu, MdSlider } from '@material/web/all'
import { MaterialContrastLevel, MaterialVariant } from '@sandlada/mcu-helper'
import type { TMaterialContrastLevel, TMaterialVariant } from '@sandlada/mcu-helper'
import { computed, onBeforeUnmount, ref, watch } from 'vue'

interface ISettingItem {
    id: string
    label: string
    icon: string
}

interface ISettingSection {
    title: string
    items: Array<ISettingItem>
}

interface ISettingOption<T> {
    value: T
    label: string
}

// Layout: owns dialog chrome + nav selection, dispatches theme writes to
// the material-theme store (which persists). Row/menu markup stays inline
// here instead of one-file-per-element components.
const settingDialog = useSettingDialog()
const theme = useMaterialThemeStore()

const sections: Array<ISettingSection> = [
    { title: 'General', items: [{ id: 'appearance', label: 'Appearance', icon: 'palette' }] },
]

const activeId = ref('appearance')
const activeLabel = computed(() => sections
    .flatMap((section) => section.items)
    .find((item) => item.id === activeId.value)?.label ?? 'Appearance')

const variantOptions: Array<ISettingOption<TMaterialVariant>> = [
    { value: MaterialVariant.Monochrome, label: 'Monochrome' },
    { value: MaterialVariant.Neutral, label: 'Neutral' },
    { value: MaterialVariant.TonalSpot, label: 'Tonal spot' },
    { value: MaterialVariant.Vibrant, label: 'Vibrant' },
    { value: MaterialVariant.Expressive, label: 'Expressive' },
    { value: MaterialVariant.Fidelity, label: 'Fidelity' },
    { value: MaterialVariant.Content, label: 'Content' },
    { value: MaterialVariant.Rainbow, label: 'Rainbow' },
    { value: MaterialVariant.FruitSalad, label: 'Fruit salad' },
]

const contrastOptions: Array<ISettingOption<TMaterialContrastLevel>> = [
    { value: MaterialContrastLevel.Reduced, label: 'Reduced' },
    { value: MaterialContrastLevel.Default, label: 'Default' },
    { value: MaterialContrastLevel.Medium, label: 'Medium' },
    { value: MaterialContrastLevel.High, label: 'High' },
]

const variantLabel = computed(() => variantOptions
    .find((option) => option.value === theme.variant)?.label ?? 'Content')
const contrastLabel = computed(() => contrastOptions
    .find((option) => option.value === theme.contrastLevel)?.label ?? 'Default')

const variantMenuRef = ref<MdMenu | null>(null)
const contrastMenuRef = ref<MdMenu | null>(null)

function openMenu(menu: MdMenu | null) {
    if (menu) menu.open = true
}

function close() {
    settingDialog.toggle(false)
}

function onKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') close()
}

watch(() => settingDialog.isOpen, (open) => {
    if (open) window.addEventListener('keydown', onKeydown)
    else window.removeEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
    window.removeEventListener('keydown', onKeydown)
})

function onHueInput(e: Event) {
    theme.updateHue(Number((e.target as MdSlider).value))
}

function onChromaInput(e: Event) {
    theme.updateChroma(Number((e.target as MdSlider).value))
}

function onToneInput(e: Event) {
    theme.updateTone(Number((e.target as MdSlider).value))
}
</script>

<style scoped>
@reference "@styles/tailwind.css";

.setting-body {
    display: grid;
    grid-template-columns: 220px minmax(0, 1fr);
    height: 100%;
    min-height: 0;
}

.setting-nav {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 12px;
    overflow-y: auto;
    border-right: 1px solid var(--md-sys-color-outline-variant);
}

.nav-group {
    margin: 0;
    padding: 8px 12px 4px;
    font-size: 12px;
    line-height: 16px;
    @apply text-on-surface-variant;
}

.nav-item {
    all: unset;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    gap: 12px;
    min-height: 40px;
    padding: 0 12px;
    border-radius: 8px;
    cursor: pointer;
    user-select: none;
    --md-icon-size: 20px;
    @apply text-on-surface;

    & .nav-label {
        @apply label-medium;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    &.active {
        @apply bg-surface-container text-on-surface;

        & .nav-label {
            font-weight: 500;
        }
    }
}

.setting-content {
    min-width: 0;
    overflow-y: auto;
    padding: 8px 24px 24px;
}

.content-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 0;
}

.content-title {
    margin: 0;
    font-size: 16px;
    line-height: 24px;
    font-weight: 500;
}

.row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 16px 0;

    & + .row {
        border-top: 1px solid var(--md-sys-color-outline-variant);
    }
}

.row-column {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
}

.row-text {
    min-width: 0;
}

.row-title {
    margin: 0;
    font-size: 16px;
    line-height: 24px;
}

.row-desc {
    margin: 4px 0 0;
    font-size: 14px;
    line-height: 20px;
    @apply text-on-surface-variant;
}

.row-value {
    font-size: 14px;
    line-height: 20px;
    font-variant-numeric: tabular-nums;
    @apply text-on-surface-variant;
}

.slider-head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 16px;
}

.value-button {
    all: unset;
    box-sizing: border-box;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 8px 4px 8px 12px;
    border-radius: 8px;
    cursor: pointer;
    white-space: nowrap;
    font-size: 14px;
    line-height: 20px;
    --md-icon-size: 20px;
    @apply text-on-surface-variant;

    &:hover {
        @apply bg-surface-container text-on-surface;
    }
}

md-slider {
    width: 100%;
}

/* Compact: single column, nav hidden (only one section exists). */
:root[compact] .setting-body {
    grid-template-columns: 1fr;
}

:root[compact] .setting-nav {
    display: none;
}

:root[compact] .setting-content {
    padding: 8px 16px 24px;
}
</style>
