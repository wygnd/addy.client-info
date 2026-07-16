export interface IMessagePart {
  type: "text";
  text: string;
}

export interface IMessage {
  id: string;
  role: "user" | "assistant";
  parts: IMessagePart[];
}

export * from "./jivo";
