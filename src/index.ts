import {processFbMessage} from './functions/http/process-fb-message';
import {processBrowserMessage} from './functions/pubsub/process-browser-message';


/**
 * Responds to a HTTP request from Facebook Messenger.
 */
exports.processFbMessage = processFbMessage;

/**
 * Responds to a message published to the "browser_topic" via pubsub.
 */
exports.processBrowserMessage = processBrowserMessage;