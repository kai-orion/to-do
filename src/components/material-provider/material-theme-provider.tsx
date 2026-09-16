import { defineComponent, onMounted, watch } from 'vue'
import { useMaterialThemeStore } from '../../stores/material-theme'

export const MaterialThemeProvider = defineComponent({
    name: 'MaterialThemeProvider',
    setup(_, { slots }) {
        const theme = useMaterialThemeStore()

        function ensureStyleElement(host: HTMLElement): HTMLElement {
            let styleElement = host.querySelector('#material-theme-styles')
            if (!styleElement) {
                styleElement = document.createElement('style')
                styleElement.setAttribute('id', 'material-theme-styles')
                host.appendChild(styleElement)
            }
            return styleElement as HTMLElement
        }

        function applyTheme(host: HTMLElement) {
            const styleElement = ensureStyleElement(host)
            styleElement.textContent = `.material-theme-provider-scoped, :root {${theme.cssText}}`
            document.documentElement.toggleAttribute('dark', theme.isDark)
        }

        let hostRef: HTMLElement | null = null

        onMounted(() => {
            if (hostRef) {
                applyTheme(hostRef)
            }
        })

        watch(
            () => [theme.cssText, theme.isDark],
            () => {
                if (hostRef) {
                    applyTheme(hostRef)
                }
            }
        )

        return () => (
            <div
                class="material-theme-provider-scoped"
                ref={(el: unknown) => { hostRef = el as HTMLElement | null }}
            >
                {slots.default && slots.default()}
            </div>
        )
    }
})
