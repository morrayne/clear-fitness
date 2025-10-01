<script setup lang="ts">
import { computed, ref } from "vue";
import { useCalories } from "../callories.script";

const emit = defineEmits<{ (e: 'open-day', iso: string): void }>();
const { dailyEntries } = useCalories();

interface WeekData {
  name: string;
  date: number;
  iso: string;
  highlight: boolean;
  goalsFinished: number;
}

// ФОРМАТИРОВАНИЕ ДАТЫ
const pad = (n: number) => String(n).padStart(2, '0');
const formatISO = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

const today = new Date();
const todayISO = formatISO(today);

// ВЫЧИСЛЕНИЕ НАЧАЛА НЕДЕЛИ (ПОНДЕЛЬНИКА), ЧТО БЫ ПОСТАВИТЬ ЕГО ВЛЕВО
const dayIndex = (today.getDay() + 6) % 7;
const startOfWeek = new Date(today);
startOfWeek.setDate(today.getDate() - dayIndex);

// ПО УМОЛЧАНИЮ ДАТА ЭТО СЕГОДНЯ
const selectedDate = ref<string>(todayISO);

// ОБЪЕКТ ИНФОРМАЦИИ ПО НЕДЕЛЕ
const weekData = computed<WeekData[]>(() =>
  Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    const iso = formatISO(d);
    const entry = dailyEntries.value.find((e) => e.date === iso);
    const kcalGoal = 2000;
    const goalsFinished = entry ? Math.min(100, (entry.totalCalories / kcalGoal) * 100) : 0;
    return {
      name: d.toLocaleDateString("en-US", { weekday: "narrow" }),
      date: d.getDate(),
      iso,
      highlight: iso === todayISO,
      goalsFinished,
    };
  })
);

// ВЫБОР ДНЯ ДЛЯ ОТОБРАЖЕНИЯ
const openDay = (day: WeekData) => {
  selectedDate.value = day.iso;
  emit('open-day', day.iso);
};
</script>

<template>
  <!-- prettier-ignore -->
  <div class="week-holder">
    <div v-for="value in weekData" :key="value.iso" class="item" :class="{ active: selectedDate === value.iso, today: value.highlight }" @click="openDay(value)">
      <span>{{ value.name }}</span>
      <p>{{ value.date }}</p>
    </div>
  </div>
</template>
