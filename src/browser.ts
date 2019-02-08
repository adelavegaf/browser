import {MessagingService} from './messaging-service';
import {Webpage} from './webpage';

enum Command {
  Navigate = 'Navigate'
}

export class Browser {
  static async execute(
      uid: string, text: string, messagingService: MessagingService) {
    const [commandName, ...commandArgs] = text.split(' ');
    switch (commandName) {
      case Command.Navigate:
        const [url] = commandArgs;
        const webpage = new Webpage(url);
        const pdf = await webpage.generatePDF();
        await messagingService.sendFile(
            uid, `${url}.pdf`, 'application/pdf', pdf);
        break;
      default:
        console.error(
            `Unknown command ${commandName} with args ${commandArgs}`);
        break;
    }
  }
}