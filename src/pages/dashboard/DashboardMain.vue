<script setup lang="ts">
import { inject, type ComputedRef } from "vue";
import type { UserMacros } from "../../common/types";

// Получаем вычисленные макросы из provide
const macros = inject<ComputedRef<UserMacros>>("usermacros");
</script>

<template>
  <div v-if="macros">
    <h2 class="text-xl font-bold mb-2">Твои макросы</h2>

    <div class="mb-4">
      <h3 class="font-semibold">Поддержание веса:</h3>
      <p>Вес: {{ macros.maintain.weight }}</p>
      <p>Калории: {{ macros.maintain.kcal }}</p>
      <p>Белки: {{ macros.maintain.proteins }} г</p>
      <p>Жиры: {{ macros.maintain.fats }} г</p>
      <p>Углеводы: {{ macros.maintain.carbs }} г</p>
    </div>

    <div>
      <h3 class="font-semibold">Изменение веса:</h3>
      <p>Вес: {{ macros.modify.weight }}</p>
      <p>Калории: {{ macros.modify.kcal }}</p>
      <p>Белки: {{ macros.modify.proteins }} г</p>
      <p>Жиры: {{ macros.modify.fats }} г</p>
      <p>Углеводы: {{ macros.modify.carbs }} г</p>
    </div>
  </div>

  <p v-else>Загрузка макросов...</p>
</template>
