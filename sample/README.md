# ls-conf-sample

`ls-conf-sdk` を使ってiframeの会議コンポーネント（LSConf）を利用するサンプルアプリケーションです。

## 動作要件

```shell
$ yarn -v
1.22.4
```

```shell
$ node -v
v16.18.1
```

## ローカル実行手順

アプリをローカルで動作させるには、frontend と backend の 2 つを起動する必要があります。

### backend

#### Step1. 設定ファイルの作成

`backend/config/local.json.sample` をコピーして `backend/config/local.json` を作成してください。

|項目|説明|
|:--|:--|
|port|backendのローカル実行時にbackendが待ち受けるポート番号|
|bitrateReservationMbps|Room毎に利用可能な帯域幅の最大値(※)<br>backendが発行するAccessTokenに含まれる `RoomSpec.media_control.bitrate_reservation_mbps` の値|

※ 設定値の決め方については [RICOH Live Streaming Client APP for THETA SenderとRICOH Live Streaming Conferenceを組み合わせて動作確認したい](https://api.livestreaming.ricoh/document/ricoh-live-streaming-client-app-for-theta-sender%e3%81%a8ricoh-live-streaming-conference%e3%82%92%e7%b5%84%e3%81%bf%e5%90%88%e3%82%8f%e3%81%9b%e3%81%a6%e5%8b%95%e4%bd%9c%e7%a2%ba%e8%aa%8d%e3%81%97/) をご参照ください。

#### Step2. 環境変数の設定

`direnv` などで環境変数を指定してください。

```
export LS_CLIENT_SECRET=XXXX // 発行されたClientSecretを指定してください
```

#### Step3. 実行

以下のコマンドを実行すると `http://localhost:4000` でサーバが起動します。

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
|上記以外のパラメータ|LSConfのcreate時のカスタマイズ設定を記載します<br>詳細は「RICOH Live Streaming Conference SDK API仕様」をご覧ください|

#### Step2. 実行

以下のコマンドを実行すると `http://localhost:3000` でサーバが起動します。

```shell
$ cd frontend # frontend へ移動
$ yarn        # パッケージのインストール
$ yarn start  # ローカル実行(webpackを利用)
...
 ｢wdm｣: Compiled successfully.
```

## 静的ファイルの生成

以下の手順でfrontendの静的ファイルを生成できます。

#### Step1. 設定ファイルの作成

ローカル実行時と同様に `frontend/config/local.json` を作成します。

#### Step2. 実行

以下のコマンドを実行すると `frontend/dist/` 下に成果物（静的ファイル）が生成されます。

```shell
$ rm -rf dist/* # dist/ 内を一度 clean にする
$ yarn          # パッケージのインストール
$ yarn build    # ビルド
...
 Done in 7.00s.
```

## ls-conf-sdk の更新

ls-conf-sdkを更新する場合、以下の2ファイルと`langディレクトリ`を差し替えてください。

- `frontend/`
  - `src/@types/ls-conf-sdk.d.ts`
  - `src/lib/ls-conf-sdk.js`
  - `src/lib/lang/`
