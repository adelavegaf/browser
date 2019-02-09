import express = require('express');
import {FBMessenger} from '../../lib/messaging/fbmessenger';
import {MessagingService} from '../../lib/messaging/messaging-service';


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
    const messagingService: MessagingService =
        new FBMessenger(process.env.PAGE_TOKEN as string);
    const messages = messagingService.parseResponse(req.body);
    for (const {id, text} of messages) {
      console.info(`Processing message "${text}" for user ${id}`);
    }
    // TODO(adelavega): Send messages through pub/sub to browser.
  } catch (err) {
    console.error(err);
  } finally {
    await res.status(200).send('success');
  }
}
