import { Injectable, Logger } from '@nestjs/common';

/**
 * Placeholder for future Expo Push Notification delivery.
 * Wire appointment reminder jobs to sendPushNotification() in a later phase.
 */
@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  async sendPushNotification(
    pushToken: string,
    title: string,
    body: string,
    data?: Record<string, unknown>,
  ): Promise<void> {
    this.logger.debug(
      `Push notification not implemented yet (token=${pushToken.slice(0, 12)}..., title=${title})`,
    );

    void body;
    void data;
  }
}
