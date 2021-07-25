/* eslint @typescript-eslint/naming-convention: 0 */
import { addMinutes, getUnixTime } from 'date-fns';
import express, { NextFunction, Request, Response, Router } from 'express';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import * as path from 'path';

import { LS_CLIENT_SECRET } from '../app';

const router: Router = express.Router();
router.use(express.json());

//  ./config 下から環境変数を読み込む
const mode = process.env.NODE_ENV || 'development';
const isProduction = mode === 'production';
// production とそれ以外で読み込む JSON を変える
const configFileName = isProduction ? 'production.json' : 'local.json';
const configPath = path.resolve(__dirname, `../config/${configFileName}`);
// 動的にファイルパスを変更している以上 require を用いざるを得ないので eslint-disable している
// eslint-disable-next-line @typescript-eslint/no-var-requires
const configJson = require(configPath);

const generateToken = async (secret: string, req: Request): Promise<string> => {
  const { room_id, connection_id, bitrate_reservation_mbps, room_type } = req.body;
  const payload = {
    nbf: getUnixTime(new Date()),
    exp: getUnixTime(addMinutes(new Date(), 3)),
    connection_id: connection_id,
    room_id: room_id,
    room_spec: {
      type: room_type || 'sfu',
      media_control: {
        bitrate_reservation_mbps: Number(bitrate_reservation_mbps) || configJson.bitrate_reservation_mbps,
      },
    },
  };
  return jwt.sign(payload, secret, { algorithm: 'HS256' });
};

// body に各パラメタが渡されているかをチェックしている
const accessTokenValidator = [body('connection_id', 'invalid connection_id').notEmpty(), body('room_id', 'invalid room_id').notEmpty()];

router.post('/access_token', accessTokenValidator, async (req: Request, res: Response, _next: NextFunction) => {
  // XXX(kdxu): 画面共有は複数受け付けることになったので、排他ロックは行わないが
  // XXX(kdxu): 将来的にどこかで排他ロックが必要になった場合、disconnect 時に webhook 等でサーバに通知しないと排他ロックの実装ができないが
  // XXX(kdxu): 現状 SFU 側が event webhook に対応していない
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  if (!LS_CLIENT_SECRET) {
    // 起動時に LS_CLIENT_SECRET の存在チェックをしているので、ここに落ちることはないはずだが
    // TypeScript の型チェックを通すため、ここでも存在チェックを行っている
    throw new Error('LS_CLIENT_SECRET is not defined');
  }
  const access_token = await generateToken(LS_CLIENT_SECRET, req);
  res.json(access_token);
});

// healthcheck 用のエンドポイント
// text;plain で空 JSON を返却する
router.get('/health', (_req: Request, res: Response) => {
  res.type('text/plain');
  res.send({});
});

export default router;
