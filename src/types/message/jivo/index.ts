export type TJivoSenderType = "ADMIN" | "USER" | "SYSTEM";

export interface IJivoMessage {
  id: number;
  chatId: number;
  sender: TJivoSenderType;
  message: string;
  sendAt: string;
  updatedAt: string;
  createdAt: string;
}
