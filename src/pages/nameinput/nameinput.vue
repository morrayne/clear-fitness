<script setup lang="ts">
import localforage from "localforage";
import { ref, inject } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
interface UserConfig {
  general: {
    name: string;
    lang: string;
    isNew: boolean;
  };
  weight: { min: number; max: number; step: number };
  height: { min: number; max: number; step: number };
  age: { min: number; max: number; step: number };
  activity: number[];
  gender: number[];
}

const userconfig = inject<UserConfig>("userconfig")!;
const username = ref("");

// Функция для создания простого объекта из реактивного
function toPlainObject(obj: any): any {
  return JSON.parse(JSON.stringify(obj));
}

// === подтверждение имени ===
async function confirmName() {
  const trimmed = username.value.trim();
  if (!trimmed) return;
  userconfig.general.name = trimmed;
  userconfig.general.isNew = true;
  const configToStore = toPlainObject(userconfig);
  await localforage.setItem("userconfig", configToStore);
  router.push("/bodyinput");
}
</script>

<template>
  <div class="nameinput">
    <form @submit.prevent="confirmName">
      <p>How should we call you?</p>
      <input v-model="username" type="text" placeholder="The Herta" />
      <button class="confirm">Confirm</button>
    </form>
  </div>
</template>