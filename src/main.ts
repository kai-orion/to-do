// Vue
import { createApp } from 'vue'
import App from '@/App.vue'

/**
 * Vue-Router
 */
import { globalRouter } from '@router/index'

/**
 * Tailwindcss
 */
import '@styles/scrollbar.css'
import '@styles/tailwind.css'

/**
 * Google's Material Design
 */
import '@fontsource/noto-sans'
import '@material/web/all'
import 'material-symbols/outlined.css'

/**
 * Services
 */
import { createPinia } from 'pinia'

const app = createApp(App)
app
    .use(createPinia())
    .use(globalRouter)
    .mount('#app')
