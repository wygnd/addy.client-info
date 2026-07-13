import dayjs from "dayjs";

export const formatDate = (dateStr: string): string => {
  return dayjs(dateStr).format("DD.MM.YYYY HH:mm:ss");
};
