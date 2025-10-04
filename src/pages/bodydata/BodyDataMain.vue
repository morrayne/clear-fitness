<script setup lang="ts">
import { ref, watch, computed, onMounted, toRaw, inject, type Ref } from "vue";
import CustomInput from "./components/customInput.vue";
import type { RangeValue, ActivityLevel, Macros, UserData } from "../../common/database";
import { getBodyData, setBodyData, setMacros, setUser } from "../../common/database";

// ===== ROUTER =====
import { useRouter } from "vue-router";
const router = useRouter();

// ===== INJECT USER =====
const user = inject<Ref<UserData | null>>("userdata");

// ===== TYPES =====
interface BodyData {
  gender: "Male" | "Female" | "Secret";
  age: RangeValue;
  height: RangeValue;
  weight: RangeValue;
  activity: {
    current: number;
    all: ActivityLevel[];
  };
}

// ===== STATE =====
const tempBody = ref<BodyData>({
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

// ===== ИНИЦИАЛИЗАЦИЯ ИЗ БД =====
onMounted(async () => {
  const savedBody = await getBodyData();
  if (savedBody) {
    tempBody.value = savedBody;
  } else {
    await setBodyData(tempBody.value);
  }
});

// ===== MACROS =====
const tempMacros = ref<{ maintain: Macros; modify: Macros }>({
  maintain: { kcal: 0, proteins: 0, fats: 0, carbs: 0 },
  modify: { kcal: 0, proteins: 0, fats: 0, carbs: 0 },
});

// ===== HELPERS =====
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
  return obj && Object.prototype.hasOwnProperty.call(obj, "value")
    ? obj.value
    : obj;
}

// ===== CALCULATE MACROS =====
function calculateMacros(body: typeof tempBody.value) {
  const currentWeight = body.weight.current;
  const goalWeight = body.weight.goal;
  const height = body.height.current;
  const age = body.age.current;
  const BMR =
    body.gender === "Male"
      ? 10 * currentWeight + 6.25 * height - 5 * age + 5
      : 10 * currentWeight + 6.25 * height - 5 * age - 161;
  const TDEE = BMR * body.activity.current;
  const maintainProteinsKcal = TDEE * 0.25;
  const maintainFatsKcal = TDEE * 0.25;
  const maintainCarbsKcal = TDEE - maintainProteinsKcal - maintainFatsKcal;
  const maintain = {
    kcal: Math.round(TDEE),
    proteins: +(maintainProteinsKcal / 4).toFixed(1),
    fats: +(maintainFatsKcal / 9).toFixed(1),
    carbs: +(maintainCarbsKcal / 4).toFixed(1),
  };

  const modifyTDEE = TDEE + (goalWeight > currentWeight ? 300 : -300);
  const modifyProteinsKcal = modifyTDEE * 0.25;
  const modifyFatsKcal = modifyTDEE * 0.25;
  const modifyCarbsKcal = modifyTDEE - modifyProteinsKcal - modifyFatsKcal;
  const modify = {
    kcal: Math.round(modifyTDEE),
    proteins: +(modifyProteinsKcal / 4).toFixed(1),
    fats: +(modifyFatsKcal / 9).toFixed(1),
    carbs: +(modifyCarbsKcal / 4).toFixed(1),
  };

  return { maintain, modify };
}

// ===== WATCHERS =====
watch(
  tempBody,
  (newVal) => {
    tempMacros.value = calculateMacros(newVal);
  },
  { deep: true, immediate: true }
);

// Привязка к шагу (step) для всех input
const trackedKeys: Array<[keyof BodyData, keyof RangeValue]> = [
  ["weight", "current"],
  ["weight", "goal"],
  ["height", "current"],
  ["age", "current"],
];

trackedKeys.forEach(([key, subKey]) => {
  watch(
    () => (tempBody.value[key] as RangeValue)[subKey],
    (v) => {
      const entry = tempBody.value[key] as RangeValue;
      const step = entry.step;
      const snapped = roundToStep(v, step);
      if (snapped !== v) entry[subKey] = snapped;
    }
  );
});

// ===== PAGINATION =====
const page = ref(0);
const pageTransition = computed(
  () => `translateX(calc(-${page.value * 100}% - ${page.value}rem))`
);
function goBack() {
  if (page.value > 0) page.value--;
}
function goNext() {
  if (page.value < 6) page.value++;
}

// ===== INPUT HELPERS =====
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
  tempBody.value.activity.current = val;
}

function changeGender(val: "Male" | "Female" | "Secret") {
  tempBody.value.gender = val;
}

// ===== FINISH =====
async function finish() {
  await setBodyData(toRaw(tempBody.value));
  await setMacros(toRaw(tempMacros.value));
  if (user && user.value) {
    user.value.isNew = false; 
    await setUser(toRaw(user.value));
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
          :min="tempBody.weight.min"
          :max="tempBody.weight.max"
          v-model.number="tempBody.weight.current"
          @input="onInput(tempBody, 'weight', $event, 'current')"
        />
        <CustomInput
          v-model="tempBody.weight.current"
          :min="tempBody.weight.min"
          :max="tempBody.weight.max"
          :step="tempBody.weight.step"
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
          :min="tempBody.weight.min"
          :max="tempBody.weight.max"
          v-model.number="tempBody.weight.goal"
          @input="onInput(tempBody, 'weight', $event, 'goal')"
        />
        <CustomInput
          v-model="tempBody.weight.goal"
          :min="tempBody.weight.min"
          :max="tempBody.weight.max"
          :step="tempBody.weight.step"
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
            v-for="g in ['Male', 'Female', 'Secret']"
            :key="g"
            :class="{ act: tempBody.gender === g }"
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
          :min="tempBody.height.min"
          :max="tempBody.height.max"
          v-model.number="tempBody.height.current"
          @input="onInput(tempBody, 'height', $event, 'current')"
        />
        <CustomInput
          v-model="tempBody.height.current"
          :min="tempBody.height.min"
          :max="tempBody.height.max"
          :step="tempBody.height.step"
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
          :min="tempBody.age.min"
          :max="tempBody.age.max"
          v-model.number="tempBody.age.current"
          @input="onInput(tempBody, 'age', $event, 'current')"
        />
        <CustomInput
          v-model="tempBody.age.current"
          :min="tempBody.age.min"
          :max="tempBody.age.max"
          :step="tempBody.age.step"
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
            v-for="value in tempBody.activity.all"
            :key="value.text"
            @click="changeActivity(value.val)"
            :class="{ act: value.val === tempBody.activity.current }"
          >
            {{ value.text }}
          </button>
        </div>
      </div>

      <!-- RESULTS -->
      <div class="page" :style="{ transform: pageTransition }">
        <h3>
          <span>Here’s what we think</span>
        </h3>
        <p>Maintain weight:</p>
        <p>{{ tempMacros.maintain.kcal }} kcal</p>
        <p>P: {{ tempMacros.maintain.proteins }}g</p>
        <p>F: {{ tempMacros.maintain.fats }}g</p>
        <p>C: {{ tempMacros.maintain.carbs }}g</p>

        <p>Goal adjustment:</p>
        <p>{{ tempMacros.modify.kcal }} kcal</p>
        <p>P: {{ tempMacros.modify.proteins }}g</p>
        <p>F: {{ tempMacros.modify.fats }}g</p>
        <p>C: {{ tempMacros.modify.carbs }}g</p>
      </div>
    </div>

    <button v-if="page !== 6" class="goNext" @click="goNext">Go Next</button>
    <button v-else class="goNext" @click="finish">Done</button>
  </div>
</template>
