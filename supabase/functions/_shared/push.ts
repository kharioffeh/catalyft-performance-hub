import { Expo } from 'https://esm.sh/expo-server-sdk@3';

const expo = new Expo();

export interface PushMessage {
  to: string;
  sound?: 'default';
  title?: string;
  body?: string;
  data?: any;
  channelId?: string;
  priority?: 'default' | 'normal' | 'high';
  badge?: number;
}

export async function sendPushNotification(message: PushMessage): Promise<boolean> {
  try {
    // Check that the push token is valid
    if (!Expo.isExpoPushToken(message.to)) {
      console.error(`Push token ${message.to} is not a valid Expo push token`);
      return false;
    }

    // Create the message
    const messages = [{
      to: message.to,
      sound: message.sound || 'default',
      title: message.title,
      body: message.body,
      data: message.data || {},
      channelId: message.channelId,
      priority: message.priority || 'default',
      badge: message.badge,
    }];

    // Send the push notification
    const chunks = expo.chunkPushNotifications(messages);
    const tickets = [];

    for (const chunk of chunks) {
      try {
        const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      } catch (error) {
        console.error('Error sending push notification chunk:', error);
        return false;
      }
    }

    // Check for errors in tickets
    for (const ticket of tickets) {
      if (ticket.status === 'error') {
        console.error('Push notification error:', ticket.message);
        if (ticket.details?.error) {
          console.error('Error details:', ticket.details.error);
        }
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Error in sendPushNotification:', error);
    return false;
  }
}

export async function sendBulkPushNotifications(messages: PushMessage[]): Promise<{ sent: number; failed: number }> {
  let sent = 0;
  let failed = 0;

  // Filter for valid tokens only
  const validMessages = messages.filter(message => {
    if (!Expo.isExpoPushToken(message.to)) {
      console.error(`Push token ${message.to} is not a valid Expo push token`);
      failed++;
      return false;
    }
    return true;
  });

  if (validMessages.length === 0) {
    return { sent, failed };
  }

  try {
    const chunks = expo.chunkPushNotifications(validMessages);
    const tickets = [];

    for (const chunk of chunks) {
      try {
        const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      } catch (error) {
        console.error('Error sending push notification chunk:', error);
        failed += chunk.length;
      }
    }

    // Count successes and failures
    for (const ticket of tickets) {
      if (ticket.status === 'ok') {
        sent++;
      } else {
        failed++;
        console.error('Push notification error:', ticket.message);
        if (ticket.details?.error) {
          console.error('Error details:', ticket.details.error);
        }
      }
    }

    return { sent, failed };
  } catch (error) {
    console.error('Error in sendBulkPushNotifications:', error);
    return { sent, failed: validMessages.length };
  }
}