import { createApp, reactive, ref, watchEffect } from "vue";
import App from "../App.vue";
import router from "./router";
import "../scss/main.css";
import { setDefaultUserConfig, setDefaultUserBody, setDefaulFoodAssets, setUserMacros } from "./bootstraphelper";

async function bootstrap() {
  const userconfigData = await setDefaultUserConfig();
  const userbodyData = await setDefaultUserBody();
  const defaultfoodassetsData = await setDefaulFoodAssets();
  // REACTIVE
  const userconfig = reactive(userconfigData);
  const userbody = reactive(userbodyData);
  const defaultfoodassets = defaultfoodassetsData;
  const usermacros = ref<any>(null);
  watchEffect(async () => {
    usermacros.value = await setUserMacros();
  });
  // APP INIT
  const app = createApp(App);
  // PROVIDE
  app.provide("userconfig", userconfig);
  app.provide("userbody", userbody);
  app.provide("defaultfoodassets", defaultfoodassets);
  app.provide("usermacros", usermacros);
  // ROUTER
  app.use(router);
  app.mount("#app");
  // REDIRECT
  if (userconfig.general.name === "Guest" && userconfig.general.isNew) {
    router.push("/nameinput");
  } else if (userconfig.general.name !== "Guest" && userconfig.general.isNew) {
    router.push("/bodyinput");
  }
}

bootstrap();
