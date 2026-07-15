<script setup lang="ts">
import { computed, resolveComponent, h, useTemplateRef, ref } from "vue";
import { NavigationMenuItem, TableColumn } from "@bitrix24/b24ui-nuxt";
import { useRoute } from "vue-router";
import { useClientStore } from "../store/clientStore.ts";
import {
  IDeposit,
  TDepositMethodType,
  TDepositStatus,
  TDepositType,
} from "../types";
import { DEPOSIT_CONFIG } from "../constants/deposit.ts";
import {
  formatAmount,
  formatDate,
  formatDepositMethodType,
  formatDepositStatus,
  formatDepositType,
} from "../utils/mappers";

const B24Badge = resolveComponent("B24Badge");

const route = useRoute();
const clientStore = useClientStore();

const items = computed<NavigationMenuItem[]>(() => [
  {
    label: "История пополнений",
    active: route.query.type === "deposits",
    to: "?type=deposits",
  },
  {
    label: "История пауз",
    active: route.query.type === "",
    to: "?type=pauses",
  },
]);
const clientDepositColumns: TableColumn<IDeposit>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "contract",
    header: DEPOSIT_CONFIG["contract"]?.label,
  },
  {
    accessorKey: "amount",
    header: DEPOSIT_CONFIG["amount"]?.label,
    cell: ({ row }) => {
      const amount = row.getValue("amount") as number;

      return formatAmount(amount);
    },
  },
  {
    accessorKey: "amount_without_commission",
    header: DEPOSIT_CONFIG["amount_without_commission"]?.label,
    cell: ({ row }) => {
      const amount = row.getValue("amount_without_commission") as number;

      return formatAmount(amount);
    },
  },
  {
    accessorKey: "status",
    header: DEPOSIT_CONFIG["status"]?.label,
    cell: ({ row }) => {
      const status = row.getValue("status") as TDepositStatus;

      const color = {
        COMPLETED: "air-primary-success" as const,
        PENDING: "air-primary-warning" as const,
        FAIL: "air-primary-alert" as const,
        FROZEN: "air-primary" as const,
      }[status];

      return h(B24Badge, { color, size: "lg", inverted: true }, () =>
        formatDepositStatus(status),
      );
    },
  },
  {
    accessorKey: "type",
    header: DEPOSIT_CONFIG["type"]?.label,
    cell: ({ row }) => {
      const value = row.getValue("type") as TDepositType;

      return formatDepositType(value);
    },
  },
  {
    accessorKey: "method_type",
    header: DEPOSIT_CONFIG["method_type"]?.label,
    cell: ({ row }) => {
      const value = row.getValue("method_type") as TDepositMethodType;

      return formatDepositMethodType(value);
    },
  },
  {
    accessorKey: "payment_time",
    header: DEPOSIT_CONFIG["payment_time"]?.label,
    cell: ({ row }) => {
      const date = row.getValue("payment_time") as string;

      return formatDate(date);
    },
  },
  {
    accessorKey: "created_at",
    header: DEPOSIT_CONFIG["created_at"]?.label,
    cell: ({ row }) => {
      const date = row.getValue("created_at") as string;

      return formatDate(date);
    },
  },
];

const table = useTemplateRef("table");
const columnVisibility = ref<Record<keyof IDeposit, boolean>>({
  id: false,
  contract: true,
  amount_without_commission: false,
  amount: true,
  method_type: true,
  type: true,
  status: true,
  payment_time: true,
  created_at: false,
});

const pageTitle = computed<string>(() => {
  if ("type" in route.query) {
    switch (route.query.type) {
      case "deposits":
        return "История пополнений";

      case "pauses":
        return "История пауз";
    }
  }

  return "Финансы";
});
</script>

<template>
  <div
    class="mb-0 pb-5 flex items-center justify-between gap-5 border-b border-b-(--ui-color-design-outline-stroke)"
  >
    <ProseH1>{{ pageTitle }}</ProseH1>

    <B24NavigationMenu
      :items="items"
      class="data-[orientation=vertical]:w-1/5 shrink-0"
    />
  </div>

  <B24ChatShimmer
    v-if="clientStore.isLoading"
    class="flex items-start justify-center mt-8xl"
    text="Загрузка финансов"
    :duration="3"
  />

  <B24PageBody class="w-full m-0 pb-0">
    <div v-if="route.query.type === 'deposits'">
      <B24Card
        v-if="clientStore.client && !clientStore.isLoading"
        variant="outline"
        class="flex-1 w-full mt-8"
        :b24ui="{
          header: 'p-[12px] px-[14px] py-[14px] sm:px-[14px] sm:py-[14px]',
          body: 'p-0 sm:px-0 sm:py-0',
          footer:
            'p-[12px] px-[14px] py-[14px] sm:px-[14px] sm:py-[14px] text-(length:--ui-font-size-xs) text-legend',
        }"
      >
        <template #header>
          <div class="flex justify-end">
            <B24DropdownMenu
              :items="
                table?.tableApi
                  ?.getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => ({
                    label: DEPOSIT_CONFIG[column.id as keyof IDeposit]?.label,
                    type: 'checkbox' as const,
                    checked: column.getIsVisible(),
                    onUpdateChecked(checked: unknown) {
                      table?.tableApi
                        ?.getColumn(column.id)
                        ?.toggleVisibility(!!checked);
                    },
                    onSelect(e: Event) {
                      e.preventDefault();
                    },
                  }))
              "
              :content="{ align: 'end' }"
            >
              <B24Button
                label="Колонки"
                color="air-secondary-accent-1"
                use-dropdown
              />
            </B24DropdownMenu>
          </div>
        </template>
        <B24Table
          ref="table"
          v-model:column-visibility="columnVisibility"
          :data="clientStore.client.deposit"
          :columns="clientDepositColumns"
        />
      </B24Card>
    </div>
    <div v-if="route.query.type === 'pauses'">
      <B24ChatShimmer text="Здесь будет история пауз" />
    </div>
    <ProseH4 v-if="!route.query.type">
      Чтобы продолжить, выберите вкладку
    </ProseH4>
  </B24PageBody>
</template>

<style scoped></style>
