import request = require('request-promise-native');
import {Message, MessagingService} from './messaging-service';

const GRAPH_URL = 'https://graph.facebook.com/v2.6/me/messages?access_token=';

interface WebhookEvent {
  object: string;
  entry: Array<{
    id: string; time: number;
    messaging: Array<{sender: {id: string;}, message: {text: string;}}>;
  }>;
}

export class FBMessenger implements MessagingService {
  private url: string;

  constructor(pageToken: string) {
    this.url = GRAPH_URL + pageToken;
  }

  sendText(recipientId: string, text: string): Promise<{}> {
    const payload = {
      'messaging_type': 'RESPONSE',
      'recipient': {'id': recipientId},
      'message': {'text': text}
    };
    const options = {method: 'POST', uri: this.url, body: payload, json: true};
    return request(options).promise();
  }

  sendFile(
      recipientId: string, filename: string, contentType: string,
      attachment: Buffer): Promise<{}> {
    const formData = {
      'messaging_type': 'RESPONSE',
      'recipient': `{"id": ${recipientId}}`,
      'message': '{"attachment": {"type": "file", "payload": {}}}',
      'filedata': {
        'value': attachment,
        'options': {'filename': filename, 'contentType': contentType}
      }
    };
    return request.post({url: this.url, formData}).promise();
  }

  parseResponse(response: WebhookEvent): Message[] {
    const messages: Message[] = [];
    for (const entry of response['entry']) {
      for (const messaging of entry['messaging']) {
        if (messaging['message'] == null) {
          continue;
        }
        const id = messaging['sender']['id'];
        const text = messaging['message']['text'];
        if (text == null) {
          continue;
        }
        messages.push({id, text});
      }
    }
    return messages;
  }
}