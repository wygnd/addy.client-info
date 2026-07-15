import { IClient } from "../../../types";

export const formatClientName = (client: IClient | null): string => {
  let label = "Неизвестный";

  if (!client) {
    return label;
  }

  if (client.name) {
    label = client.name;
  }

  if (client.lastname) {
    label += " " + client.lastname;
  }

  return label;
};
