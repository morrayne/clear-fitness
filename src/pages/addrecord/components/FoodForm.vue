<script setup lang="ts">
import { ref, watch, defineEmits } from "vue";

// ==== Тип данных ====
interface AssetData {
  id: string;
  mode: "temporary" | "constant";
  calculationMode: "per100g" | "inTotal";
  name: string;
  proteins: number;
  carbs: number;
  fats: number;
  kcal: number;
  portionSize: number;
}

// ==== emit для связи с родителем ====
const emit = defineEmits<{
  (e: "confirm", data: AssetData): void;
  (e: "addToBasket", data: AssetData): void;
}>();

// ==== Уникальный ID ====
const generateId = (): string => crypto.randomUUID();

// ==== Исходные данные ====
const assetData = ref<AssetData>({
  id: generateId(),
  mode: "temporary",
  calculationMode: "per100g",
  name: "",
  proteins: 0,
  carbs: 0,
  fats: 0,
  kcal: 0,
  portionSize: 100,
});

// ==== Расчёт калорий ====
const calculateKcal = (p: number, c: number, f: number) =>
  p * 4 + c * 4 + f * 9;

// Автоматический пересчёт калорий только при изменении БЖУ
watch(
  () => [assetData.value.proteins, assetData.value.carbs, assetData.value.fats],
  () => {
    const { proteins, carbs, fats } = assetData.value;
    assetData.value.kcal = calculateKcal(proteins, carbs, fats);
  }
);

// ==== Подтверждение ====
const confirm = () => {
  const data = { ...assetData.value };

  // Если временный продукт — просто в корзину
  if (data.mode === "temporary") {
    // аналогично per100g пересчёт
    if (data.calculationMode === "per100g") {
      const multiplier = data.portionSize / 100;
      data.proteins *= multiplier;
      data.carbs *= multiplier;
      data.fats *= multiplier;
      data.kcal = calculateKcal(data.proteins, data.carbs, data.fats);
    }

    emit("addToBasket", data);
    clear();
    return;
  }

  // Если постоянный продукт — сохраняем в Assets
  if (data.calculationMode === "per100g") {
    const multiplier = data.portionSize / 100;
    data.proteins *= multiplier;
    data.carbs *= multiplier;
    data.fats *= multiplier;
    data.kcal = calculateKcal(data.proteins, data.carbs, data.fats);
  }

  emit("confirm", data);
  clear();
};

// ==== Очистка ====
const clear = () => {
  assetData.value = {
    id: generateId(),
    mode: "temporary",
    calculationMode: "per100g",
    name: "",
    proteins: 0,
    carbs: 0,
    fats: 0,
    kcal: 0,
    portionSize: 100,
  };
};
</script>

<template>
  <div class="asset-form">
    <!-- Режим (temporary / constant) -->
    <div class="mode">
      <button
        type="button"
        :class="{ active: assetData.mode === 'temporary' }"
        @click="assetData.mode = 'temporary'"
      >
        disposable
      </button>
      <button
        type="button"
        :class="{ active: assetData.mode === 'constant' }"
        @click="assetData.mode = 'constant'"
      >
        overused
      </button>
    </div>

    <!-- Название -->
    <input type="text" placeholder="Name" v-model="assetData.name" />

    <!-- БЖУ -->
    <div class="mini">
      <input
        type="number"
        placeholder="Proteins"
        v-model.number="assetData.proteins"
      />
      <input
        type="number"
        placeholder="Carbs"
        v-model.number="assetData.carbs"
      />
      <input type="number" placeholder="Fats" v-model.number="assetData.fats" />
    </div>

    <!-- Калории (авто) -->
    <input
      type="number"
      placeholder="Calories"
      v-model.number="assetData.kcal"
      readonly
    />

    <!-- Режим расчёта -->
    <div class="mode">
      <button
        type="button"
        :class="{ active: assetData.calculationMode === 'per100g' }"
        @click="assetData.calculationMode = 'per100g'"
      >
        per 100 g
      </button>
      <button
        type="button"
        :class="{ active: assetData.calculationMode === 'inTotal' }"
        @click="assetData.calculationMode = 'inTotal'"
      >
        in total
      </button>
    </div>

    <!-- Размер порции -->
    <input
      type="number"
      placeholder="Portion size (g)"
      v-model.number="assetData.portionSize"
    />

    <!-- Кнопки -->
    <button class="confirm" @click="confirm">Confirm</button>
    <button class="clear" @click="clear">Clear</button>
  </div>
</template>
