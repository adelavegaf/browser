import express = require('express');
// @ts-ignore
import PubSub = require('@google-cloud/pubsub');
import {Message, Provider} from '../../lib/messaging/messaging-service';
import {BROWSER_TOPIC} from '../pubsub/process-browser-message';

interface WebhookEvent {
  object: string;
  entry: Array<{
    id: string; time: number;
    messaging: Array<{sender: {id: string;}, message: {text: string;}}>;
  }>;
}

export async function processFbMessage(
    req: express.Request, res: express.Response) {
  switch (req.method) {
    case 'GET':
      await handleGET(req, res);
      break;
    case 'POST':
      await handlePOST(req, res);
      break;
    default:
      console.error(`Unhandled Http method ${req.method}`);
  }
}

async function handleGET(req: express.Request, res: express.Response) {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === process.env.VERIFY_TOKEN) {
      await res.status(200).send(challenge);
    } else {
      await res.sendStatus(403);
    }
  }
}

async function handlePOST(req: express.Request, res: express.Response) {
  try {
    // @ts-ignore
    const pubsub = new PubSub.PubSub();
    const messages = parseResponse(req.body);
    for (const message of messages) {
      console.info(
          `Processing message "${message.text}" for user ${message.id}`);
      const dataBuffer = Buffer.from(JSON.stringify(message));
      const messageId = await pubsub.topic(BROWSER_TOPIC).publish(dataBuffer);
      console.info(
          `Published message "${messageId}" to topic "${BROWSER_TOPIC}"`);
    }
  } catch (err) {
    console.error(err);
  } finally {
    await res.status(200).send('success');
  }
}

function parseResponse(response: WebhookEvent): Message[] {
  const messages: Message[] = [];
  const provider = Provider.Messenger;
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
      messages.push({id, text, provider});
    }
  }
  return messages;
}