export interface Message {
  id: string;
  text: string;
}

export interface MessagingService {
  sendText(recipientId: string, text: string): Promise<{}>;
  sendFile(
      recipientId: string, filename: string, contentType: string,
      attachment: Buffer): Promise<{}>;
  parseResponse(response: {}): Message[];
}