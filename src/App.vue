<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";
import { LoggerInterface, SdkError } from "@bitrix24/b24jssdk";
import { useBitrixStore } from "./store/bitrixStore.ts";
import { useClientStore } from "./store/clientStore.ts";
import CloudErrorIcon from "@bitrix24/b24icons-vue/main/CloudErrorIcon";

const { isBitrixMobile } = useDevice();
const bitrixStore = useBitrixStore();
const clientStore = useClientStore();
const toast = useToast();

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

    const { ID: entityId, URI: entityURI } = bitrixStore.options;
    let clientId: number = 0;

    if ((entityURI as string).includes("crm/lead/details")) {
      const lead = await bitrixStore.methods.getLeadById(entityId as string);

      if (
        !lead ||
        !("ufCrm_1773150315164" in lead) ||
        !lead.ufCrm_1773150315164
      ) {
        toast.add({
          title: "Не удалось получить ID клиента",
          description: "Проверьте указан ли ID клиента в карточке лида",
          color: "air-primary-alert",
          icon: CloudErrorIcon,
        });

        clientStore.setLoading(false);
        return;
      }

      clientId = parseInt(lead.ufCrm_1773150315164 as string);
    } else if ((entityURI as string).includes("crm/deal/details")) {
      const deal = await bitrixStore.methods.getDealById(entityId as string);

      if (!deal || !("ufCrm_1780986634" in deal) || !deal.ufCrm_1780986634) {
        toast.add({
          title: "Не удалось получить ID клиента",
          description: "Проверьте указан ли ID клиента в карточке сделки",
          color: "air-primary-alert",
          icon: CloudErrorIcon,
        });

        clientStore.setLoading(false);
        return;
      }

      clientId = parseInt(deal.ufCrm_1780986634 as string);
    }

    if (!clientId) {
      throw new Error("Не удалось получить ID клиента");
    }

    clientStore.setClientId(clientId);
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

  // clientStore.setClientId(7);
});

onUnmounted(() => {
  bitrixStore.destroy();
});
</script>

<template>
  <Suspense>
    <B24App
      v-if="clientStore.clientId !== 0 && clientStore.client"
      :toaster="toaster"
    >
      <B24Main as="div" class="min-h-0">
        <B24Container
          class="flex gap-4"
          :b24ui="{
            base: 'max-w-[1800px] px-0 sm:px-0 lg:px-0',
          }"
        >
          <AppHeader
            class="shrink-0 rounded-(--ui-border-radius-md) bg-(--ui-color-design-outline-bg) border-(--ui-color-design-outline-stroke) border-(length:--ui-design-outline-stroke-weight) text-(--ui-color-design-outline-content) w-1/6 h-fit p-5 pb-10"
          />
          <B24PageBody
            class="m-0 gap-20 h-200 overflow-y-auto p-5 rounded-(--ui-border-radius-md) bg-(--ui-color-design-outline-bg) border-(--ui-color-design-outline-stroke) border-(length:--ui-design-outline-stroke-weight) text-(--ui-color-design-outline-content) flex-1 w-full overflow-auto"
          >
            <RouterView />
          </B24PageBody>
        </B24Container>
      </B24Main>
      <AppFooter />
    </B24App>
    <B24Error
      v-else-if="!bitrixStore.isLoading && !bitrixStore.isInit"
      :clear="false"
      :error="{
        statusMessage: '403',
        message: 'Страница не найдена',
      }"
    />
    <B24Error
      v-else-if="!clientStore.isLoading && !clientStore.clientId"
      :clear="false"
      :error="{
        statusMessage: '400',
        message:
          'Данные по клиенту не найдены. Проверьте, указан ли ID клиента в карточке лида',
      }"
    />
    <B24Error
      v-else-if="!clientStore.isLoading && !clientStore.client"
      :clear="false"
      :error="{
        statusMessage: '404',
        message: 'Не удалось получить информацию по клиенту',
      }"
    />
  </Suspense>
</template>
