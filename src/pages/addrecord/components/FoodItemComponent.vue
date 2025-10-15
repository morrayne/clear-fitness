<script setup lang="ts">
const props = defineProps<{
  data: {
    id: string | number;
    name: string;
    portionSize: number;
    proteins: number;
    carbs: number;
    fats: number;
    kcal: number;
  };
}>();

const emit = defineEmits<{
  (e: "remove", id: string | number): void;
  (e: "addToBasket", data: typeof props.data): void;
}>();

// Клик по карточке добавляет в корзину
const handleClick = (event: MouseEvent) => {
  if ((event.target as HTMLElement).closest("button")) return; // игнорируем кнопку удаления
  console.log("EMIT addToBasket:", props.data);
  emit("addToBasket", props.data); 
};

// Клик по кнопке удаления
const handleRemove = () => {
  console.log("EMIT remove:", props.data.id);
  emit("remove", props.data.id);
};
</script>

<template>
  <div class="food-item" @click="handleClick" style="cursor: pointer">
    <div class="left"></div>
    <div class="right">
      <div class="name">
        <span>{{ props.data.name }}</span>
        <p>{{ props.data.portionSize }} g</p>
        <button @click.stop="handleRemove">
          <img src="../../../../public/svg/cross.svg" />
        </button>
      </div>
      <div class="info">
        <p>{{ props.data.kcal }} kcal</p>
        <p>{{ props.data.proteins }} p</p>
        <p>{{ props.data.carbs }} c</p>
        <p>{{ props.data.fats }} f</p>
      </div>
    </div>
  </div>
</template>
