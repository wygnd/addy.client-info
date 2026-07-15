import { defineStore } from "pinia";
import {
  B24Frame,
  EnumCrmEntityTypeId,
  initializeB24Frame,
  LoggerFactory,
} from "@bitrix24/b24jssdk";
import { ref } from "vue";
import CloudErrorIcon from "@bitrix24/b24icons-vue/main/CloudErrorIcon";
import { B24Lead } from "../types";

export interface B24User {
  ID: string;
  NAME: string;
  LAST_NAME: string;
  SECOND_NAME: string;
}

export interface B24Deal {
  id: string;
  title: string;
  assignedById: string;
  ufCrm_6471ECDCA1B61: string | null;
}

export interface B24BatchCommand {
  method: string;
  params: Record<string, unknown>;
}

export const useBitrixStore = defineStore("bitrix24", () => {
  const $logger = LoggerFactory.createForBrowser("B24JsSDK", true);
  let $bx24: B24Frame | null = null;

  const toast = useToast();
  const isInit = ref<boolean>(false);
  const isLoading = ref<boolean>(true);
  const options = ref<Record<string, unknown>>({});

  const init = async () => {
    try {
      if ($bx24) {
        isLoading.value = false;
        return;
      }

      // Инициализируем b24
      $bx24 = await initializeB24Frame();

      // Получаем контекст
      options.value = getOptions();

      await $logger.debug("Check options", options.value);

      // Масштабируем фрейм под размеры приложения
      await $bx24.parent.resizeWindowAuto(null, 800, 1000);

      await $logger.notice("Инициализация успешно выполнена");
      isInit.value = true;
    } catch (e) {
      toast.add({
        title: "Ошибка подключения к Битрикс24",
        color: "air-primary-alert",
        icon: CloudErrorIcon,
      });
      throw e;
    } finally {
      isLoading.value = false;
    }
  };

  const destroy = () => {
    if (!$bx24) {
      return;
    }

    $bx24.destroy();
  };

  const getOptions = () => {
    if (!$bx24) {
      return {};
    }

    return $bx24.placement.options;
  };

  const openLead = async (leadId: string) => {
    if (!$bx24) {
      return;
    }

    await $bx24.slider.openPath(
      $bx24.slider.getUrl(`/crm/lead/details/${leadId}/`),
    );
  };

  const openDeal = async (dealId: string) => {
    if (!$bx24) {
      return;
    }

    await $bx24.slider.openPath(
      $bx24.slider.getUrl(`/crm/deal/details/${dealId}/`),
    );
  };

  const openUserChat = async (userId: string) => {
    if (!$bx24) {
      return;
    }

    await $bx24.parent.imOpenMessenger(parseInt(userId));
  };

  const getUser = async (userId: string): Promise<B24User | null> => {
    if (!$bx24) {
      return null;
    }

    const result = await $bx24.actions.v2.call.make<B24User[]>({
      method: "user.get",
      params: {
        filter: {
          ID: userId,
        },
      },
      requestId: $bx24.auth.getUniq(`getUser${userId}`),
    });

    if (!result.isSuccess) {
      await $logger.error(`Ошибка получения пользователя ${userId}`, {
        error: result.getErrorMessages(),
      });

      return null;
    }

    const data = result.getData();

    return data && Array.isArray(data.result)
      ? (data.result[0] as B24User)
      : null;
  };

  const formatUserName = async (userId: string): Promise<string> => {
    const user = await getUser(userId);

    if (!user) {
      return userId;
    }

    return `${user.NAME} ${user.LAST_NAME}`;
  };

  const getCurrentUser = async (): Promise<B24User | null> => {
    if (!$bx24) {
      return null;
    }

    const result = await $bx24.actions.v2.call.make<B24User>({
      method: "user.current",
      requestId: $bx24.auth.getUniq("currentUser"),
    });

    if (!result.isSuccess) {
      await $logger.error(`Ошибка получения текущего пользователя`, {
        error: result.getErrorMessages(),
      });

      return null;
    }

    const data = result.getData();

    if (!data?.result) {
      return null;
    }

    return data.result as B24User;
  };

  const getLeadById = async (leadId: string): Promise<B24Lead | null> => {
    if (!$bx24) {
      return null;
    }

    const result = await $bx24.actions.v2.call.make<{ item: B24Lead }>({
      method: "crm.item.get",
      params: {
        entityTypeId: 1,
        id: leadId,
      },
    });

    if (!result.isSuccess) {
      await $logger.error(`Ошибка получения лида ${leadId}`, {
        error: result.getErrorMessages(),
      });

      return null;
    }

    const data = result.getData();

    if (!data?.result) {
      return null;
    }

    if (Array.isArray(data.result)) {
      return data.result[0].item as B24Lead;
    }

    if (!("item" in data.result)) {
      return null;
    }

    return data.result.item;
  };

  const findDealsByPhone = async (
    phone: string | string[],
  ): Promise<B24Deal[]> => {
    try {
      if (!$bx24) {
        return [];
      }

      let phoneSearch: string[];

      if (Array.isArray(phone)) {
        phoneSearch = phone.map((p) => `%${p}%`);
      } else {
        phoneSearch = [`%${phone}%`];
      }

      const commands: B24BatchCommand[] = [];

      phoneSearch.forEach((phone) => {
        commands.push({
          method: "crm.item.list",
          params: {
            entityTypeId: EnumCrmEntityTypeId.deal,
            filter: {
              ufCrm_6471ECDCA1B61: `%${phone}%`,
            },
            select: ["id", "title", "ufCrm_6471ECDCA1B61"],
          },
        });
      });

      const result = await $bx24.actions.v2.batchByChunk.make<{
        items: B24Deal[];
      }>({
        calls: commands,
        options: {
          requestId: $bx24.auth.getUniq("currentUser"),
        },
      });

      if (!result.isSuccess) {
        $logger.error("Ошибка запроса", { errors: result.getErrorMessages() });
        return [];
      }

      const data = await result.getData();

      await $logger.debug("Проверка данных", {
        commands,
        data,
      });

      if (!data) {
        $logger.warning("Не удалось получить данные");
        return [];
      }

      if (data.length === 0) {
        return [];
      }

      const deals: B24Deal[] = [];
      const handledDeals = new Set<string>();

      data.forEach((deal) => {
        if (deal.items.length === 0) {
          return;
        }

        deal.items.forEach((d) => {
          if (handledDeals.has(d.id)) {
            return;
          }

          deals.push(d);
          handledDeals.add(d.id);
        });
      });

      return deals;
    } catch (error) {
      $logger.error("Ошибка получения данных", { error });
      return [];
    }
  };

  const generateDealUrl = (id: string): string => {
    if (!$bx24) {
      return "";
    }

    return $bx24.slider.getUrl(`/crm/deal/details/${id}/`).toString();
  };

  return {
    init,
    destroy,
    isInit,
    isLoading,
    logger: $logger,
    options,
    methods: {
      openLead,
      openDeal,
      openUserChat,
      getUser,
      formatUserName,
      getCurrentUser,
      findDealsByPhone,
      generateDealUrl,
      getLeadById,
    },
  };
});
