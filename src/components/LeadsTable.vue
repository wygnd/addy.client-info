<script setup lang="ts">
import { useBitrixStore } from "../store/bitrix-store.ts";

export interface ILeadTableItem {
  [key: string]: any;
  user: {
    id: string;
    name: string;
  };
}

interface ILeadsTableProps {
  labels: string[];
  items: ILeadTableItem[];
}

const props = defineProps<ILeadsTableProps>();

const bitrixStore = useBitrixStore();

console.log("check props", props);
</script>

<template>
  <B24TableWrapper
    class="overflow-x-auto w-full p-3 bg-gray-30"
    rounded
    row-hover
  >
    <table>
      <thead>
        <tr>
          <th v-for="label in labels">{{ label }}</th>
          <th>Общее кол-во</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in items">
          <th @click="bitrixStore?.methods.openUserChat(item.user.id)">
            {{ item.user.name }}
          </th>
          <td>{{ item.active_leads.size }}</td>
          <td>{{ item.new_leads.size }}</td>
          <td>{{ item["1c_leads"].size }}</td>
          <td>{{ item.converted_leads.size }}</td>
          <td>
            {{
              Object.values(item).reduce((acc, i) => {
                if (i instanceof Set) {
                  acc += i.size;
                }
                return acc;
              }, 0)
            }}
          </td>
        </tr>
      </tbody>
      <tfoot>
        <tr>
          <th>Итого:</th>
          <td>
            {{
              items.reduce((acc, item) => {
                acc += item.active_leads.size;
                return acc;
              }, 0)
            }}
          </td>
          <td>
            {{
              items.reduce((acc, item) => {
                acc += item.new_leads.size;
                return acc;
              }, 0)
            }}
          </td>
          <td>
            {{
              items.reduce((acc, item) => {
                acc += item["1c_leads"].size;
                return acc;
              }, 0)
            }}
          </td>
          <td>
            {{
              items.reduce((acc, item) => {
                acc += item.converted_leads.size;
                return acc;
              }, 0)
            }}
          </td>
          <td>
            {{
              items.reduce((acc, item) => {
                acc += Object.values(item).reduce((acc, i) => {
                  if (i instanceof Set) {
                    acc += i.size;
                  }
                  return acc;
                }, 0);
                return acc;
              }, 0)
            }}
          </td>
        </tr>
      </tfoot>
    </table>
  </B24TableWrapper>
</template>

<style scoped></style>
