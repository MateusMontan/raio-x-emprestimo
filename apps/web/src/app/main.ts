import '@fontsource/atkinson-hyperlegible-next/latin-400.css';
import '@fontsource/atkinson-hyperlegible-next/latin-700.css';
import '@fontsource/atkinson-hyperlegible-next/latin-800.css';
import '../design/tokens.css';
import '../design/base.css';

import { createApp } from 'vue';
import App from './App.vue';
import { createAppRouter } from './router';

createApp(App).use(createAppRouter()).mount('#app');
