import request from 'request';

import { LS_CLIENT_SECRET } from './app';

// Room情報の取得
export async function getRoomInfo(endpoint: string, clientId: string, roomId: string): Promise<unknown> {
  const options = {
    method: 'GET',
    json: true,
    url: `${endpoint}/clients/${clientId}/rooms/${roomId}?env=${getAPIEnv(endpoint)}`,
    auth: {
      user: clientId,
      password: LS_CLIENT_SECRET,
    },
  };
  return new Promise((resolve, reject) => {
    request(options, (error, response, body) => {
      console.log(`[rsi-ls-api] GET /clients/{client_id}/rooms/{room_id} ${response.statusCode}`);
      console.dir(body, { depth: null });
      if (error) {
        console.dir(error);
        reject(error);
      } else {
        resolve(body);
      }
    });
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
