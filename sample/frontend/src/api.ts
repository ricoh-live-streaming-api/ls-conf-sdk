/* eslint @typescript-eslint/naming-convention: 0 */
import { API_BASE } from './constants';
const API_HEADERS = { 'Content-Type': 'application/json; charset=utf-8' };
const validateBitrateReservation = (bitrate: string): boolean => {
  const param = Number(bitrate);
  if (!isNaN(param) && param >= 1 && param <= 250) {
    return true;
  }
  return false;
};
const validateRoomType = (roomType: string): boolean => {
  if (roomType === 'sfu' || roomType === 'sfu_large' || roomType === 'p2p' || roomType === 'p2p_turn') {
    return true;
  }
  return false;
};
const validateMaxConnections = (maxConnections: string): boolean => {
  const param = Number(maxConnections);
  if (!isNaN(param) && Number.isInteger(param) && param > 0) {
    return true;
  }
  return false;
};

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
export async function fetchAccessToken(roomId: string, connectionId: string, bitrateReservation?: string, roomType?: string, maxConnections?: string): Promise<string> {
  const body: Record<string, string | number | boolean> = { room_id: roomId, connection_id: connectionId };
  if (bitrateReservation && validateBitrateReservation(bitrateReservation)) {
    body['bitrate_reservation_mbps'] = bitrateReservation;
  }
  if (roomType && validateRoomType(roomType)) {
    body['room_type'] = roomType;
  }
  if (maxConnections && validateMaxConnections(maxConnections)) {
    body['max_connections'] = maxConnections;
  }
  return fetchPost('/access_token', body);
}
