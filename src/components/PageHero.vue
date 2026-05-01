<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";
import { LoggerInterface, SdkError } from "@bitrix24/b24jssdk";
import { useBitrixStore } from "../store/bitrix-store.ts";
import SearchDeals from "./SearchDeals.vue";

const bitrixStore = useBitrixStore();

onMounted(async () => {
  try {
    await bitrixStore.init();
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
