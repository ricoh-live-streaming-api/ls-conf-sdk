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
  if (roomType === 'sfu' || roomType === 'p2p' || roomType === 'p2p_turn') {
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
export async function fetchAccessToken(roomId: string, connectionId: string, bitrateReservation?: string, roomType?: string): Promise<string> {
  if (bitrateReservation && validateBitrateReservation(bitrateReservation) && roomType && validateRoomType(roomType)) {
    return fetchPost('/access_token', { room_id: roomId, connection_id: connectionId, bitrate_reservation_mbps: bitrateReservation, room_type: roomType });
  } else if (bitrateReservation && validateBitrateReservation(bitrateReservation)) {
    return fetchPost('/access_token', { room_id: roomId, connection_id: connectionId, bitrate_reservation_mbps: bitrateReservation });
  } else if (roomType && validateRoomType(roomType)) {
    return fetchPost('/access_token', { room_id: roomId, connection_id: connectionId, room_type: roomType });
  } else {
    return fetchPost('/access_token', { room_id: roomId, connection_id: connectionId });
  }
}
