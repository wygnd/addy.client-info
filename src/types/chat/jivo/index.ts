export type TJivoChatPlatform = "JIVO" | "UNKNOWN";

export interface IJivoChat {
  id: number;
  externalId: string;
  clientId: number;
  platform: TJivoChatPlatform;
  updatedAt: string;
  createdAt: string;
}
