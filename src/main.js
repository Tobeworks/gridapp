import { createApp } from 'vue'
import PrimeVue from 'primevue/config'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import Aura from '@primevue/themes/aura';
//import 'primevue/resources/themes/lara-light-blue/theme.css'
//import 'primevue/resources/primevue.min.css'
//import 'primeicons/primeicons.css'

import App from './App.vue'

const app = createApp(App)
app.use(PrimeVue, {
    theme: {
        preset: Aura
    }
});
app.component('DataTable', DataTable)
app.component('Column', Column)
app.component('InputText', InputText)
app.component('Button', Button)


app.mount('#app')