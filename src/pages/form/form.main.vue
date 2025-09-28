<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import { useRouter } from "vue-router";

import inputHorizontal from "./components/inputHorizontal.vue";
import genderComponent from "./components/genderComponent.vue";
import tdeeComponent from "./components/tdeeComponent.vue";
import finalScreen from "./components/finalScreen.vue";

import { store, initDB } from "../../data/database.script";
import type { General, Macros } from "../../data/database.script";
import { calculateIntake } from "./form.script";

const router = useRouter();

// ВРЕМЕННОЕ ХРАНИЛИЩЕ ДАННЫХ
const intake = ref(0);
const tdee = ref(1.55);
const formData = reactive<General>({
  weight: 72.5,
  height: 180,
  age: 21,
  gender: "Male",
});

// ВЫЧИСЛЕНИЕ МАКРОСОВ
const macrosData = computed<Macros>(() =>
  calculateIntake({ ...formData, tdee: tdee.value }, intake.value)
);

// ЗАГРУЗКА ДАННЫХ ИЗ БД
async function loadData() {
  const general = await store.getItem<General>("general");
  const savedMacros = await store.getItem<Macros>("macros");

  if (general) Object.assign(formData, general);
  if (savedMacros) {
    intake.value = savedMacros.intake;
    tdee.value = savedMacros.tdee; 
  }
}

// ОБНОВЛЕНИЕ INTAKE ИЗ ДОЧЕРНЕГО КОМПОНЕНТА
function handleSaveMacros(newIntake: number) {
  intake.value = newIntake;
}

// НАВИГАЦИЯ МЕЖДУ СТРАНИЦАМИ ФОРМЫ
const currentPage = ref(0);
function goNext() {
  if (currentPage.value < 5) currentPage.value++;
}
function goBack() {
  if (currentPage.value === 0) router.push("/home");
  else currentPage.value--;
}
const transformStyle = computed(
  () => `translateX(calc(-${currentPage.value} * 100%))`
);

// СОХРАНЕНИЕ В БД
async function finish() {
  try {
    await store.setItem("general", { ...formData });
    await store.setItem("macros", { ...macrosData.value });
    router.push("/home");
  } catch (error) {
    console.error("Error saving data:", error);
  }
}

// ИНИЦИАЛИЗАЦИЯ ПРИ МОНТИРОВАНИИ
onMounted(async () => {
  await initDB();
  await loadData();
});
</script>

<template>
  <!-- prettier-ignore -->
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
        <tdeeComponent v-model="tdee" :active="tdee" />
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
        <finalScreen :form-data="formData" :macrosData="macrosData" @saveMacros="handleSaveMacros"/>
      </div>
    </div>

    <button class="next" v-if="currentPage !== 5" @click="goNext">Next</button>
    <button class="next" v-else @click="finish">Finish</button>
  </div>
</template>
