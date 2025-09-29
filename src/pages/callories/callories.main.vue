<script setup lang="ts">
import { ref, onMounted } from "vue";
import summaryComponent from "./components/summaryComponent.vue"
import weekDataComponent from "./components/weekDataComponent.vue";
import newFoodComponent from "./components/newAssetComponent.vue";
import createPresetComponent from "./components/addDailyFoodComponent.vue";
import { useCalories } from "./callories.script";

const page = ref(0);
const { initDatabase } = useCalories();

const changePage = (newPage: number) => {
  page.value = newPage;
};

// Инициализация данных при загрузке компонента
onMounted(() => {
  initDatabase();
});

// Динамическая дата вместо хардкода
const getCurrentDate = () => {
  const now = new Date();
  return {
    weekday: now.toLocaleDateString('en-US', { weekday: 'long' }),
    month: now.toLocaleDateString('en-US', { month: 'long' }),
    day: now.getDate()
  };
};

const currentDate = getCurrentDate();
</script>

<template>
  <div class="callories-wrapper">
    <h1>
      <span>{{ currentDate.weekday }}, {{ currentDate.month }} {{ currentDate.day }}</span>
      <p>Nutrition & Targets</p>
    </h1>

    <weekDataComponent />

    <summaryComponent />

    <div class="something">
      <div class="trio">
        <button :class="{ active: page === 0 }" @click="changePage(0)">
          Add food
        </button>
        <button :class="{ active: page === 1 }" @click="changePage(1)">
          New asset
        </button>
      </div>

      <div class="screen">
        <div class="comp" :style="{ transform: `translateX(calc(-${page * 100}% - ${page * 8}px))` }">
          <createPresetComponent />
        </div>
        <div class="comp" :style="{ transform: `translateX(calc(-${page * 100}% - ${page * 8}px))` }">
          <newFoodComponent />
        </div>
      </div>
    </div>
  </div>
</template>