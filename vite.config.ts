import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'url'
import { defineConfig, type UserConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        tailwindcss(),
        vue({
            template: {
                compilerOptions: {
                    isCustomElement: (tag: string): boolean => tag.startsWith('md') || tag.startsWith('lottie-player')
                }
            }
        }),
        vueJsx({
            isCustomElement: (tag: string): boolean => tag.startsWith('md-') || tag.startsWith('lottie-player')
        })
    ],
    base: '/to-do',
    build: {
        outDir: './docs',
        emptyOutDir: true,
        assetsDir: 'assets',
        assetsInlineLimit: 4096,
        sourcemap: true,
        manifest: true,
    },
    resolve: {
        alias: [
            {
                find: '@',
                replacement: fileURLToPath(new URL('./src/', import.meta.url))
            },
        ],
    },
}) satisfies UserConfig as UserConfig
