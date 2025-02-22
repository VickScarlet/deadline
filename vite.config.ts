import { defineConfig as defineViteConfig, mergeConfig } from 'vite'
import { defineConfig as defineVitestConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'

// https://vite.dev/config/
const viteConfig = defineViteConfig({
    plugins: [
        react(),
        svgr({
            svgrOptions: {
                // svgr options
            },
        }),
    ],
    resolve: {
        alias: {
            '@': '/src',
        },
    },
})

const vitestConfig = defineVitestConfig({
    test: {},
})

export default mergeConfig(viteConfig, vitestConfig)
