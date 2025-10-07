<script setup lang="ts">
import { inject, type ComputedRef } from "vue";

interface MacrosResult {
  maintain: {
    weight: number;
    kcal: number;
    proteins: number;
    fats: number;
    carbs: number;
  };
  modify: {
    weight: number;
    kcal: number;
    proteins: number;
    fats: number;
    carbs: number;
  };
}

// Получаем как ComputedRef
const usermacros = inject<ComputedRef<MacrosResult>>("usermacros");

// Используем значение через .value
const goals = usermacros?.value?.modify || {
  weight: 0,
  kcal: 0,
  proteins: 0,
  fats: 0,
  carbs: 0,
};

const weekData = [
  {
    text: "M",
    day: 6,
  },
  {
    text: "T",
    day: 7,
  },
  {
    text: "W",
    day: 8,
  },
  {
    text: "T",
    day: 9,
  },
  {
    text: "F",
    day: 10,
  },
  {
    text: "S",
    day: 11,
  },
  {
    text: "S",
    day: 12,
  },
];
</script>

<template>
  <div class="intakes">
    <div class="top">
      <div class="goals">
        <div class="item">{{ goals.kcal }}</div>
        <div class="item">{{ goals.proteins }}</div>
        <div class="item">{{ goals.carbs }}</div>
        <div class="item">{{ goals.fats }}</div>
      </div>
      <div class="weekdays">
        <div class="day" v-for="value in weekData">
          <span>{{ value.day }}</span>
          <p>{{ value.text }}</p>
        </div>
      </div>
    </div>
    <div class="bot">
      <div class="page">
        <h2>Today's Intake</h2>
      </div>
      <div class="page">
        <h2>Default Base</h2>
      </div>
      <div class="page">
        <h2>Custom base</h2>
      </div>
    </div>
  </div>
</template>
