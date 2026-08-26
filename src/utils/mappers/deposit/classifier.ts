import { TDepositClassifier } from "../../../types";

export const formatClassifier = (value: TDepositClassifier): string => {
  switch (value) {
    case "INCOME":
      return "Приход";

    case "OUTCOME":
      return "Расход";

    default:
      return "Не определено";
  }
};
