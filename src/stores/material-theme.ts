import { Hct } from '@material/material-color-utilities'
import { MaterialContrastLevel, MaterialVariant, createTheme, toCSS, type TMaterialContrastLevel, type TMaterialVariant } from '@sandlada/mcu-helper'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const MaterialVariants = {
    Monochrome: 0,
    Neutral: 1,
    TonalSpot: 2,
    Vibrant: 3,
    Expressive: 4,
    Fidelity: 5,
    Content: 6,
    Rainbow: 7,
    FruitSalad: 8
}

const STORAGE_KEY = 'Symbol(__material-theme-configuration)'

type IPersistedTheme = {
    contrastLevel?: TMaterialContrastLevel
    isDark?: boolean
    variant?: TMaterialVariant
    hue?: number
    chroma?: number
    tone?: number
    hct?: { hue?: number, chroma?: number, tone?: number } | Hct
    configuration?: IPersistedTheme
}

function readPersisted(): IPersistedTheme | undefined {
    try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (!raw) return undefined
        const parsed = JSON.parse(raw ?? '{}') as IPersistedTheme
        // Old service saved `configuration` object directly, which may itself
        // contain the fields. Support both shapes.
        return parsed?.configuration ?? parsed
    } catch {
        return undefined
    }
}

function extractHct(persisted: IPersistedTheme | undefined): { hue: number, chroma: number, tone: number } {
    const fallback = { hue: 260, chroma: 50, tone: 90 }
    if (!persisted) return fallback
    const hct = persisted.hct as { hue?: number, chroma?: number, tone?: number } | undefined
    if (hct && (hct.hue !== undefined || hct.chroma !== undefined || hct.tone !== undefined)) {
        return {
            hue: hct.hue ?? fallback.hue,
            chroma: hct.chroma ?? fallback.chroma,
            tone: hct.tone ?? fallback.tone,
        }
    }
    return {
        hue: persisted.hue ?? fallback.hue,
        chroma: persisted.chroma ?? fallback.chroma,
        tone: persisted.tone ?? fallback.tone,
    }
}

export const useMaterialThemeStore = defineStore('material-theme', () => {
    const persisted = readPersisted()

    const contrastLevel = ref<TMaterialContrastLevel>(persisted?.contrastLevel ?? MaterialContrastLevel.Default)
    const isDark = ref<boolean>(persisted?.isDark ?? false)
    const variant = ref<TMaterialVariant>(persisted?.variant ?? MaterialVariant.Content)

    const initialHct = extractHct(persisted)
    const hue = ref<number>(initialHct.hue)
    const chroma = ref<number>(initialHct.chroma)
    const tone = ref<number>(initialHct.tone)

    const hct = computed(() => Hct.from(hue.value, chroma.value, tone.value))
    const hctToInt = computed(() => hct.value.toInt())

    const cssText = computed(() => {
        const theme = createTheme({
            oled: true,
            contrastLevel: contrastLevel.value,
            specVersion: '2025',
            variant: variant.value,
        })(hct.value)
        return toCSS({
            format: 'hex',
            includePalettes: false,
            includeRoot: true,
            includeTheme: true,
            wrapLightDark: true,
        })(theme)
    })

    function save() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({
                contrastLevel: contrastLevel.value,
                hct: { hue: hue.value, chroma: chroma.value, tone: tone.value },
                isDark: isDark.value,
                variant: variant.value,
            }))
        } catch {
            // ignore quota errors
        }
    }

    function updateContrastLevel(value: TMaterialContrastLevel) {
        contrastLevel.value = value
        save()
    }

    function updateIsDark(value: boolean) {
        isDark.value = value
        save()
    }

    function updateVariant(value: TMaterialVariant) {
        variant.value = value
        save()
    }

    function updateHue(value: number) {
        hue.value = value
        save()
    }

    function updateChroma(value: number) {
        chroma.value = value
        save()
    }

    function updateTone(value: number) {
        tone.value = value
        save()
    }

    function updateHct(value: Hct) {
        hue.value = value.hue
        chroma.value = value.chroma
        tone.value = value.tone
        save()
    }

    // Persist initial defaults so a fresh client has stable storage.
    save()

    return {
        contrastLevel,
        isDark,
        variant,
        hue,
        chroma,
        tone,
        hct,
        hctToInt,
        cssText,
        updateContrastLevel,
        updateIsDark,
        updateVariant,
        updateHue,
        updateChroma,
        updateTone,
        updateHct,
    }
})
