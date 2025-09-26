<script setup lang="ts">
import inputHorizontal from "./components/inputHorizontal.vue";
import tdeeComponent from "./components/tdeeComponent.vue";
import genderComponent from "./components/genderComponent.vue";
import finalScreen from "./components/finalScreen.vue";
import { ref, reactive, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import localforage from "localforage";

import type { General, Macros } from "../../data/database.script";

const router = useRouter();
const currentPage = ref(0);

// LocalForage instance
const store = localforage.createInstance({ name: "myAppDB" });

// reactive объект формы
const formData = reactive<General & { tdee: number }>({
  weight: 71.5,
  height: 180,
  age: 21,
  gender: "Male",
  tdee: 1.55,
});

// Переменная для хранения данных макросов из finalScreen
const macrosData = ref<Macros | null>(null);

// ==================== Инициализация ====================
async function initDB() {
  const general = await store.getItem<General>("general");
  if (!general)
    await store.setItem("general", {
      weight: 71.5,
      height: 180,
      age: 21,
      gender: "Male",
    });

  const macros = await store.getItem<Macros>("macros");
  if (!macros)
    await store.setItem("macros", {
      kcal: 0,
      tdee: 1.55,
      intake: 0,
      proteins: 0,
      carbs: 0,
      fats: 0,
    });
}

// ==================== Загрузка данных ====================
async function loadData() {
  const general = await store.getItem<General>("general");
  const macros = await store.getItem<Macros>("macros");

  if (general) Object.assign(formData, general);
  if (macros) formData.tdee = macros.tdee;
}

// Функция для получения данных макросов из finalScreen
function setMacrosData(macros: Macros) {
  macrosData.value = macros;
}

// ==================== Монтирование ====================
onMounted(async () => {
  await initDB();
  await loadData();
});

// ==================== Навигация ====================
const transformStyle = computed(
  () => `translateX(calc(-${currentPage.value} * 100%))`
);

async function goBack() {
  if (currentPage.value === 0) router.push("/home");
  else currentPage.value--;
}

async function goNext() {
  currentPage.value++;
}

async function finish() {
  // Сохраняем ВСЕ данные только при нажатии Finish
  await saveAllData();
  router.push("/home");
}

// Функция сохранения ВСЕХ данных
async function saveAllData() {
  try {
    // Сохраняем общие данные
    await store.setItem("general", {
      weight: formData.weight,
      height: formData.height,
      age: formData.age,
      gender: formData.gender,
    });

    // Если есть данные макросов из finalScreen, сохраняем их
    if (macrosData.value) {
      await store.setItem("macros", macrosData.value);
    } else {
      // Или рассчитываем базовые макросы
      const baseMacros: Macros = {
        kcal: calculateBaseCalories(),
        tdee: formData.tdee,
        intake: 0,
        proteins: Math.round(formData.weight * 1.6),
        carbs: 0,
        fats: Math.round(formData.weight * 0.9),
      };
      await store.setItem("macros", baseMacros);
    }

    // Показываем подтверждение
    const savedGeneral = await store.getItem<General>("general");
    const savedMacros = await store.getItem<Macros>("macros");

    console.log("Data saved to database:");
    console.log("General:", savedGeneral);
    console.log("Macros:", savedMacros);
  } catch (error) {
    console.error("Error saving data:", error);
    alert("Error saving data. Please try again.");
  }
}

// Вспомогательная функция для расчета базовых калорий
function calculateBaseCalories(): number {
  const data = formData;
  let genderNum = 0;
  if (data.gender === "Male") {
    genderNum = 5;
  } else if (data.gender === "Female") {
    genderNum = -161;
  } else {
    genderNum = -78;
  }
  const bmr = 10 * data.weight + 6.25 * data.height - 5 * data.age + genderNum;
  return Math.round(bmr * data.tdee);
}
</script>

<template>
  <div class="form-wrapper">
    <!-- BUTTON BACK -->
    <button class="back" @click="goBack">
      <img src="../../../public/svg/arrow-more.svg" />
    </button>

    <div class="form-pages">
      <!-- HEIGHT -->
      <div
        class="form-page"
        :style="{
          transform: transformStyle,
          opacity: currentPage === 0 ? 1 : 0,
        }"
      >
        <span class="form-span">
          <h2>What is your height?</h2>
          <p>approximately 1 cm = 0.4 inches</p>
        </span>
        <inputHorizontal
          v-model="formData.height"
          :min="120"
          :max="220"
          :step="1"
          :mod="0.4"
          :bigStep="10"
          text="cm"
        />
      </div>

      <!-- GENDER -->
      <div
        class="form-page"
        :style="{
          transform: transformStyle,
          opacity: currentPage === 1 ? 1 : 0,
        }"
      >
        <span class="form-span">
          <h2>Select Gender</h2>
          <p>Choose "Secret" to keep this information private</p>
        </span>
        <genderComponent v-model="formData.gender" :gender="formData.gender" />
      </div>

      <!-- TDEE -->
      <div
        class="form-page"
        :style="{
          transform: transformStyle,
          opacity: currentPage === 2 ? 1 : 0,
        }"
      >
        <span class="form-span form-span-a">
          <h2>How active your lifestyle is?</h2>
          <p>This needs to be changed manually if anything</p>
        </span>
        <tdeeComponent v-model="formData.tdee" :active="formData.tdee" />
      </div>
      <!-- BODY WEIGHT -->
      <div
        class="form-page"
        :style="{
          transform: transformStyle,
          opacity: currentPage === 3 ? 1 : 0,
        }"
      >
        <span class="form-span">
          <h2>What is your body weight?</h2>
          <p>approximately 1 kg = 2.2 lbs</p>
        </span>
        <inputHorizontal
          v-model="formData.weight"
          :min="40"
          :max="120"
          :step="0.1"
          :mod="2.2"
          :bigStep="1"
          text="kg"
        />
      </div>

      <!-- AGE -->
      <div
        class="form-page"
        :style="{
          transform: transformStyle,
          opacity: currentPage === 4 ? 1 : 0,
        }"
      >
        <span class="form-span">
          <h2>What is your age?</h2>
          <p>This needs to be changed every birthday</p>
        </span>
        <inputHorizontal
          v-model="formData.age"
          :min="14"
          :max="80"
          :step="1"
          :mod="1"
          :bigStep="10"
          text="years"
        />
      </div>

      <!-- FINAL SCREEN -->
      <div
        class="form-page"
        :style="{
          transform: transformStyle,
          opacity: currentPage === 5 ? 1 : 0,
        }"
      >
        <span class="form-span">
          <h2>Here's what we think</h2>
          <p>You can modify your intake depending on your goals</p>
        </span>
        <finalScreen :form-data="formData" @save-macros="setMacrosData" />
      </div>
    </div>

    <!-- BUTTON NEXT AND FINAL -->
    <button class="next" v-if="currentPage !== 5" @click="goNext">Next</button>
    <button class="next" v-else @click="finish">Finish</button>
  </div>
</template>
