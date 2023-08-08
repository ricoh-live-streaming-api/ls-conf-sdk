/* eslint @typescript-eslint/naming-convention: 0 */
import { API_BASE } from './constants';
import { AccessTokenSetting } from './types';

const API_HEADERS = { 'Content-Type': 'application/json; charset=utf-8' };

/**
 * 入力された値を数値に変換します。
 *
 * @param unverified - 数値に変換する値。
 * @returns 変換後の数値。変換できる値ではない場合は undefined 。
 */
const convertToNumber = (unverified: unknown): number | undefined => {
  if (unverified == undefined) {
    return undefined;
  }
  const num = Number(unverified);
  if (isNaN(num)) {
    return undefined;
  }
  return num;
};

/**
 * backend に POST リクエストを発行します。
 *
 * @param path - リクエストする path
 * @param body - リクエスト body
 * @returns API実行結果の body に含まれる JSON 。
 */
const fetchPost = async <T>(path: string, body: Record<string, unknown>): Promise<T> => {
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
};

/**
 * AccessTokenSetting を生成します。
 *
 * @param roomId - 入室する Room の ID
 * @param connectionId - 自 Connection の ID
 * @param bitrateReservation - Room ごとに利用可能な帯域幅の最大値を Mbps 単位で指定
 * @param roomType - Room の種類
 * @param maxConnections - Room に入室できる最大 Connection 数
 * @returns AccessTokenSetting
 */
export const createAccessTokenSetting = (roomId: string, connectionId: string, bitrateReservation: unknown, roomType: unknown, maxConnections: unknown): AccessTokenSetting => {
  return {
    room_id: roomId,
    connection_id: connectionId,
    room_spec: {
      // string が与えられていない場合はデフォルト値として "sfu" を適用する
      type: typeof roomType === 'string' ? roomType : 'sfu',
      media_control: {
        bitrate_reservation_mbps: convertToNumber(bitrateReservation),
      },
      max_connections: convertToNumber(maxConnections),
    },
  };
};

/**
 * Access Token を取得します。
 * @param accessTokenSetting - AccessTokenSetting
 * @returns Access Token
 */
export const fetchAccessToken = async (accessTokenSetting: AccessTokenSetting): Promise<string> => {
  return fetchPost('/access_token', accessTokenSetting);
};
