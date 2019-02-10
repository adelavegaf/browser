export enum Provider {
  Messenger = 'Messenger'
}

export interface Message {
  id: string;
  text: string;
  provider: Provider;
}

export interface MessagingService {
  sendText(recipientId: string, text: string): Promise<{}>;
  sendFile(
      recipientId: string, filename: string, contentType: string,
      attachment: Buffer): Promise<{}>;
}