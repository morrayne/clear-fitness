<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import { useRouter } from "vue-router";

import inputHorizontal from "./components/inputHorizontal.vue";
import genderComponent from "./components/genderComponent.vue";
import tdeeComponent from "./components/tdeeComponent.vue";
import finalScreen from "./components/finalScreen.vue";

import { store, initDB } from "../../data/database.script";

interface General {
  weight: number;
  height: number;
  age: number;
  gender: string;
}

interface Macros {
  kcal: number;
  tdee: number;
  intake: number;
  proteins: number;
  carbs: number;
  fats: number;
}

const router = useRouter();
const currentPage = ref(0);

// reactive объект формы
const formData = reactive<General & { tdee: number }>({
  weight: 72.5,
  height: 180,
  age: 21,
  gender: "Male",
  tdee: 1.55,
});

// reactive объект макросов
const macrosData = reactive<Macros>({
  kcal: 0,
  tdee: formData.tdee,
  intake: 0,
  proteins: 0,
  carbs: 0,
  fats: 0,
});

// ==================== Инициализация ====================
async function loadData() {
  const general = await store.getItem<General>("general");
  const macros = await store.getItem<Macros>("macros");

  if (general) Object.assign(formData, general);
  if (macros) Object.assign(macrosData, macros);
}

onMounted(async () => {
  await initDB();
  await loadData();
});

// ==================== Навигация ====================
const transformStyle = computed(() => `translateX(calc(-${currentPage.value} * 100%))`);

async function goBack() {
  if (currentPage.value === 0) router.push("/home");
  else currentPage.value--;
}

async function goNext() {
  currentPage.value++;
}

// ==================== Получение данных из финального экрана ====================
function handleSaveMacros(macros: Macros) {
  Object.assign(macrosData, macros);
}

// ==================== Сохранение ====================
async function finish() {
  try {
    await store.setItem("general", {
      weight: formData.weight,
      height: formData.height,
      age: formData.age,
      gender: formData.gender,
    });

    // Сохраняем plain object
    await store.setItem("macros", { ...macrosData });

    router.push("/home");
  } catch (error) {
    console.error("Error saving data:", error);
    alert("Error saving data. Please try again.");
  }
}

</script>

<template>
  <div class="form-wrapper">
    <button class="back" @click="goBack">
      <img src="../../../public/svg/arrow-more.svg" />
    </button>

    <div class="form-pages">
      <!-- HEIGHT -->
      <div class="form-page" :style="{ transform: transformStyle, opacity: currentPage === 0 ? 1 : 0 }">
        <span class="form-span">
          <h2>What is your height?</h2>
          <p>approximately 1 cm = 0.4 inches</p>
        </span>
        <inputHorizontal v-model="formData.height" :min="120" :max="220" :step="1" :mod="0.4" :bigStep="10" text="cm" />
      </div>

      <!-- GENDER -->
      <div class="form-page" :style="{ transform: transformStyle, opacity: currentPage === 1 ? 1 : 0 }">
        <span class="form-span">
          <h2>Select Gender</h2>
          <p>Choose "Secret" to keep this information private</p>
        </span>
        <genderComponent v-model="formData.gender" :gender="formData.gender" />
      </div>

      <!-- TDEE -->
      <div class="form-page" :style="{ transform: transformStyle, opacity: currentPage === 2 ? 1 : 0 }">
        <span class="form-span form-span-a">
          <h2>How active your lifestyle is?</h2>
          <p>This needs to be changed manually if anything</p>
        </span>
        <tdeeComponent v-model="formData.tdee" :active="formData.tdee" />
      </div>

      <!-- BODY WEIGHT -->
      <div class="form-page" :style="{ transform: transformStyle, opacity: currentPage === 3 ? 1 : 0 }">
        <span class="form-span">
          <h2>What is your body weight?</h2>
          <p>approximately 1 kg = 2.2 lbs</p>
        </span>
        <inputHorizontal v-model="formData.weight" :min="40" :max="120" :step="0.1" :mod="2.2" :bigStep="1" text="kg" />
      </div>

      <!-- AGE -->
      <div class="form-page" :style="{ transform: transformStyle, opacity: currentPage === 4 ? 1 : 0 }">
        <span class="form-span">
          <h2>What is your age?</h2>
          <p>This needs to be changed every birthday</p>
        </span>
        <inputHorizontal v-model="formData.age" :min="14" :max="80" :step="1" :mod="1" :bigStep="10" text="years" />
      </div>

      <!-- FINAL SCREEN -->
      <div class="form-page" :style="{ transform: transformStyle, opacity: currentPage === 5 ? 1 : 0 }">
        <span class="form-span">
          <h2>Here's what we think</h2>
          <p>You can modify your intake depending on your goals</p>
        </span>
        <finalScreen :form-data="formData" @saveMacros="handleSaveMacros" />
      </div>
    </div>

    <button class="next" v-if="currentPage !== 5" @click="goNext">Next</button>
    <button class="next" v-else @click="finish">Finish</button>
  </div>
</template>
