<script setup lang="ts">
import { ref, computed, watch } from "vue";

interface ScaleProps {
  min: number;
  max: number;
  step: number;
  mod: number;
  text: string;
  modelValue: number;
  bigStep: number;
}

const props = withDefaults(defineProps<ScaleProps>(), {});
const emit = defineEmits(["update:modelValue"]);

const current = ref<number>(props.modelValue);
const touchStartX = ref(0);
const isDragging = ref(false);

// Синхронизация с v-model
watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal !== current.value) {
      current.value = newVal;
    }
  }
);
watch(current, (val) => {
  if (val !== props.modelValue) {
    emit("update:modelValue", val);
  }
});

// Генерация всех значений
const values = computed(() => {
  const arr: number[] = [];
  for (let v = props.min; v <= props.max; v += props.step) {
    arr.push(parseFloat(v.toFixed(2)));
  }
  return arr;
});

// Текущий индекс
const currentIndex = computed(() => {
  return Math.round((current.value - props.min) / props.step);
});

// Смещение для центрирования текущего значения
const offset = computed(() => {
  const tickWidth = 10; // 2px tick + 8px margin
  const centerPosition = 156; // центр контейнера (360px / 2)
  return `translateX(${centerPosition - currentIndex.value * tickWidth}px)`;
});

// Обновление значения
function updateValue(direction: number) {
  if (currentIndex.value === -1) return;
  const newIndex = Math.max(
    0,
    Math.min(values.value.length - 1, currentIndex.value + direction)
  );
  current.value = values.value[newIndex] as number;
}

// Обработчик касания
function onTouchMove(e: TouchEvent) {
  if (!isDragging.value || !e.touches || e.touches.length === 0) return;
  e.preventDefault();

  const touchX = e.touches[0]!.clientX;
  const diff = touchStartX.value - touchX;
  const sensitivity = 10;

  if (Math.abs(diff) > sensitivity) {
    const direction = diff > 0 ? 1 : -1;
    updateValue(direction);
    touchStartX.value = touchX;
  }
}

function setValue(value: number) {
  current.value = Math.max(props.min, Math.min(props.max, value));
}

// Wheel для десктопа
function onScroll(e: WheelEvent) {
  e.preventDefault();
  const direction = e.deltaY > 0 ? 1 : -1;
  updateValue(direction);
}

// Touch события
function onTouchStart(e: TouchEvent) {
  e.preventDefault();
  if (!e.touches || e.touches.length === 0) return;

  touchStartX.value = e.touches[0]!.clientX;
  isDragging.value = true;
}

function onTouchEnd() {
  isDragging.value = false;
}

// Функция для конвертации см в футы и дюймы
const cmToFeetInches = (cm: number): string => {
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return `${feet}.${inches.toString().padStart(2, "0")}`;
};

const displayValue = computed(() => {
  if (props.text === "cm") {
    const feetInches = cmToFeetInches(current.value);
    return `${current.value} cm or ${feetInches} ft`;
  } else if (props.text === "years") {
    // Для возраста показываем только годы
    return `${current.value} years`;
  } else if (props.text === "kg") {
    // Для веса: кг + фунты
    return `${current.value.toFixed(1)} kg or ${(
      current.value * props.mod
    ).toFixed(1)} lbs`;
  } else {
    return `${current.value} %`;
  }
});

// Функции проверки тиков
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
</script>

<template>
  <div class="input-horizontal">
    <div class="shade shade-1"></div>
    <div class="shade shade-2"></div>
    <div class="value">{{ displayValue }}</div>
    <div
      class="scale"
      @wheel="onScroll"
      @touchstart="onTouchStart"
      @touchmove="onTouchMove"
      @touchend="onTouchEnd"
      @touchcancel="onTouchEnd"
    >
      <div class="ticks" :style="{ transform: offset }">
        <div
          v-for="(v, i) in values"
          :key="i"
          class="tick"
          :class="{
            big: isBigTick(v),
            medium: isMediumTick(v),
          }"
          @click="setValue(v)"
        >
          <span v-if="isBigTick(v) && current !== v">{{
            props.text === "cm" ? Math.round(v) : v
          }}</span>
        </div>
      </div>
      <div class="center-line"></div>
    </div>

    <div class="mobile-hint">Swipe left or right to change value</div>
  </div>
</template>
