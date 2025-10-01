<script setup lang="ts">
import { ref, onMounted } from "vue";
import summaryComponent from "./components/summaryComponent.vue";
import weekDataComponent from "./components/weekDataComponent.vue";
import newFoodComponent from "./components/newAssetComponent.vue";
import addDailyFoodComponent from "./components/addDailyFoodComponent.vue";
import todayIntakeComponent from "./components/todayIntakeComponent.vue";
import { useCalories } from "./callories.script";

const page = ref(0);
const { initDatabase } = useCalories();
const selectedDate = ref<string>("");

// СМЕНА СТРАНИЦЫ ПО ВЫБОРУ
const changePage = (newPage: number) => {
  page.value = newPage;
};

// ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ КОМПОНЕНТА
onMounted(() => {
  initDatabase();
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  selectedDate.value = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(
    now.getDate()
  )}`;
});

// ДИНАМИЧЕСКАЯ ДАТА ДЛЯ ЗАГОЛОВКА
const getCurrentDate = () => {
  const now = new Date();
  return {
    weekday: now.toLocaleDateString("en-US", { weekday: "long" }),
    month: now.toLocaleDateString("en-US", { month: "long" }),
    day: now.getDate(),
  };
};

// ПЕРЕВЫБОР ДАТЫ
const currentDate = getCurrentDate();
const handleOpenDay = (iso: string) => {
  selectedDate.value = iso;
};
</script>

<template>
  <!-- prettier-ignore -->
  <div class="callories-wrapper">
    <h1>
      <span>{{ currentDate.weekday }}, {{ currentDate.month }} {{ currentDate.day }}</span>
      <p>Nutrition & Targets</p>
    </h1>
    <weekDataComponent @open-day="handleOpenDay" />
    <summaryComponent :day="selectedDate" />
    <div class="cal-nav">
      <div class="cal-trio">
        <button :class="{ active: page === 0 }" @click="changePage(0)">
          Today intake
        </button>
        <button :class="{ active: page === 1 }" @click="changePage(1)">
          Use asset
        </button>
        <button :class="{ active: page === 2 }" @click="changePage(2)">
          Create asset
        </button>
      </div>
      <div class="screen">
        <div class="comp" :style="{ transform: `translateX(calc(-${page * 100}% - ${page * 8}px))` }">
          <todayIntakeComponent :day="selectedDate" />
        </div>
        <div class="comp" :style="{ transform: `translateX(calc(-${page * 100}% - ${page * 8}px))` }">
          <addDailyFoodComponent />
        </div>
        <div class="comp" :style="{ transform: `translateX(calc(-${page * 100}% - ${page * 8}px))` }">
          <newFoodComponent />
        </div>
      </div>
    </div>
  </div>
</template>
