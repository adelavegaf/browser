import express = require('express');
// @ts-ignore
import PubSub = require('@google-cloud/pubsub');
import {FBMessenger} from '../../lib/messaging/fbmessenger';
import {MessagingService} from '../../lib/messaging/messaging-service';
import {BROWSER_TOPIC} from '../pubsub/process-browser-message';


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
    const messagingService: MessagingService =
        new FBMessenger(process.env.PAGE_TOKEN as string);
    const messages = messagingService.parseResponse(req.body);
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
