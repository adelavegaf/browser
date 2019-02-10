export const BROWSER_TOPIC = 'browser_topic';

interface Event {
  data: string;
}

export async function processBrowserMessage(event: Event) {
  const data = JSON.parse(Buffer.from(event.data, 'base64').toString());
  console.info(`Received event ${JSON.stringify(data)} via pubsub`);
}