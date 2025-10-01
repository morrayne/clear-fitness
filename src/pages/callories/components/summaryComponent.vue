<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useCalories } from "../callories.script";
import { getMacros, type Macros } from "../../../data/database.script";
const { dailyEntries } = useCalories();

const props = defineProps<{
  day: string; // формат YYYY-MM-DD
}>();

const goals = ref<Macros | null>(null);

// ЗНАЧЕНИЯ БЖУ ПО ВЫБРАННОМУ ДНЮ
const dayTotals = computed(() => {
  const entry = dailyEntries.value.find((e) => e.date === props.day);
  if (!entry) {
    return { calories: 0, protein: 0, carbs: 0, fat: 0 };
  }
  return {
    calories: entry.totalCalories,
    protein: entry.totalProtein,
    carbs: entry.totalCarbs,
    fat: entry.totalFat,
  };
});

// РАСЧЕТ ШИРИНЫ С УЧЕТОМ ЗНАЧЕНИЙ
function adjustWidth(have: number, goal: number | undefined) {
  if (!goal || goal === 0) return 0;
  return Math.min((have / goal) * 100, 100);
}
onMounted(async () => {
  goals.value = await getMacros();
});
</script>

<template>
  <!-- prettier-ignore -->
  <div class="summary-row">
    <div class="macro-item">
      <p> K {{ dayTotals.calories }} / {{ goals?.kcal || 0 }} </p>
      <div class="bar"></div>
      <div class="bar kcal" :style="{ width: `${adjustWidth(dayTotals.calories, goals?.kcal)}%` }"></div>
    </div>
    <div class="macro-item">
      <p> P {{ (dayTotals.protein ?? 0).toFixed(1) }} / {{ goals?.proteins || 0 }} </p>
      <div class="bar"></div>
      <div class="bar p" :style="{ width: `${adjustWidth(dayTotals.protein, goals?.proteins)}%` }"></div>
    </div>
    <div class="macro-item">
      <p> C {{ (dayTotals.carbs ?? 0).toFixed(1) }} / {{ goals?.carbs || 0 }} </p>
      <div class="bar"></div>
      <div class="bar c" :style="{ width: `${adjustWidth(dayTotals.carbs, goals?.carbs)}%` }"></div>
    </div>
    <div class="macro-item">
      <p> F {{ (dayTotals.fat ?? 0).toFixed(1) }} / {{ goals?.fats || 0 }} </p>
      <div class="bar"></div>
      <div class="bar f" :style="{ width: `${adjustWidth(dayTotals.fat, goals?.fats)}%` }"></div>
    </div>
  </div>
</template>
