import { createApp, ref } from "vue";
import App from "../App.vue";
import router from "./router.ts";
import "../scss/main.css";

import { getUserData, setUser, type UserData } from "./database.ts";
import { getMacrosData, setMacros, type UserMacros } from "./database.ts";
import { getBodyData, setBodyData, type BodyData } from "./database.ts";

async function bootstrap() {
  // USER DATA
  let userdata: UserData | null = await getUserData();
  if (!userdata) {
    userdata = { userName: "Guest", isNew: true };
    await setUser(userdata);
  }
  const userRef = ref<UserData>(userdata);
  // USER MACROS
  let usermacros: UserMacros | null = await getMacrosData();
  if (!usermacros) {
    usermacros = {
      maintain: { kcal: 2713, proteins: 169.5, carbs: 339.1, fats: 75.3 },
      modify: { kcal: 3013, proteins: 188.3, carbs: 376.6, fats: 83.7 },
    };
    await setMacros(usermacros);
  }
  // USER BODY
  let userbody: BodyData | null = await getBodyData();
  if (!userbody) {
    userbody = {
      gender: "Male",
      age: { min: 16, max: 80, step: 1, current: 21, goal: 21 },
      height: { min: 140, max: 220, step: 1, current: 180, goal: 180 },
      weight: { min: 30, max: 110, step: 0.5, current: 72.5, goal: 85 },
      activity: {
        current: 1.55,
        all: [
          { text: "minimum", val: 1.2 },
          { text: "walking sometimes", val: 1.275 },
          { text: "low activity", val: 1.375 },
          { text: "medium activity", val: 1.55 },
          { text: "high activity", val: 1.725 },
          { text: "extreme activity", val: 1.9 },
        ],
      },
    };
    await setBodyData(userbody);
  }
  // DEFAULT
  const app = createApp(App);
  app.provide("userdata", userRef);
  app.use(router);
  app.mount("#app");
  if (userRef.value.userName === "Guest") {
    router.push("/nameform");
  } else if (userRef.value.userName !== "Guest" && userRef.value.isNew) {
    router.push("/bodydata");
  } else {
    router.push("/dashboard");
  }
}

bootstrap();
