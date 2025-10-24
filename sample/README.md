# ls-conf-sample

`ls-conf-sdk` を使って iframe の会議コンポーネント（LSConf）を利用するサンプルアプリケーションである。

## 動作要件

```shell
$ yarn -v
1.22.4
```

```shell
$ node -v
v20.13.0
```

## ローカル実行手順

アプリをローカルで動作させるには、frontend と backend の 2 つを起動する必要がある。

### backend

#### Step1. 設定ファイルの作成

`backend/config/local.json.sample` をコピーして `backend/config/local.json` を作成してください。

|項目|説明|
|:--|:--|
|port|backendのローカル実行時にbackendが待ち受けるポート番号|
|bitrateReservationMbps|Room毎に利用可能な帯域幅の最大値(※)<br>backendが発行するAccessTokenに含まれる `RoomSpec.media_control.bitrate_reservation_mbps` の値|

<!-- textlint-disable ja-technical-writing/sentence-length -->
※ 設定値の決め方については [RICOH Live Streaming Client APP for THETA SenderとRICOH Live Streaming Conferenceを組み合わせて動作確認したい](https://livestreaming.ricoh/docs/combined-operation-check/) をご参照ください。
<!-- textlint-enable ja-technical-writing/sentence-length -->

#### Step2. 環境変数の設定

`direnv` などで環境変数を指定してください。

```
export LS_CLIENT_SECRET=XXXX // 発行されたClientSecretを指定してください
```

#### Step3. 実行

以下のコマンドを実行すると `http://localhost:4000` でサーバが起動される。

```shell
$ cd backend # backend へ移動
$ yarn       # パッケージのインストール
$ yarn start # ローカル実行(expressを利用)
...
Api Server listening on port 4000!
```

### frontend

#### Step1. 設定ファイルの作成

`frontend/config/local.json.sample` をコピーして `frontend/config/local.json` を作成し、`clientId` を設定してください。

|項目|説明|
|:--|:--|
|apiBase|backendのAPIリクエスト先のURL|
|clientId|発行されたClientIDを指定してください|
|上記以外のパラメータ|LSConfのcreate時のカスタマイズ設定を記載します<br>詳細は [RICOH Live Streaming Conference SDK API仕様](https://github.com/ricoh-live-streaming-api/ls-conf-sdk/blob/main/doc/APIReference.md)　をご覧ください|

#### Step2. 実行

以下のコマンドを実行すると `http://localhost:3000` でサーバが起動される。

```shell
$ cd frontend # frontend へ移動
$ yarn        # パッケージのインストール
$ yarn start  # ローカル実行(webpackを利用)
...
 ｢wdm｣: Compiled successfully.
```

※) Cross-Origin 系のヘッダについて。

メモリ使用量の取得に [performance.measureUserAgentSpecificMemory()](https://developer.mozilla.org/ja/docs/Web/API/Performance/measureUserAgentSpecificMemory) を使用するため Cross-Origin 系のヘッダを設定している。

そのため Cross-Origin 系のヘッダを設定していない LSConf は開くことができない。

`frontend/webpack.config.js` の devserver の設定から Cross-Origin 系のヘッダを削除することで、そのような LSConf も表示できる。

（この場合メモリ使用量の取得には [performance.memory](https://developer.mozilla.org/ja/docs/Web/API/Performance/memory) が使用される）

```javascript
      headers: {
        // メモリ使用量の取得で performance.measureUserAgentSpecificMemory() を使用するため Cross-Origin 系のヘッダを追加
        // cf: https://developer.mozilla.org/ja/docs/Web/API/Performance/measureUserAgentSpecificMemory
        // Cross-Origin 系のヘッダが設定されていない LSConf を参照する場合は以下の Cross-Origin 系のヘッダを削除（コメントアウト）する
        'Cross-Origin-Opener-Policy': 'same-origin',
        'Cross-Origin-Embedder-Policy': 'require-corp',
      },
```

## 静的ファイルの生成

以下の手順で frontend の静的ファイルを生成できる。

#### Step1. 設定ファイルの作成

ローカル実行時と同様に `frontend/config/local.json` を作成する。

#### Step2. 実行

以下のコマンドを実行すると `frontend/dist/` 下に成果物（静的ファイル）が生成される。

```shell
$ rm -rf dist/* # dist/ 内を一度 clean にする
$ yarn          # パッケージのインストール
$ yarn build    # ビルド
...
 Done in 7.00s.
```

## ls-conf-sdk の更新

ls-conf-sdk を更新する場合、以下の 2 ファイルと`langディレクトリ`を差し替えてください。

- `frontend/`
  - `src/@types/ls-conf-sdk.d.ts`
  - `src/lib/ls-conf-sdk.js`
  - `src/lib/lang/`
