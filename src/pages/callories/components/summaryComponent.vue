<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useCalories } from "../callories.script";
import { getMacros, type Macros } from "../../../data/database.script";

const { getTodayEntries } = useCalories();

const goals = ref<Macros | null>(null);

onMounted(async () => {
  goals.value = await getMacros();
});

const todayTotals = computed(() => {
  const today = getTodayEntries();
  return {
    calories: today.totalCalories,
    protein: today.totalProtein,
    carbs: today.totalCarbs,
    fat: today.totalFat,
  };
});

function adjustWidth(have: number, goal: number | undefined) {
  if (!goal || goal === 0) return 0;
  const percentage = (have / goal) * 100;
  return Math.min(percentage, 100); // Ограничиваем максимум 100%
}
</script>

<template>
  <div class="summary-row">
    <div class="macro-item">
      <p>K {{ todayTotals.calories }} / {{ goals?.kcal || 0 }}</p>
      <div class="bar"></div>
      <div class="bar kcal" :style="{ width: `${adjustWidth(todayTotals.calories, goals?.kcal)}%` }"></div>
    </div>
    <div class="macro-item">
      <p>P {{ todayTotals.protein.toFixed(1) }} / {{ goals?.proteins || 0 }}</p>
      <div class="bar"></div>
      <div class="bar p" :style="{ width: `${adjustWidth(todayTotals.protein, goals?.proteins)}%` }"></div>
    </div>
    <div class="macro-item">
      <p>C {{ todayTotals.carbs.toFixed(1) }} / {{ goals?.carbs || 0 }}</p>
      <div class="bar"></div>
      <div class="bar c" :style="{ width: `${adjustWidth(todayTotals.carbs, goals?.carbs)}%` }"></div>
    </div>
    <div class="macro-item">
      <p>F {{ todayTotals.fat.toFixed(1) }} / {{ goals?.fats || 0 }}</p>
      <div class="bar"></div>
      <div class="bar f" :style="{ width: `${adjustWidth(todayTotals.fat, goals?.fats)}%` }"></div>
    </div>
  </div>
</template>