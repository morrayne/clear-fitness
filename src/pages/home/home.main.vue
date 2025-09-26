<script setup lang="ts">
import Card from "./components/card.vue";

// Вместо mesuarment используйте measurement
interface CardItem {
  textEN: string;
  textRU: string;
  timeEN: string;
  timeRU: string;
  value: number;
  measurement: string;
}

const data: CardItem[] = [
  {
    textEN: "Weight Trend",
    textRU: "Весовой тренд",
    timeEN: "last 7 days",
    timeRU: "за последние 7 дней",
    value: 71.5,
    measurement: "kg",
  },
  {
    textEN: "Macros goal",
    textRU: "БЖУ цель",
    timeEN: "last 3 days",
    timeRU: "за последние 3 дня",
    value: 2775,
    measurement: "kcal",
  },
  {
    textEN: "Progressieve overload",
    textRU: "Прогресс весов",
    timeEN: "last 30 days",
    timeRU: "за последние 30 дней",
    value: 2775,
    measurement: "kg",
  },
];

const firstTwoItems = data.slice(0, 2);
const otheritem = data[2];
</script>

<template>
  <div class="home">
    <div class="duo">
      <Card v-for="(item, index) in firstTwoItems" :key="index" :card="item" />
    </div>
    <Card :card="otheritem as CardItem" />
  </div>
</template>
