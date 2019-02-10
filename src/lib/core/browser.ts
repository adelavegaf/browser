import {Message} from '../messaging/messaging-service';
import {MessagingServiceFactory} from '../messaging/messaging-service-factory';
import {Webpage} from './webpage';

enum Command {
  Navigate = 'Navigate'
}

export class Browser {
  static async execute(message: Message) {
    const messagingService = MessagingServiceFactory.get(message);
    const [commandName, ...commandArgs] = message.text.split(' ');
    switch (commandName) {
      case Command.Navigate:
        const [url] = commandArgs;
        const webpage = new Webpage(url);
        const pdf = await webpage.generatePDF();
        await messagingService.sendFile(
            message.id, `${url}.pdf`, 'application/pdf', pdf);
        break;
      default:
        console.error(
            `Unknown command ${commandName} with args ${commandArgs}`);
        break;
    }
  }
}