<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import { LoggerInterface, SdkError } from "@bitrix24/b24jssdk";
import { B24User, useBitrixStore } from "../store/bitrix-store.ts";
import SearchDeals from "./SearchDeals.vue";

const bitrixStore = useBitrixStore();
const currentUser = ref<B24User | null>(null);

const checkAccessUser = (userId: string): boolean => {
  const accessedUserList = import.meta.env.VITE_API_USER_IDS.split(",");

  return accessedUserList.includes(userId);
};

onMounted(async () => {
  try {
    await bitrixStore.init();
    const user = await bitrixStore.methods.getCurrentUser();

    if (user) {
      currentUser.value = user;
    }
  } catch (e) {
    let messageError = "Неизвестная ошибка";
    let loggerType: keyof LoggerInterface = "error";

    if (e instanceof SdkError) {
      messageError = "Ошибка подключения";
    }

    if (e instanceof TypeError) {
      messageError = e.message;
      loggerType = "warning";
    }

    await bitrixStore.logger[loggerType](messageError, { error: e });
  }
});

onUnmounted(() => {
  bitrixStore.destroy();
});
</script>

<template>
  <div
    class="lg:px-8 py-10 flex flex-col items-start sm:items-center justify-center gap-[20px]"
  >
    <SearchDeals v-if="bitrixStore.isInit" />
    <B24Error
      v-else
      :clear="false"
      :error="{
        statusCode: 403,
        statusMessage: 'Страница не найдена',
      }"
    />
  </div>
</template>
