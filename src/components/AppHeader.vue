<script setup lang="ts">
import type { NavigationMenuItem, SelectItem } from "@bitrix24/b24ui-nuxt";
import { computed, ref } from "vue";
import { useRoute } from "vue-router";
import { useClientStore } from "../store/clientStore.ts";

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
      label: `${clientStore.parent.name} ${clientStore.parent.lastname}`,
      id: clientStore.parent.id.toString(),
    });

    items.push({
      type: "separator",
    });

    if ("childs" in clientStore.parent) {
      for (const child of clientStore.parent.childs) {
        items.push({
          label: `${child.name} ${child.lastname}`,
          id: child.id.toString(),
        });
      }
    }

    return items;
  }

  const clientFullName = `${clientStore.client.name} ${clientStore.client.lastname}`;

  clientChoice.value = {
    label: clientFullName,
    id: clientStore.clientId.toString(),
  };

  items.push({
    label: clientFullName,
    id: clientStore.client.id.toString(),
  });

  items.push({
    type: "separator",
  });

  if (clientStore.client.childs && clientStore.client.childs.length > 0) {
    for (const child of clientStore.client.childs) {
      items.push({
        label: `${child.name} ${child.lastname}`,
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
  <B24Header class="py-10">
    <template #title>
      <img
        loading="lazy"
        :src="`${publicPath}/assets/images/Logo.svg`"
        width="120px"
        alt="logo"
      />
    </template>
    <B24NavigationMenu :items="links" />
    <template #right>
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
        placeholder="Не выбрано"
        value-key="id"
        size="lg"
        @update:modelValue="handleUpdateSelectMenu"
      />
    </template>
  </B24Header>
</template>

<style scoped></style>
