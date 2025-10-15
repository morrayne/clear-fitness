<script setup lang="ts">
import { ref, onMounted, watch, computed } from "vue";
import localforage from "localforage";

interface WeekDay {
  day: number;
  label: string;
  dateKey: string;
}

interface Food {
  id: string | number;
  name: string;
  portionSize: number;
  proteins: number;
  carbs: number;
  fats: number;
  kcal: number;
}

// === Принимаем пропсы (дневные цели) ===
const props = defineProps<{
  data?: {
    kcal: number;
    proteins: number;
    fats: number;
    carbs: number;
  };
}>();

// === Эмит даты ===
const emit = defineEmits<{
  (e: "dateSelected", date: string): void;
}>();

const usermacros = ref<Food[]>([]);
const weekDays = ref<WeekDay[]>([]);
const activeDate = ref<string>("");

// ===== Формат даты ДД-ММ-ГГГГ =====
function formatDate(date: Date): string {
  return `${date.getDate().toString().padStart(2, "0")}-${(date.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${date.getFullYear()}`;
}

// ===== Генерация текущей недели =====
function generateWeek() {
  const today = new Date();
  const currentDay = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((currentDay + 6) % 7));

  const dayNames = ["M", "T", "W", "T", "F", "S", "S"];
  const week: WeekDay[] = [];

  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const label = dayNames[i] ?? "D";
    week.push({
      day: d.getDate(),
      label,
      dateKey: formatDate(d),
    });
  }

  weekDays.value = week;
  activeDate.value = formatDate(today);
}

// ===== Загрузка данных =====
async function loadDataByDate(date: string) {
  const stored = (await localforage.getItem<any[]>("userintakes")) || [];
  const dayData = stored.find((entry) => entry.date === date);
  usermacros.value = dayData?.foods || [];
}

// ===== При монтировании =====
onMounted(async () => {
  generateWeek();
  await loadDataByDate(activeDate.value);
  emit("dateSelected", activeDate.value);
});

// ===== Клик по дню =====
async function handleDayClick(date: string) {
  activeDate.value = date;
  await loadDataByDate(date);
  emit("dateSelected", date);
}

// ===== Сумма нутриентов за день =====
const totalMacros = computed(() => {
  if (!usermacros.value.length) return null;
  return usermacros.value.reduce(
    (acc, f) => {
      acc.kcal += f.kcal;
      acc.proteins += f.proteins;
      acc.carbs += f.carbs;
      acc.fats += f.fats;
      return acc;
    },
    { kcal: 0, proteins: 0, carbs: 0, fats: 0 }
  );
});

// ===== Ловим обновления пропса data =====
watch(
  () => props.data,
  (newVal) => {
    if (newVal) console.log("📊 Цели за день:", newVal);
  },
  { deep: true, immediate: true }
);
</script>

<template>
  <div class="weekmain">
    <div class="top">
      <div class="item" v-for="(day, i) in weekDays" :key="i" :class="{ active: day.dateKey === activeDate }" @click.prevent="handleDayClick(day.dateKey)">
        <p>{{ day.day }}</p>
        <span>{{ day.label }}</span>
      </div>
    </div>

    <div class="bot" v-if="totalMacros && props.data">
      <p>{{ totalMacros.kcal }} / {{ props.data.kcal }} kcal</p>
      <p>{{ totalMacros.proteins }} / {{ props.data.proteins }} p</p>
      <p>{{ totalMacros.carbs }} / {{ props.data.carbs }} c</p>
      <p>{{ totalMacros.fats }} / {{ props.data.fats }} f</p>
    </div>
  </div>
</template>
