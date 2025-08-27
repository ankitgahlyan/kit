import { resolve } from 'path';

import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
    plugins: [react(), tailwindcss()],
    build: {
        outDir: 'dist-extension',
        rollupOptions: {
            input: {
                popup: resolve(__dirname, 'index.html'),
                background: resolve(__dirname, 'src/extension/background.ts'),
                content: resolve(__dirname, 'src/extension/content.ts'),
            },
            output: {
                entryFileNames: '[name].js',
                chunkFileNames: '[name].js',
                assetFileNames: '[name].[ext]',
            },
        },
        target: 'esnext',
        minify: false, // Keep readable for development
    },
    define: {
        global: 'globalThis',
    },
});
