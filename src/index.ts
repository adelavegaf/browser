import fs = require('fs');
import puppeteer = require('puppeteer');
import request = require('request-promise-native');
import express = require('express');

const GRAPH_URL = `https://graph.facebook.com/v2.6/me/messages?access_token=${
    process.env.PAGE_TOKEN}`;

/**
 * Responds to any HTTP request.
 */
exports.messengerBot = (req: express.Request, res: express.Response) => {
  switch (req.method) {
    case 'GET':
      handleGET(req, res);
      break;
    case 'POST':
      handlePOST(req, res);
      break;
    default:
      console.error(`Unhandled Http method ${req.method}`);
  }
};

function handleGET(req: express.Request, res: express.Response) {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === process.env.VERIFY_TOKEN) {
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  }
}

async function handlePOST(req: express.Request, res: express.Response) {
  for (const entry of req.body['entry']) {
    for (const messaging of entry['messaging']) {
      if (messaging['message'] == null) {
        continue;
      }
      const id = messaging['sender']['id'];
      const text = messaging['message']['text'];
      if (text == null) {
        continue;
      }
      console.info(`Replying to user ${id}`);
      await generatePDF();
      sendAttachment(id);
    }
  }
  res.status(200).send('success');
}

async function generatePDF() {
  const browser = await puppeteer.launch({args: ['--no-sandbox']});
  const page = await browser.newPage();
  try {
    await page.goto(
        'https://news.ycombinator.com', {waitUntil: 'networkidle2'});
    await page.pdf({path: '/tmp/a.pdf', format: 'A4'});
    await browser.close();
  } catch (err) {
    console.error(err);
  }
}

async function sendTextMessage(id: string, text: string) {
  const payload = {
    'messaging_type': 'RESPONSE',
    'recipient': {'id': id},
    'message': {'text': text}
  };
  const options = {method: 'POST', uri: GRAPH_URL, body: payload, json: true};
  await request(options);
}

async function sendAttachment(id: string) {
  const formData = {
    'messaging_type': 'RESPONSE',
    'recipient': `{"id": ${id}}`,
    'message': '{"attachment": {"type": "file", "payload": {}}}',
    'filedata': fs.createReadStream('/tmp/a.pdf')
  };
  await request.post({url: GRAPH_URL, formData});
}
