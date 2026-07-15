<script setup lang="ts">
import { useClientStore } from "../store/clientStore.ts";
import { TableColumn } from "@bitrix24/b24ui-nuxt";
import { IAccount, TB24Color } from "../types";
import {
  ACCOUNT_KEYS_MAP,
  ACCOUNT_PLATFORM_MAP,
} from "../constants/account.ts";
import { h, resolveComponent } from "vue";
import { formatAmount, formatDate } from "../utils/mappers";

const B24Badge = resolveComponent("B24Badge");

const clientStore = useClientStore();
const toast = useToast();

const clientAccountColumns: TableColumn<IAccount>[] = [
  {
    accessorKey: "id",
    header: ACCOUNT_KEYS_MAP["id"],
  },
  {
    accessorKey: "account_name",
    header: ACCOUNT_KEYS_MAP["account_name"],
  },
  {
    accessorKey: "login",
    header: ACCOUNT_KEYS_MAP["login"],
    cell: ({ row }) => {
      const login = row.getValue("login") as string;

      return h(
        B24Badge,
        {
          color: "air-selection",
          class: "cursor-pointer",
          onClick: handleClickLoginBadge,
        },
        () => login,
      );
    },
  },
  {
    accessorKey: "balance",
    header: ACCOUNT_KEYS_MAP["balance"],
    cell: ({ row }) => {
      const amount = Number(row.getValue("balance"));

      return formatAmount(amount);
    },
  },
  {
    accessorKey: "platform",
    header: ACCOUNT_KEYS_MAP["platform"],
    cell: ({ row }) => {
      const value = row.getValue("platform") as string;
      let cellName = value;
      let cellColor: TB24Color = "air-tertiary";

      if (value in ACCOUNT_PLATFORM_MAP) {
        const { name, color } = ACCOUNT_PLATFORM_MAP[value];

        cellName = name;
        cellColor = color;
      }

      return h(B24Badge, { color: cellColor, size: "lg" }, () => cellName);
    },
  },
  {
    accessorKey: "created_at",
    header: ACCOUNT_KEYS_MAP["created_at"],
    cell: ({ row }) => {
      const date = row.getValue("created_at") as string;

      return formatDate(date);
    },
  },
  {
    accessorKey: "is_archive",
    header: ACCOUNT_KEYS_MAP["is_archive"],
    cell: ({ row }) => {
      const isArchive = row.getValue("is_archive") as boolean;

      return isArchive ? "Да" : "Нет";
    },
  },
];

const handleClickLoginBadge = (event: PointerEvent) => {
  if (!event.target) {
    return;
  }

  if (
    !("innerText" in event.target) ||
    !event.target.innerText ||
    typeof event.target.innerText !== "string"
  ) {
    return;
  }

  navigator.clipboard.writeText(event.target.innerText).then(() => {
    toast.add({
      title: "Логин скопирован",
      color: "air-secondary",
      duration: 1000,
    });
  });
};
</script>

<template>
  <ProseH1>Рекламные системы</ProseH1>
  <B24ChatShimmer
    v-if="clientStore.isLoading"
    class="flex items-start justify-center mt-8xl"
    text="Загрузка рекламных систем..."
    :duration="3"
  />
  <div v-if="clientStore.client && !clientStore.isLoading">
    <B24Table
      :data="clientStore.client.accounts"
      :columns="clientAccountColumns"
      class="flex-1 mt-8"
    />
  </div>
  <B24Empty
    v-else-if="!clientStore.client && !clientStore.isLoading"
    title="Не удалось получить данные о клиенте"
  />
</template>

<style scoped></style>
