<script setup lang="ts">
import { ref, inject, type Ref } from "vue";
import { useRouter } from "vue-router";
import { setUser } from "../../common/database";
import type { UserData } from "../../common/types"

const router = useRouter();
const userRef = inject<Ref<UserData>>("userdata");
const username = ref("");

async function confirmName() {
  const trimmed = username.value.trim();
  if (!trimmed || !userRef) return;
  await setUser({ userName: trimmed, isNew: userRef.value.isNew});
  userRef.value.userName = trimmed;
  router.push("/bodydata");
}
</script>


<template>
  <div class="nameform">
    <form @submit.prevent="confirmName">
      <p>How should we call you?</p>
      <input v-model="username" type="text" placeholder="The Herta" />
      <button class="confirm">Confirm</button>
    </form>
  </div>
</template>
