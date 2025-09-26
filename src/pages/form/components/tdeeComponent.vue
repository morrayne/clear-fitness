<script setup lang="ts">
import { ref, watch } from "vue";

const volumes = [
  { svg: "../../../../public/svg/tuneing.svg", value: 1.2, name: "Minimum activity" },
  { svg: "../../../../public/svg/star-fall.svg", value: 1.3, name: "Walking sometimes" },
  { svg: "../../../../public/svg/dna.svg", value: 1.375, name: "Low volume training" },
  { svg: "../../../../public/svg/ufo.svg", value: 1.55, name: "Medium volume training" },
  { svg: "../../../../public/svg/bolt.svg", value: 1.725, name: "High volume training" },
  { svg: "../../../../public/svg/black-hole.svg", value: 1.9, name: "Extreme volume training" },
];

const props = defineProps<{
  modelValue: number;
}>();

const emit = defineEmits<{(e: "update:modelValue", value: number): void}>();

// Используем modelValue напрямую
const activeVolume = ref<number>(props.modelValue || 1.55);

// Синхронизация
watch(() => props.modelValue, (newVal) => {
  if (newVal !== activeVolume.value) {
    activeVolume.value = newVal;
  }
});

watch(activeVolume, (newVal) => {
  emit("update:modelValue", newVal);
});

function selectVolume(volumeValue: number) {
  activeVolume.value = volumeValue;
}
</script>

<template>
  <!-- prettier-ignore -->
  <div class="tdee">
    <button v-for="volume in volumes" :key="volume.value" class="btn" :class="{ active: activeVolume === volume.value }" @click="selectVolume(volume.value)">
      <img :src="volume.svg" />
      <span>{{ volume.name }}</span>
      <p>{{ volume.value }}</p>
    </button>
  </div>
</template>