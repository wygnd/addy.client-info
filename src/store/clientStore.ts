import { defineStore } from "pinia";
import { ref } from "vue";
import { IApiAddyResponse, IClient } from "../types";
import { useApi } from "../composables/useApi.ts";
import { API_ADDY_URL } from "../constants/api.ts";
import CloudErrorIcon from "@bitrix24/b24icons-vue/main/CloudErrorIcon";
import SuccessIcon from '@bitrix24/b24icons-vue/button/SuccessIcon'

export const useClientStore = defineStore("clientInfo", () => {
  const client = ref<IClient | null>(null);
  const clientId = ref<number>(0);
  const isLoading = ref<boolean>(true);
  const toast = useToast();
  const parent = ref<IClient | null>(null);

  const fetchClientById = async (force: boolean = false): Promise<void> => {
    try {
      isLoading.value = true;
      if (!clientId.value) {
        throw new Error("clientId is empty");
      }

      if (!!client.value) {
        isLoading.value = true;
      }

      let url = `${API_ADDY_URL}/bx24/user/${clientId.value}`;
      const auth = btoa(
        `${import.meta.env.VITE_ADDY_BACKEND_API_USERNAME}:${import.meta.env.VITE_ADDY_BACKEND_API_PASSWORD}`,
      );

      if (force) {
        url += "?force=true";
      }

      const { error, data } = await useApi<IApiAddyResponse<IClient>>(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Basic ${auth}`,
        },
      });

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

      if (force) {
        toast.add({
          title: "Данные успешно обновлены",
          color: "air-primary-success",
          icon: SuccessIcon,
        });
      }
    } catch (err) {
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const setClientId = (id: number, force: boolean = false) => {
    clientId.value = id;

    fetchClientById(force).catch((err) => {
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

  const setLoading = (flag: boolean) => {
    isLoading.value = flag;
  };

  return {
    clientId,
    client,
    isLoading,
    setClientId,
    parent,
    setLoading,
  };
});
