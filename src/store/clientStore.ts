import { defineStore } from "pinia";
import { ref } from "vue";
import { IApiResponse, IClient } from "../types";
import { useApi } from "../composables/useApi.ts";
import { API_URL } from "../constants/api.ts";
import CloudErrorIcon from "@bitrix24/b24icons-vue/main/CloudErrorIcon";

export const useClientStore = defineStore("clientInfo", () => {
  const client = ref<IClient | null>(null);
  const clientId = ref<number>(0);
  const isLoading = ref<boolean>(false);
  const toast = useToast();
  const parent = ref<IClient | null>(null);

  const fetchClientById = async (): Promise<void> => {
    try {
      isLoading.value = true;
      if (!clientId.value) {
        throw new Error("clientId is empty");
      }

      if (!!client.value) {
        isLoading.value = true;
      }

      const auth = btoa(`${import.meta.env.VITE_BACKEND_API_USERNAME}:${import.meta.env.VITE_BACKEND_API_PASSWORD}`);
      const { error, data } = await useApi<IApiResponse<IClient>>(
        `${API_URL}/user/${clientId.value}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Basic ${auth}`,
          },
        },
      );

      if (error) {
        throw new Error(error);
      }

      if (!data) {
        throw new Error("Не удалось получить данные. Ответ пустой");
      }

      if (client.value && !client.value.parent_id) {
        parent.value = client.value;
      }
      client.value = data.resource;
    } catch (err) {
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const setClientId = (id: number) => {
    clientId.value = id;

    fetchClientById().catch((err) => {
      let errMessage = "Непредвиденная ошибка";

      if (err instanceof Error) {
        errMessage = err.message;
      }

      toast.add({
        title: `Ошибка получения данных клиента: ${clientId.value}`,
        description: errMessage,
        color: "air-primary-alert",
        icon: CloudErrorIcon,
      });
    });
  };

  return { clientId, client, isLoading, setClientId, parent };
});
