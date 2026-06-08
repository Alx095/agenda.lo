import { authorizedRequest } from './client';

export type UpdatePushTokenPayload = {
  pushToken: string;
};

export async function updatePushTokenRequest(
  pushToken: string,
): Promise<void> {
  await authorizedRequest<void>('/users/me/push-token', {
    method: 'PATCH',
    body: JSON.stringify({ pushToken }),
  });
}
