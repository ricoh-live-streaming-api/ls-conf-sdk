# CHANGE LOG

## v2.4.0
- Added
  - [SDK] 接続, 切断系のイベントを追加
  - [SDK] Join時のconnectOptionsにvideoAudioConstraints, screenShareConstraintsを追加
  - [SDK] ツールバーに任意のボタンを追加する機能を追加
- Changed
  - [SDK] join時に一定時間で接続されない場合にタイムアウトのエラーが発生するように変更
  - [LSConf] `getDisplayMedia()`に非対応のブラウザではツールバーの画面共有ボタンが非表示になるように変更
  - [LSConf] スピーカーのデバイス変更に非対応のブラウザではデバイス設定ダイアログのスピーカーの項目がグレーアウトするように変更
  - [LSConf] iframeのwidthが900px以下の場合、PresentationLayoutの通常表示領域を非表示にするように変更
  - [LSConf] PCでSubView内にマウスカーソルがある場合にのみSubViewMenuのアイコンを表示するように変更
  - [LSConf] PresentationLayout で通常表示領域が非表示の場合にSubViewが大きく表示されるように変更
- Fixed
  - [LSConf] leave実行後に再度同じiframeでjoinするとイベントが受け取れなくなる問題を修正
  - [LSConf] join前にデバイス変更のAPIを実行すると、変更が反映されない問題を修正
  - [LSConf] join前にデバイス情報の取得APIを実行すると、デバイス情報が取得できない問題を修正
  - [LSConf] Firefoxで360映像の拡大/縮小ボタンが反応しないことがある問題を修正
  - [LSConf] Firefoxで setMicDevice の実行時にマイクが切り替わらない問題を修正
  - [LSConf] 特定の環境で PresentationLayout の通常表示領域のスクロールバーが常に表示される問題を修正
  - [LSConf] 360映像のSubViewでウィンドウサイズ変更時にエラーが起きる問題を修正
  - [LSConf] usernameが長い場合にSubViewのレイアウトが崩れる問題を修正
  - [LSConf] 自拠点映像の録画中にマイクミュートを行うと再度アンミュートしても録画ファイルにミュート後の音声が含まれない問題を修正
  - [LSConf] 自拠点映像の録画中にマイク/カメラを両方とも一度でもミュート状態にすると録画が停止される問題を修正
  - [LSConf] 会議中にカメラやマイクが切断された時に画面が固まる問題を修正

#### ツールバーに任意のボタンを追加する方法
1. create時のオプションで `toolbarItems` の配列に追加したいボタンを指定してください
  ~~~ts
  // チャットアイコンを指定する例
  {
    ...,
    "createParameters": {
      ...,
      "toolbar": {
        "toolbarItems": [{ "type": "chat", "iconName": "chat" }]
      },
      ...
    }
  }
  ~~~
2. 指定したtypeに対応するコールバックを `addApplicationEventListener` で登録してください
  ~~~ts
  iframe.addApplicationEventListener('chat', () => {
    console.log('Chat button pushed');
  });
  ~~~
3. ツールバーでチャットアイコン押下時に指定したコールバックが実行されます

## v2.3.0
- Added
  - [SDK] Join時のconnectOptionsにvideoCodecを追加
  - [SDK] ブラウザの言語設定による言語切替（日英）および文言のカスタマイズ機能を追加
  - [SDK] 静止画取得機能を追加
  - [LSConf] ローカル録画の設定ダイアログに全拠点の音声をMIXするオプションを追加
- Changed
  - [LSConf] setPoVの実行時にイージング処理によるアニメーションを追加
  - [LSConf] iframeのwidthが600px未満の時にPresentationLayoutの通常表示領域を非表示にするように変更
- Refactored
  - [LSConf] 依存ライブラリの更新

#### 言語ファイルの設置および文言の変更方法
1. 配布パッケージ内の `src/lang/` のディレクトリをアプリケーション内で `ls-conf-sdk.js` と同じディレクトリにディレクトリごと配置してください
  ~~~
  {配置先}/
     ├ ls-conf-sdk.js
     └ lang/
        ├ en.json
        └ ja.json
  ~~~
2. `{配置先}/lang/` 以下の各言語ファイル内の文言を必要に応じて変更し、保存してください
    - どの文言を変更するとどこに反映されるかの詳細は文言カスタマイズガイドを参照ください

## v2.2.4
- Changed
  - [LSConf] `ricoh-ls-sdk` を `v1.1.1` に更新
- Fixed
  - [LSConf] iOSとiPadOSで ダミーデバイス有効 または カメラマイクOFF で会議開始時に相手からの音声が再生されない問題を修正
  - [SDK/LSConf] 入室直後にカメラやマイクのミュート/アンミュートを行うとエラーが発生する問題を修正

## v2.2.3
- Added
  - [SDK] 録画できない条件で録画を開始した場合、録画開始失敗のエラーを追加
- Changed
  - [LSConf] デバイス設定ダイアログを表示している間はカメラ/マイクがミュートになるように変更
  - [LSConf] 録画機能を Windows, Mac かつ Chrome, Edge のみに制限
- Fixed
  - [LSConf] 録画停止ボタン以外での録画停止時に stopRecording のイベントが発火しない問題を修正
  - [LSConf] Androidの特定の機種 でデバイス設定からカメラデバイスが変更できない問題を修正
  - [LSConf] PresentationLayout で共通画面が勝手に拡大表示領域に表示されることがある問題を修正
  - [LSConf] デバイス設定からスピーカーデバイスの変更を行なっても指定したスピーカーから音が出ない問題を修正
  - [LSConf] カメラ/マイクのOFF時にデバイス設定の変更が反映されない問題を修正
  - [LSConf] 自拠点の画面共有の録画中に画面共有が終了した場合に録画が自動停止しない問題を修正
  - [LSConf] Safari で 録画ファイルが 0KB になってしまう問題を修正
  - [LSConf] iOS で デバイス設定からデバイス変更後に適用やキャンセルボタンが反応しないことがある問題を修正
  - [LSConf] Firefox で カメラOFFの状態で入室後にカメラONにして相手に映像が届かない問題を修正
  - [LSConf] Firefox で カメラOFFの状態で入室後にマイクデバイスの変更が反映されない問題を修正
  - [LSConf] Firefox で GalleryLayout の表示が崩れる問題を修正
  - [LSConf] iOS/iPadOS でデバイス設定ダイアログを閉じた後にマイクから音が出ないことがある問題を修正
  - [LSConf] changeLayout で指定以外の文字列が入った場合に GalleryLayout に切り替わる問題を修正

## v2.2.2
- Fixed
  - [LSConf] Chrome 92 のWebMediaPlayersの上限設定によりレンダリング時にSubView内の映像や音声が再生されなくなる問題を修正

## v2.2.1
- Changed
  - [LSConf] Videoのアスペクト比をデフォルトで16:9で取得するように変更
- Fixed
  - [LSConf] 録画通知の改善

## v2.2.0
- Added
  - [LSConf] PresentationLayoutの通常表示領域のレイアウトの切替機能を追加
- Fixed
  - [SDK] getSubViewsのレスポンスに自拠点と共有画面のSubViewが含まれない問題を修正

## v2.1.0
- Added
  - [SDK] 録画通知機能を追加
  - [SDK] デバイスの変更機能を追加
- Changed
  - [LSConf] デフォルトの背景色を透過に変更
- Fixed
  - [LSConf] 画面共有をしている会議に途中参加すると共有画面が表示されない問題を修正
- Refactored
  - [LSConf] 依存ライブラリの更新

## v2.0.0
- Added
  - [SDK] SubViewの強調表示機能を追加
- Changed
  - [SDK] 接続時にconnectionIdを渡すように仕様を変更
  - [LSConf] 複数拠点を同時にローカル録画できるように変更
- Fixed
  - [LSConf] 画面共有時にアクセストークンの取得に失敗した際に状態がおかしくなる問題を修正
  - [LSConf] カメラミュート時にカメラのアクセスランプが光ったままになる問題を修正
  - [LSConf] 一部のコンポーネントにフォントが適用されない問題を修正

### 破壊的な変更による修正内容
#### join時の引数の追加
join時にconnectionIdが必須パラメータとなります。

```ts
// 2.0.0 以前
iframe.join({
  clientId: 'hoge',
  acccessToken: accessToken,
  connectOptions: {
    username: 'huga'
    enableVideo: true,
    enableAudio: true,
  }
});

// 2.0.0 以降
iframe.join({
  clientId: 'hoge',
  acccessToken: accessToken,
  connectionId: 'connectionId', // アクセストークンで指定したconnectionIdと同じ値を指定
  connectOptions: {
    username: 'huga'
    enableVideo: true,
    enableAudio: true,
  }
});
```

#### onShareRequestedの戻り値の追加
onShareRequestedの戻り値にconnectionIdを加えたScreenShareParametersが必須パラメータとなります。

```ts
// 2.0.0 以前
iframe.onShareRequested(() => {
  let accessToken = null;
  try {
    accessToken = await createAccessToken();
  } catch(error) {
    console.error('createAccessToken failed: ', error.detail.type);
  }
  return accessToken;
});

// 2.0.0 以降
iframe.onShareRequested(() => {
  let accessToken = null;
  try {
    accessToken = await createAccessToken();
  } catch(error) {
    console.error('createAccessToken failed: ', error.detail.type);
  }
  const screenShareParameters = {
    connectionId: 'screenShareConnectionId', // アクセストークンで指定したconnectionIdと同じ値を指定
    accessToken: accessToken,
  };
  return screenShareParameters;
});
```

## v1.2.5
- Added
  - [SDK] 視点共有機能を追加
- Changed
  - [LSConf] OnTrackTimeout発生時にignoreするように変更
- Fixed
  - [SDK] CreateParametersの各パラメータがオプショナル化されていなかったのを修正
  - [LSConf] SubViewMenu表示時にGalleryレイアウトが崩れることがある問題を修正
  - [LSConf] Galleryレイアウトの通常表示領域が6拠点以上になると画面が崩れる問題を修正
  - [LSConf] usernameとconnectionIdが異なる場合にTHETA拠点の映像がリセットされる問題を修正

## v1.2.4
- Added
  - [SDK] コンポーネント単位のテーマ変更機能を追加
- Changed
  - [LSConf] デフォルトの背景色を不透過に変更
  - [LSConf] ツールバーの参加者一覧ボタンをデフォルトで非表示に変更
- Fixed
  - [LSConf] Join時のenableAudio/enableVideoの設定が効かない問題を修正
  - [LSConf] WebM形式の録画ファイル再生時にシークが遅い問題を修正
  - [LSConf] 画面共有時にGalleryレイアウトが崩れる問題を修正
  - [LSConf] THETA映像の表示領域が再描画のたびにリセットされる問題を修正
  - [LSConf] THETA映像の初期表示領域がブラウザによって異なる問題を修正

## v1.2.3
- Fixed
  - [LSConf] ツールバーサイズがiframeの幅に応じて変化しない問題を修正

## v1.2.2
- Added
  - [SDK] ローカル録画対応
- Changed
  - [SDK] デバイス取得に失敗したときはダミーデバイスで会議開始するように変更
- Fixed
  - [LSConf] iOS+Safariでレイアウト制御がおかしくなる問題を修正

## v1.2.1
- Fixed
  - [LSConf] マイクミュート状態の拠点がいる場合にレイアウト制御がおかしくなる問題を修正

## v1.2.0
- Changed
  - [SDK] 外部向けインタフェース仕様の修正

## v1.1.1
- Added
  - [SDK] テーマ変更対応
  - [SDK] ダミーデバイス対応
- Changed
  - [LSConf] ダブルタップ判定処理を修正
- Fixed
  - [LSConf] Safariの特定のバージョンで他拠点の音声が聞こえなくなる問題を修正
  - [LSConf] iOS+Safariでレイアウト切替後に自拠点映像が黒くなる問題を修正
- Refactored
  - [LSConf] `ricoh-ls-sdk` を `v1.0.4` に更新

## v1.1.0
- Added
  - [SDK] レイアウト変更APIの追加
  - [LSConf] iframeのフレームサイズが小さい時に自動的にツールバーを小さくする

## v1.0.2
- Changed
  - [LSConf] videoContainerを常に保持するように修正

## v1.0.1
- Changed
  - [LSConf] エラー処理修正

### v1.0.0
- Changed
  - [SDK] LS-PF Prod環境 対応（`DEFAULT_SIGNALING_URL`の修正）
  - [LSConf] エラー処理修正
- Refactored
  - [LSConf] `ricoh-ls-sdk` を `v1.0.1` に更新

## v0.0.11
- Fixed
  - [LSConf] Androidからの映像が表示されない不具合の修正

## v0.0.10
- Fixed
  - [LSConf] Prod環境で相手からの映像が届かない不具合の修正

## v0.0.9
- Added
  - [SDK] デバイス設定のツールバーのボタン非表示APIの追加
  - [SDK] 映像の最大送信ビットレートの指定APIの追加
  - [SDK] 解析ログの取得APIの追加
  - [LSConf] デバイス設定の追加
  - [LSConf] 参加拠点のミュート状態表示
  - [LSConf] ハードミュート対応
  - [LSConf] THETAのSubView内に拡大縮小ボタンを追加
- Changed
  - [SDK] 解析ログのエラー処理の修正
- Fixed
  - [LSConf] isThetaのメタデータの指定がない場合に映像が表示されない問題を修正
  - [LSConf] THETAの拡大縮小ボタン押下時に画面が白くなる問題を修正
- Refactored
  - [LSConf] `ricoh-ls-sdk` を `v0.6.2` に更新

## v0.0.8
- Changed
  - [LSConf] addRemoteTrackのmediaTypeが未指定時の場合に`'VIDEO_AUDIO'`として扱うように修正
  - [LSConf] Presentation Layout へ切り替える際は mainConnectionIds をクリアするよう修正
  - [LSConf] cappella-web のエラーを error event として通知するように修正する
  - [LSConf] removeremoteconnection 時の mainConnectionIds の処理を修正する
- Refactored
  - [LSConf] @types/webrtc パッケージを取り除く

## v0.0.7
- Added
  - [LSConf] PresentationLayoutの複数拠点対応
- Changed
  - [SDK] LS-PF Dev環境 対応（`DEFAULT_LS_CONF_URL`, `DEFAULT_SIGNALING_URL`の修正）
  - [SDK] remoteTrackRemovedイベントを削除
  - [LSConf] three.js対応
- Refactored
  - [LSConf] `ricoh-ls-sdk` を `v0.3.0` に更新

## v0.0.6
- Changed
  - [SDK] `DEFAULT_LS_CONF_URL` に `/index.html` を付与するよう修正

## v0.0.5
- Changed
  - [LSConf] room の routes に `/${LS_CONF_SDK_VERSION}/index.html` を追加

## v0.0.4
- Changed
  - [LSConf] LSConf の room の path を `/${ls_conf_sdk_version}/` となるように修正

## v0.0.3
- Changed
  - [LSConf] LSConf のアセットファイルの展開先が `/${ls-conf-sdk-version}/` となるよう修正

## v0.0.2
- Changed
  - [SDK] lsConfURL が指定されている場合は iframeElement.src を lsConfURL で上書きするように修正
  - [LSConf] DEFAULT_LS_CONF_URL を `https://conf.rsi-ls-dev.rinfra.ricoh.com/{LSConfSDKバージョン}` に修正

## v0.0.1
- ファーストリリース
