<script setup lang="ts">
import { computed } from "vue";
import { useCalories } from "../callories.script";
import type { DailyFoodEntry } from "../callories.script";

// ПОЛУЧЕНИЕ ВЫБРАННОЙ ДАТЫ
const props = defineProps<{
  day: string; // YYYY-MM-DD
}>();

// ПОЛУЧЕНИЕ ПОЛНОГО ОБЪЕКТА ДАННЫХ ПО ДАТЕ
const { dailyEntries } = useCalories();
const entry = computed(() => dailyEntries.value.find((e) => e.date === props.day) || null );

// ВЫБЕЛЕНИЕ ИЗ ОБЪЕКТА ЕДЫ ДЛЯ ПОКАЗА
const foods = computed<DailyFoodEntry[]>(() => entry.value ? entry.value.foods : [] );
</script>

<template>
  <!-- pretiier-ignore -->
  <div class="today" v-if="foods.length !== 0">
    <div v-for="(foodEntry, idx) in foods" :key="foodEntry.id || idx" class="item">
      <div class="left"></div>
      <div class="right">
        <div class="top">
          <span>{{ foodEntry.foodItem.name }}</span>
          <p>{{ foodEntry.foodItem.portionSize }} g</p>
        </div>
        <div class="bot">
          <div class="kcal">{{ foodEntry.foodItem.calories }} kcal</div>
          <div class="p">{{ foodEntry.foodItem.protein }} p</div>
          <div class="c">{{ foodEntry.foodItem.carbs }} c</div>
          <div class="f">{{ foodEntry.foodItem.fat }} f</div>
        </div>
      </div>
    </div>
  </div>
  <div class="today" v-else style="justify-content: center; align-items: center;">
    Nothing to see here
  </div>
</template>
