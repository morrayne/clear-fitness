<script setup lang="ts">
import { ref, computed, watch } from "vue";

// TYPE 
interface ScaleProps {
  modelValue: number;
  min: number;
  max: number;
  step: number;
  bigStep: number;
  text: string;
  textAlt: string;
  mod: number;
}

// PROPS AND EMITS
const props = defineProps<ScaleProps>();
const emit = defineEmits<{(e: "update:modelValue", value: number): void }>();

// STATE
const current = ref<number>(props.modelValue ?? 0);
const touchStartX = ref(0);
const isDragging = ref(false);

// V-MODEL SYNC
watch(() => props.modelValue, (newVal) => {
  if (newVal !== current.value) current.value = newVal ?? 0;
});
watch(current, (val) => { 
  const numVal = Number(val ?? 0);
  if (numVal !== props.modelValue) emit("update:modelValue", numVal);
});

// VALUE LIST
const values = computed(() => {
  const arr: number[] = [];
  for (let v = props.min; v <= props.max; v += props.step) {
    arr.push(parseFloat(v.toFixed(2)));
  }
  return arr;
});

// CURRENT INDEX
const currentIndex = computed(() => {
  const index = Math.round((current.value - props.min) / props.step);
  return Math.max(0, Math.min(values.value.length - 1, index));
});

// OFFSET (SCALE CENTER)
const offset = computed(() => {
  const tickWidth = 10;
  const centerPosition = 156;
  return `translateX(${centerPosition - currentIndex.value * tickWidth}px)`;
});

// VALUE UPDATE
function updateValue(direction: number) {
  const newIndex = Math.max(0, Math.min(values.value.length - 1, currentIndex.value + direction));
  const newValue = values.value[newIndex] ?? current.value;
  current.value = newValue;
}

// TOUCH / SCROLL
function onTouchStart(e: TouchEvent) {
  const touch = e.touches?.[0];
  if (!touch) return;
  touchStartX.value = touch.clientX;
  isDragging.value = true;
}
function onTouchMove(e: TouchEvent) {
  if (!isDragging.value) return;
  const touch = e.touches?.[0];
  if (!touch) return;
  const diff = touchStartX.value - touch.clientX;
  const sensitivity = 10;
  if (Math.abs(diff) > sensitivity) {
    const direction = diff > 0 ? 1 : -1;
    updateValue(direction);
    touchStartX.value = touch.clientX;
  }
}
function onTouchEnd() {
  isDragging.value = false;
}
function onScroll(e: WheelEvent) {
  e.preventDefault();
  const direction = e.deltaY > 0 ? 1 : -1;
  updateValue(direction);
}

// CLICK ON TICK
function setValue(value: number) {
  current.value = Math.max(props.min, Math.min(props.max, value));
}

// RISK TYPES
const isBigTick = (value: number) => {
  const roundedValue = Math.round(value * 100) / 100;
  const roundedBigStep = Math.round(props.bigStep * 100) / 100;
  return Math.abs(roundedValue % roundedBigStep) < 0.01;
};
const isMediumTick = (value: number) => {
  if (isBigTick(value)) return false;
  const mediumStep = props.bigStep / 2;
  const roundedValue = Math.round(value * 100) / 100;
  const roundedMediumStep = Math.round(mediumStep * 100) / 100;
  return Math.abs(roundedValue % roundedMediumStep) < 0.01;
};

// DISPLAY VALUE (computed)
const displayValue = computed(() => {
  const val = current.value ?? 0;
  const mainText = props.text ?? "";
  const altText = props.textAlt ?? "";
  if (mainText === altText) {
    return `${val} ${mainText}`
  }
  const altValue = (val * props.mod).toFixed(1);
  return `${val} ${mainText} or ${altValue} ${altText}`;
});
</script>

<template>
  <div class="input-horizontal">
    <div class="shade shade-1"></div>
    <div class="shade shade-2"></div>
    <div class="value">{{ displayValue }}</div>
    <div class="scale" @wheel="onScroll" @touchstart.passive="onTouchStart" @touchmove.prevent="onTouchMove" @touchend="onTouchEnd" @touchcancel="onTouchEnd">
      <div class="ticks" :style="{ transform: offset }">
        <div v-for="(v, i) in values" :key="i" class="tick" :class="{ big: isBigTick(v), medium: isMediumTick(v), active: v === current }" @click="setValue(v)"></div>
      </div>
      <div class="center-line"></div>
    </div>
    <div class="mobile-hint">Swipe left or right to change value</div>
  </div>
</template>
