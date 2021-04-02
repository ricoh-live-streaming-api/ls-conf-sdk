import express, { Express } from 'express';
import logger from 'morgan';
import * as path from 'path';

import router from './routes/index';

//  ./config 下から環境変数を読み込む
const mode = process.env.NODE_ENV || 'development';
const isProduction = mode === 'production';
// production とそれ以外で読み込む JSON を変える
const configFileName = isProduction ? 'production.json' : 'local.json';
const configPath = path.resolve(__dirname, `config/${configFileName}`);
// 動的にファイルパスを変更している以上 require を用いざるを得ないので eslint-disable している
// eslint-disable-next-line @typescript-eslint/no-var-requires
const configJson = require(configPath);

// port が定義されていない場合起動時に Error を投げて終了する
if (!configJson.port) {
  throw new Error(`port is not defined at ${configPath.toString()}`);
}
const port = configJson.port;
// process.env.LS_CLIENT_SECRET が定義されていない場合起動時に Error を投げて終了する
if (!process.env.LS_CLIENT_SECRET) {
  throw new Error('process.env.LS_CLIENT_SECRET is not defined');
}
export const LS_CLIENT_SECRET = process.env.LS_CLIENT_SECRET;

const app: Express = express();

app.use(logger('tiny'));
app.use('/', router);
export const server = app.listen(port, () => console.log(`Api Server listening on port ${port}!`));
