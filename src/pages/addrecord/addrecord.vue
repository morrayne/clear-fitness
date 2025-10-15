<script setup lang="ts">
import { ref, computed, onMounted, toRaw } from "vue";
import weektop from "../../week/weekmain.vue";
import FoodItemComponent from "./components/FoodItemComponent.vue";
import FoodForm from "./components/FoodForm.vue";
import localforage from "localforage";
import Assets from "./components/Assets.vue";

const pageIndex = ref(0);
const foodAssets = ref<any[]>([]); // кастомные продукты
const basket = ref<any[]>([]); // корзина

function changePage(index: number) {
  pageIndex.value = index;
}

const pageTransform = computed(() => `translateX(-${pageIndex.value * 100}%)`);

onMounted(async () => {
  const stored = await localforage.getItem("customfood");
  foodAssets.value = Array.isArray(stored) ? stored : [];
});

// Сохраняем кастомные продукты
async function saveAssets() {
  await localforage.setItem("customfood", toRaw(foodAssets.value));
}

// Добавление нового продукта из формы
async function handleConfirm(data: any) {
  foodAssets.value.push(data);
  await saveAssets();
}

// Удаление кастомного продукта (при эмите из Assets)
async function removeAsset(id: string | number) {
  foodAssets.value = foodAssets.value.filter((item) => item.id !== id);
  await saveAssets();
}

// Добавление в корзину
function handleAddToBasket(item: any) {
  if (!basket.value.find((f) => f.id === item.id)) basket.value.push(item);
}

// Удаление из корзины
function handleRemoveFromBasket(id: string | number) {
  basket.value = basket.value.filter((item) => item.id !== id);
}

const sendBasket = async () => {
  if (basket.value.length === 0) return;

  const today = new Date();
  const formattedDate = `${today.getDate().toString().padStart(2, "0")}-${(
    today.getMonth() + 1
  )
    .toString()
    .padStart(2, "0")}-${today.getFullYear()}`;

  const dataToSave = {
    date: formattedDate,
    foods: toRaw(basket.value),
  };

  // Загружаем предыдущие записи
  const previous = (await localforage.getItem<any[]>("userintakes")) || [];

  // Проверяем, есть ли запись на эту дату
  const existing = previous.find((item) => item.date === formattedDate);

  if (existing) {
    // Если уже есть — добавляем новые продукты в существующие
    existing.foods.push(...dataToSave.foods);
  } else {
    // Если нет — создаём новую запись
    previous.push(dataToSave);
  }

  // Сохраняем обновлённые данные
  await localforage.setItem("userintakes", previous);

  console.log("Basket sent:", dataToSave);
  basket.value = [];
};
</script>

<template>
  <div class="addrecord">
    <!-- Навигация -->
    <ul class="nav">
      <li @click="changePage(0)" :class="{ active: pageIndex === 0 }">
        Basket
      </li>
      <li @click="changePage(1)" :class="{ active: pageIndex === 1 }">
        Inputs
      </li>
      <li @click="changePage(2)" :class="{ active: pageIndex === 2 }">
        Assets
      </li>
      <div
        class="nav-indicator"
        :style="{ transform: `translateX(${pageIndex * 100}%)` }"
      ></div>
    </ul>

    <!-- Страницы -->
    <div class="pages">
      <!-- Basket -->
      <div class="page" :style="{ transform: pageTransform }">
        <weektop class="disabled-week" />
        <button class="send" @click="sendBasket">Send it</button>
        <div class="list" :class="{ center: basket.length === 0 }">
          <img
            v-if="basket.length === 0"
            src="../../../public/gif/evernight.gif"
          />
          <p v-if="basket.length === 0"></p>
          <FoodItemComponent
            v-for="item in basket"
            v-if="basket.length !== 0"
            :key="item.id"
            :data="item"
            @remove="handleRemoveFromBasket"
          />
        </div>
      </div>

      <!-- Inputs -->
      <div class="page center" :style="{ transform: pageTransform }">
        <FoodForm @confirm="handleConfirm" @addToBasket="handleAddToBasket" />
      </div>

      <!-- Assets -->
      <div class="page" :style="{ transform: pageTransform }">
        <Assets
          :foodAsset="foodAssets"
          @addToBasket="handleAddToBasket"
          @removeAsset="removeAsset"
        />
      </div>
    </div>
  </div>
</template>
