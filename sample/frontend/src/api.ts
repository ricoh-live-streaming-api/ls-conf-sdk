/* eslint @typescript-eslint/camelcase: 0 */
import { API_BASE } from './constants';
const API_HEADERS = { 'Content-Type': 'application/json; charset=utf-8' };

// POST リクエストの共通ラッパー
async function fetchPost<T>(path: string, body?: Record<string, string | number | boolean>): Promise<T> {
  const response = await fetch(API_BASE + path, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: API_HEADERS,
  });
  // 異常系の場合 warning をログに出して、エラーを投げて終了する。
  if (!response.ok) {
    const data = await response.json();
    console.warn('API fetch Error, error=>', data);
    const error = new Error(response.statusText);
    throw error;
  }
  return response.json();
}

// Access Token の取得 API
export async function fetchAccessToken(roomId: string, connectionId: string): Promise<string> {
  return fetchPost('/access_token', { room_id: roomId, connection_id: connectionId });
}
