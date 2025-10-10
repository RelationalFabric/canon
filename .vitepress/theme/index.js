import DefaultTheme from 'vitepress/theme'
import Radar from './radar.vue'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    // Register the radar component globally
    app.component('Radar', Radar)
  },
}
