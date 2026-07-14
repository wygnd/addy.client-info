<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";
import { LoggerInterface, SdkError } from "@bitrix24/b24jssdk";
import { useBitrixStore } from "./store/bitrixStore.ts";
import { useClientStore } from "./store/clientStore.ts";

const { isBitrixMobile } = useDevice();
const bitrixStore = useBitrixStore();
const clientStore = useClientStore();
const toaster = {
  position: isBitrixMobile.value ? "bottom-center" : "top-right",
  duration: 3000,
  max: 5,
  disableSwipe: true,
  progress: false,
};

onMounted(async () => {
  try {
    await bitrixStore.init();

    const { ID: leadId } = bitrixStore.options;

    console.log("checking LeadID", leadId);

    const lead = await bitrixStore.methods.getLeadById(leadId as string);

    console.log('checking lead', lead);

    if (!lead || !("ufCrm_1773150315164" in lead)) {
      return;
    }

    clientStore.setClientId(parseInt(lead.ufCrm_1773150315164 as string));
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

  // clientStore.setClientId(3);
});

onUnmounted(() => {
  bitrixStore.destroy();
});
</script>

<template>
  <Suspense>
    <B24App
      v-if="bitrixStore.isInit && clientStore.clientId"
      :toaster="toaster"
    >
      <AppHeader />
      <B24Main class="mt-5">
        <B24Container>
          <B24PageBody
            class="justify-between gap-20 min-h-[80dvh] p-8 rounded-(--ui-border-radius-md) bg-(--ui-color-design-outline-bg) border-(--ui-color-design-outline-stroke) border-(length:--ui-design-outline-stroke-weight) text-(--ui-color-design-outline-content) flex-1 w-full"
          >
            <RouterView />
          </B24PageBody>
        </B24Container>
      </B24Main>
      <AppFooter />
    </B24App>
    <B24Error
      v-else
      :clear="false"
      :error="{
        statusCode: 403,
        statusMessage: 'Страница не найдена',
      }"
    />
  </Suspense>
</template>
