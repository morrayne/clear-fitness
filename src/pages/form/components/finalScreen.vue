<script setup lang="ts">
import { ref, computed, toRefs, watch } from "vue";
import inputHorizontal from "./inputHorizontal.vue";
import { calculateIntake } from "../form.script";

interface formDataType {
  weight: number;
  height: number;
  age: number;
  gender: string;
  tdee: number;
}

interface Macros {
  kcal: number;
  tdee: number;
  intake: number;
  proteins: number;
  carbs: number;
  fats: number;
}

const props = defineProps<{ formData: formDataType }>();
const { formData } = toRefs(props);
const preintake = ref(0);

const intakeMacros = computed(() => calculateIntake(formData.value, preintake.value));

const proteins = computed(() => intakeMacros.value.proteins);
const fats = computed(() => intakeMacros.value.fats);
const carbs = computed(() => intakeMacros.value.carbs);
const tdee = computed(() => intakeMacros.value.kcal);

const emit = defineEmits<{ (e: "saveMacros", macros: Macros): void }>();

// Автоматически эмитим макросы при изменениях
watch([() => preintake.value, () => formData.value], () => {
  emit("saveMacros", { ...intakeMacros.value });
}, { deep: true, immediate: true });

// ==================== Ширины ====================
const getBaseWidth = (value: number, total: number) => {
  if (total === 0) return "0%";
  return `${Math.round((value / total) * 1000) / 10}%`;
};
</script>

<template>
  <div class="final">
    <p v-if="preintake === 0">To keep current body weight: {{ tdee }} kcal</p>
    <p v-else-if="preintake > 0">To increase body weight: {{ tdee }} kcal</p>
    <p v-else>To decrease body weight: {{ tdee }} kcal</p>

    <div class="bar-holder">
      <div class="bar bar-intake">
        <div class="p part" :style="{ width: getBaseWidth(proteins, proteins + carbs + fats) }">{{ proteins }} p</div>
        <div class="f part" :style="{ width: getBaseWidth(fats, proteins + carbs + fats) }">{{ fats }} f</div>
        <div class="c part" :style="{ width: getBaseWidth(carbs, proteins + carbs + fats) }">{{ carbs }} c</div>
      </div>
    </div>

    <inputHorizontal v-model="preintake" :min="-20" :max="20" :step="1" :mod="1" text="%" :bigStep="10" />
  </div>
</template>
