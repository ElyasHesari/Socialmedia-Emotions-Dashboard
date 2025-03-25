import { createApp } from "vue";
import axiosPlugin from "./plugins/axios";
import chartPlugin from "./plugins/chart";
import App from "./App.vue";
import "./style.css";

// Vuetify
import "vuetify/styles";
import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";
const vuetify = createVuetify({
  components,
  directives,
});

const app = createApp(App);
app.use(axiosPlugin);
app.use(chartPlugin);
app.use(vuetify);
app.mount("#app");
