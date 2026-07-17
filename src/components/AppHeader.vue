<script setup lang="ts">
import type { NavigationMenuItem, SelectItem } from "@bitrix24/b24ui-nuxt";
import { computed, ref } from "vue";
import { useRoute } from "vue-router";
import { useClientStore } from "../store/clientStore.ts";
import { formatClientName } from "../utils/mappers";

const publicPath = import.meta.env.VITE_PUBLIC_URL;

const clientStore = useClientStore();
const route = useRoute();

const links = computed<NavigationMenuItem[]>(() => [
  {
    label: "Клиент",
    to: "/",
    active: route.path === "/",
  },
  {
    label: "Финансы",
    to: "/deposits?type=deposits",
    active: route.path.startsWith("/deposits"),
  },
  {
    label: "Договоры",
    to: "/contracts?type=reward",
    active: route.path.startsWith("/contracts"),
  },
  {
    label: "Рекламные системы",
    to: "/accounts",
    active: route.path.startsWith("/accounts"),
  },
  {
    label: "Чаты",
    to: "/chats?type=addy",
    active: route.path.startsWith("/chats"),
  },
]);

const clientChoice = ref<SelectItem>();
const clientAccounts = computed<SelectItem[]>(() => {
  const items: SelectItem[] = [];

  if (!clientStore.client) {
    return items;
  }

  if (clientStore.client.parent_id && clientStore.parent) {
    items.push({
      label: formatClientName(clientStore.parent),
      id: clientStore.parent.id.toString(),
    });

    if ("childs" in clientStore.parent) {
      items.push({
        type: "separator",
      });

      for (const child of clientStore.parent.childs) {
        items.push({
          label: formatClientName(child),
          id: child.id.toString(),
        });
      }
    }

    return items;
  }

  const clientFullName = formatClientName(clientStore.client);

  clientChoice.value = {
    label: clientFullName,
    id: clientStore.clientId.toString(),
  };

  items.push({
    label: clientFullName,
    id: clientStore.client.id.toString(),
  });

  if (clientStore.client.childs && clientStore.client.childs.length > 0) {
    items.push({
      type: "separator",
    });

    for (const child of clientStore.client.childs) {
      items.push({
        label: formatClientName(child),
        id: child.id.toString(),
      });
    }
  }

  return items;
});

const handleUpdateSelectMenu = (id: string) => {
  const ID = parseInt(id);

  if (clientStore.clientId === ID) {
    return;
  }

  clientStore.setClientId(ID);
};
</script>

<template>
  <header>
    <img
      loading="lazy"
      :src="`${publicPath}/assets/images/Logo.svg`"
      width="120px"
      alt="logo"
      class="mb-10"
    />

    <B24NavigationMenu :items="links" orientation="vertical" class="mb-15" />

    <div v-if="clientStore.client">
      <B24Select
        v-model="clientChoice"
        :items="clientAccounts"
        :loading="clientStore.isLoading"
        :tag="clientStore.isLoading ? 'Загрузка' : 'Выбор аккаунта'"
        :color="clientStore.isLoading ? 'air-primary-success' : 'air-primary'"
        highlight
        :tag-color="
          clientStore.isLoading ? 'air-primary-success' : 'air-secondary'
        "
        :disabled="clientStore.client.childs.length === 0"
        placeholder="Не выбрано"
        underline
        value-key="id"
        @update:modelValue="handleUpdateSelectMenu"
        :b24ui="{
          root: 'w-full',
          tag: 'left-0 right-auto top-[-20px]',
        }"
      />
    </div>
  </header>
</template>

<style scoped></style>
