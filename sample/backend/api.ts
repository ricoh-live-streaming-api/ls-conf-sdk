import { Buffer } from 'buffer';
import fetch from 'node-fetch';

import { LS_CLIENT_SECRET } from './app';

// Room情報の取得
export async function getRoomInfo(endpoint: string, clientId: string, roomId: string): Promise<unknown> {
  const auth = Buffer.from(`${clientId}:${LS_CLIENT_SECRET}`).toString('base64');
  const options = {
    method: 'GET',
    headers: {
      Authorization: `Basic ${auth}`,
    },
  };
  const response = await fetch(`${endpoint}/clients/${clientId}/rooms/${roomId}?env=${getAPIEnv(endpoint)}`, options);
  console.log(`[rsi-ls-api] GET /clients/{client_id}/rooms/{room_id} ${response.status}`);
  return response.json().then((body) => {
    console.dir(body, { depth: null });
    return body;
  });
}

const getAPIEnv = (endpoint: string): string => {
  switch (endpoint) {
    case 'https://api.rsi-ls-dev.rinfra.ricoh.com/v1':
      return 'alpha';
    case 'https://api.livestreaming.mw.smart-integration.ricoh.com/v1':
    default:
      return 'prod';
  }
};
