<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import Card from "./components/card.vue";
import localforage from "localforage";
import type { Macros } from "../../data/database.script"; // <-- добавляем тип

interface CardItem {
  text: string;
  time: string;
  value: number;
  measurement: string;
}

const store = localforage.createInstance({ name: "myAppDB" });
const cards = ref<CardItem[]>([]);

// Загружаем данные из базы при монтировании
onMounted(async () => {
  try {
    const macros = await store.getItem<Macros>("macros"); // ✅ типизация

    if (macros) {
      cards.value = [
        {
          text: "Daily Calories",
          time: "target",
          value: macros.kcal,
          measurement: "kcal",
        },
        {
          text: "Protein Goal",
          time: "daily",
          value: macros.proteins,
          measurement: "g",
        },
        {
          text: "Intake Adjustment",
          time: "current",
          value: macros.intake,
          measurement: "%",
        },
      ];

      console.log("Macros data loaded:", macros);
    } else {
      // Дефолтные значения если база пустая
      cards.value = [
        { text: "No data", time: "Please complete setup", value: 0, measurement: "kcal" },
        { text: "No data", time: "Please complete setup", value: 0, measurement: "g" },
        { text: "No data", time: "Please complete setup", value: 0, measurement: "%" },
      ];
    }
  } catch (error) {
    console.error("Error loading macros:", error);
  }
});

// ✅ реактивные computed-поля вместо "среза"
const firstTwoItems = computed<CardItem[]>(() => cards.value.slice(0, 2));
const otheritem = computed<CardItem | undefined>(() => cards.value[2]);
</script>

<template>
  <div class="home">
    <div class="duo">
      <Card
        v-for="(item, index) in firstTwoItems"
        :key="index"
        :card="item"
      />
    </div>
    <Card v-if="otheritem" :card="otheritem" />
  </div>
</template>
  