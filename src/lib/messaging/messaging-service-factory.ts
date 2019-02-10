import {FBMessenger} from './fbmessenger';
import {Message, MessagingService, Provider} from './messaging-service';

export class MessagingServiceFactory {
  static get(message: Message): MessagingService {
    switch (message.provider) {
      case Provider.Messenger:
        return new FBMessenger(process.env.PAGE_TOKEN as string);
      default:
        throw Error(`Message provider ${message.provider} not implemented.`);
    }
  }
}