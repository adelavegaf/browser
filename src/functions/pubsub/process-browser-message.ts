import {Browser} from '../../lib/core/browser';
import {Message} from '../../lib/messaging/messaging-service';

export const BROWSER_TOPIC = 'browser_topic';

interface Event {
  data: string;
}

export async function processBrowserMessage(event: Event) {
  const message: Message =
      JSON.parse(Buffer.from(event.data, 'base64').toString());
  console.info(`Received event ${JSON.stringify(message)}`);
  await Browser.execute(message);
  console.info(`Processed event ${JSON.stringify(message)}`);
}