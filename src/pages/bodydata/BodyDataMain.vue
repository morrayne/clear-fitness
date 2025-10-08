<script setup lang="ts">
import type {
  RangeValue,
  UserData,
  UserMacros,
  BodyData, // просто импортируем теперь
} from "../../common/types";
import { ref, watch, computed, onMounted, toRaw, inject, type Ref, type ComputedRef } from "vue";
import { getBodyData, setBodyData, setUser, getUserData } from "../../common/database";
import CustomInput from "./components/customInput.vue";
import { useRouter } from "vue-router";


// ROUTER
const router = useRouter();

// INJECT (может быть undefined — делаем fallback)
const injectedUser = inject<Ref<UserData | null>>("userdata");
const injectedBody = inject<Ref<BodyData> | null>("userbody");
const injectedMacros = inject<ComputedRef<UserMacros> | null>("usermacros");

// Если провайдера нет — локальный реф (фолбек)
const localBody = ref<BodyData>({
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
});

// bodyRef — используй в шаблоне; это либо injected реф, либо локальный
const bodyRef = injectedBody ?? (localBody as Ref<BodyData>);

// macrosRef — либо injected computed, либо заглушка (ноль)
const macrosRef: ComputedRef<UserMacros> = injectedMacros ?? computed(() => ({
  maintain: { weight: 0, kcal: 0, proteins: 0, fats: 0, carbs: 0 },
  modify:   { weight: 0, kcal: 0, proteins: 0, fats: 0, carbs: 0 },
}));

// Если провайдера нет — подгружаем из БД при монтировании (fallback)
onMounted(async () => {
  if (!injectedBody) {
    const saved = await getBodyData();
    if (saved) {
      // приводим тип DB body к локальному BodyData (совпадают по структуре)
      (localBody as any).value = saved;
    } else {
      await setBodyData(toRaw(localBody.value as any));
    }
  }
});

// HELPERS для step-snapping
function decimalsCount(step: number) {
  const s = String(step);
  if (!s.includes(".")) return 0;
  return s.length - s.indexOf(".") - 1;
}
function roundToStep(value: number, step: number) {
  const rounded = Math.round(value / step) * step;
  const decimals = decimalsCount(step);
  return Number(rounded.toFixed(decimals));
}
function unwrapRef(obj: any) {
  return obj && Object.prototype.hasOwnProperty.call(obj, "value") ? obj.value : obj;
}

// WATCHERS: привязка к step для полей
const trackedKeys: Array<[keyof BodyData, keyof RangeValue]> = [
  ["weight", "current"],
  ["weight", "goal"],
  ["height", "current"],
  ["age", "current"],
];

trackedKeys.forEach(([key, subKey]) => {
  watch(
    () => ((bodyRef.value as any)[key] as RangeValue)[subKey],
    (v) => {
      const entry = (bodyRef.value as any)[key] as RangeValue;
      const step = entry.step;
      const snapped = roundToStep(v, step);
      if (snapped !== v) entry[subKey] = snapped;
    }
  );
});

// PAGINATION
const page = ref(0);
const pageTransition = computed(() => `translateX(calc(-${page.value * 100}% - ${page.value}rem))`);
function goBack() { if (page.value > 0) page.value--; }
function goNext() { if (page.value < 6) page.value++; }

// INPUT HELPERS
function onInput(obj: any, key: string, event: Event, subKey?: string) {
  const targetObj = unwrapRef(obj);
  const entry = targetObj[key];
  if (!entry) return;
  let value = parseFloat((event.target as HTMLInputElement).value);
  if (isNaN(value)) value = entry.min;
  const min = entry.min;
  const max = entry.max;
  value = Math.max(min, Math.min(max, value));
  const step = entry.step ?? 1;
  value = roundToStep(value, step);
  if (subKey) entry[subKey] = value;
  else targetObj[key] = value;
}

function changeActivity(val: number) {
  bodyRef.value.activity.current = val;
}
function changeGender(val: "Male" | "Female" | "Secret") {
  bodyRef.value.gender = val;
}

// FINISH: сохраняем body и обновляем userdata.isNew через injected user (если есть)
async function finish() {
  await setBodyData(toRaw(bodyRef.value as any));
  // если есть инжектed user — обновляем реф и бд
  if (injectedUser && injectedUser.value) {
    injectedUser.value.isNew = false;
    await setUser(toRaw(injectedUser.value));
  } else {
    // если инжекта нет, можно обновить напрямую в storage (опционально)
    const fallbackUser = await getUserData();
    if (fallbackUser) {
      fallbackUser.isNew = false;
      await setUser(fallbackUser);
    }
  }
  router.push("/dashboard");
}
</script>

<template>
  <div class="bodydata">
    <button class="goBack" @click="goBack">
      <img src="../../../public/svg/arrow-pointer.svg" alt="arrow-pointer" />
    </button>

    <div class="bodydata-main">
      <!-- WEIGHT CURRENT -->
      <div class="page" :style="{ transform: pageTransition }">
        <h3>
          <span>What is your</span>
          <p>Current Body Weight?</p>
        </h3>
        <input
          type="number"
          :min="bodyRef.weight.min"
          :max="bodyRef.weight.max"
          v-model.number="bodyRef.weight.current"
          @input="onInput(bodyRef, 'weight', $event, 'current')"
        />
        <CustomInput
          v-model="bodyRef.weight.current"
          :min="bodyRef.weight.min"
          :max="bodyRef.weight.max"
          :step="bodyRef.weight.step"
          text="kg"
          :bigStep="10"
          :mod="2.2"
        />
      </div>

      <!-- WEIGHT GOAL -->
      <div class="page" :style="{ transform: pageTransition }">
        <h3>
          <span>What is your</span>
          <p>Goal Body Weight?</p>
        </h3>
        <input
          type="number"
          :min="bodyRef.weight.min"
          :max="bodyRef.weight.max"
          v-model.number="bodyRef.weight.goal"
          @input="onInput(bodyRef, 'weight', $event, 'goal')"
        />
        <CustomInput
          v-model="bodyRef.weight.goal"
          :min="bodyRef.weight.min"
          :max="bodyRef.weight.max"
          :step="bodyRef.weight.step"
          text="kg"
          :bigStep="10"
          :mod="2.2"
        />
      </div>

      <!-- GENDER -->
      <div class="page" :style="{ transform: pageTransition }">
        <h3>
          <p>Who are you</p>
          <span>Man, Woman, or Secret?</span>
        </h3>
        <div class="gender-holder">
          <button
            v-for="g in ['Male','Female','Secret']"
            :key="g"
            :class="{ act: bodyRef.gender === g }"
            @click="changeGender(g as any)"
          >
            {{ g }}
          </button>
        </div>
      </div>

      <!-- HEIGHT -->
      <div class="page" :style="{ transform: pageTransition }">
        <h3>
          <span>What is your</span>
          <p>Height?</p>
        </h3>
        <input
          type="number"
          :min="bodyRef.height.min"
          :max="bodyRef.height.max"
          v-model.number="bodyRef.height.current"
          @input="onInput(bodyRef, 'height', $event, 'current')"
        />
        <CustomInput
          v-model="bodyRef.height.current"
          :min="bodyRef.height.min"
          :max="bodyRef.height.max"
          :step="bodyRef.height.step"
          text="cm"
          :bigStep="10"
          :mod="10"
        />
      </div>

      <!-- AGE -->
      <div class="page" :style="{ transform: pageTransition }">
        <h3>
          <span>What is your</span>
          <p>Current Age?</p>
        </h3>
        <input
          type="number"
          :min="bodyRef.age.min"
          :max="bodyRef.age.max"
          v-model.number="bodyRef.age.current"
          @input="onInput(bodyRef, 'age', $event, 'current')"
        />
        <CustomInput
          v-model="bodyRef.age.current"
          :min="bodyRef.age.min"
          :max="bodyRef.age.max"
          :step="bodyRef.age.step"
          text="years"
          :bigStep="10"
          :mod="1"
        />
      </div>

      <!-- ACTIVITY -->
      <div class="page" :style="{ transform: pageTransition }">
        <h3>
          <p>How active</p>
          <span>are you during your day?</span>
        </h3>
        <div class="active-holder">
          <button
            v-for="value in bodyRef.activity.all"
            :key="value.text"
            @click="changeActivity(value.val)"
            :class="{ act: value.val === bodyRef.activity.current }"
          >
            {{ value.text }}
          </button>
        </div>
      </div>

      <!-- RESULTS (берём макросы из provide/inject) -->
      <div class="page" :style="{ transform: pageTransition }">
        <h3><span>Here’s what we think</span></h3>

        <p>Maintain weight:</p>
        <p>{{ macrosRef.maintain.kcal }} kcal</p>
        <p>P: {{ macrosRef.maintain.proteins }}g</p>
        <p>F: {{ macrosRef.maintain.fats }}g</p>
        <p>C: {{ macrosRef.maintain.carbs }}g</p>

        <p>Goal adjustment:</p>
        <p>{{ macrosRef.modify.kcal }} kcal</p>
        <p>P: {{ macrosRef.modify.proteins }}g</p>
        <p>F: {{ macrosRef.modify.fats }}g</p>
        <p>C: {{ macrosRef.modify.carbs }}g</p>
      </div>
    </div>

    <button v-if="page !== 6" class="goNext" @click="goNext">Go Next</button>
    <button v-else class="goNext" @click="finish">Done</button>
  </div>
</template>
