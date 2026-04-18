import { defineConfig } from 'vite'

export default defineConfig({
    base: '/labb2-front-server/',
    build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        about: 'about.html',
        add: 'add.html',
      }
    }
  }
})