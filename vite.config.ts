import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
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
    ],
    base: '',
    build: {
        outDir: './build',
        emptyOutDir: true,
        assetsDir: 'assets',
        assetsInlineLimit: 4096,
        sourcemap: true,
        manifest: true,
        minify: true,
        cssMinify: true,
    },
    resolve: {
        alias: [
            {
                find: '@components',
                replacement: fileURLToPath(new URL('./src/components', import.meta.url))
            },
            {
                find: '@composables',
                replacement: fileURLToPath(new URL('./src/composables', import.meta.url))
            },
            {
                find: '@layouts',
                replacement: fileURLToPath(new URL('./src/layouts', import.meta.url))
            },
            {
                find: '@pages',
                replacement: fileURLToPath(new URL('./src/pages', import.meta.url))
            },
            {
                find: '@router',
                replacement: fileURLToPath(new URL('./src/router', import.meta.url))
            },
            {
                find: '@stores',
                replacement: fileURLToPath(new URL('./src/stores', import.meta.url))
            },
            {
                find: '@styles',
                replacement: fileURLToPath(new URL('./src/styles', import.meta.url))
            },
            {
                find: '@utils',
                replacement: fileURLToPath(new URL('./src/utils', import.meta.url))
            },
            {
                find: '@',
                replacement: fileURLToPath(new URL('./src/', import.meta.url))
            },
        ],
    },
}) satisfies UserConfig
