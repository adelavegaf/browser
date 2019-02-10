import request = require('request-promise-native');
import {MessagingService} from './messaging-service';

const GRAPH_URL = 'https://graph.facebook.com/v2.6/me/messages?access_token=';


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
}