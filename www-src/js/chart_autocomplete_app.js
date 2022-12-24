import { createApp } from 'vue';
import ItemSelector from './components/Chart/ItemSelector.vue';

import '@oruga-ui/oruga-next/dist/oruga-full.css'
import '@mdi/font/css/materialdesignicons.min.css';

const app = createApp(ItemSelector);

app.mount("#item-selector-app");