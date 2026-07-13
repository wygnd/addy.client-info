export interface IAddyMessage {
  id: number;
  is_owner: boolean;
  is_admin: boolean;
  message: string;
  media: unknown[];
  created_at: string;
}
