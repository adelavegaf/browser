import express = require('express');
import {Browser} from './browser';
import {FBMessenger} from './fbmessenger';
import {MessagingService} from './messaging-service';


/**
 * Responds to any HTTP request.
 */
exports.messengerBot = async (req: express.Request, res: express.Response) => {
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
};

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
    for (const {id, text} of messagingService.parseResponse(req.body)) {
      console.info(`Replying to msg "${text}" from user ${id}`);
      await Browser.execute(id, text, messagingService);
    }
  } catch (err) {
    console.error(err);
  } finally {
    await res.status(200).send('success');
  }
}
