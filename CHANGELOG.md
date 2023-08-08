# CHANGE LOG

## v5.3.0
- Added
  - [SDK] ConnectOptions に iceServersProtocol のオプションを追加

## v5.2.0
- Added
  - [SDK] `lang/` 配下に各言語の {RFC5646の言語タグ}.json を配置することで任意の言語に対応できる機能を追加
  - [SDK] Playerの再生状態変化のイベントを追加
- Changed
  - [SDK] 自拠点がカメラミュートの状態で自拠点のSubViewを録画した場合に StartRecordingFailed のエラーを返すように変更
  - [LSConf] ローカル録画でサポートする MIMEType を追加
  - [LSConf] デザインカスタマイズパラメータの追加および変更
  - [LSConf] 通常映像の拡大表示時にSubViewの黒帯の領域にも映像を表示できるように変更
  - [LSConf] GalleryLayout および PresentationLayout の通常表示領域 のSubViewの表示上限を16に変更
  - [LSConf] audioMuteType のデフォルト値を "soft" に変更
- Fixed
  - [LSConf] 通常映像の描画時にGPUの負荷が高くなる問題を修正
  - [LSConf] 書き込み機能でカメラON直後にストロークの書き込み位置がズレる問題を修正
  - [LSConf] `web-sdk` を `v1.7.1` に更新
  - [LSConf] Gallaryレイアウト または Presentationレイアウト で非表示領域のSubViewがカメラONで表示領域に表示された時に映像の自動受信が再開されない問題の修正
  - [LSConf] WebGL の Context lost が発生して描画がチラつくことがある問題を修正
  - [LSConf] 画面共有中のウィンドウサイズの高さだけが変更されると受信側でSubViewのアスペクト比が崩れる問題の修正
  - [LSConf] Mac Safari でデバイス設定ダイアログでデバイスを変更してキャンセルした時に変更後のデバイスに切り替わる問題の修正
  - [LSConf] 天頂補正の値が 0 の時に補正されない問題の修正
  - [SDK, LSConf] 依存ライブラリの更新

## v5.1.3
- Fixed
  - [LSConf] iOS/iPadOS15系でデバイス設定ダイアログを開いた後にマイクの音声が相手に聞こえなくなる問題の修正

## v5.1.2
- Fixed
  - [LSConf] Gallaryレイアウト または Presentationレイアウト で非表示領域のSubViewがカメラONで表示領域に表示された時に映像の自動受信が再開されない問題の修正

## v5.1.1
- Fixed
  - [LSConf] Gallaryレイアウト または Presentationレイアウト で非表示領域のSubViewがカメラONで表示領域に表示された時に映像の自動受信が再開されない問題の暫定対応

## v5.1.0
- Added
  - [SDK] 切替可能な言語を追加（タイ語, ベトナム語, 韓国語, 中国語簡体字, 中国語繁体字）

## v5.0.1
- Fixed
  - [LSConf] iOS15以前でjoinできない問題の修正

## v5.0.0
- Added
  - [LSConf] 通常映像のSubViewに対しての書き込み機能を追加
  - [LSConf] Player時に後から動画ファイルを追加/更新する機能を追加
  - [LSConf] デバイス設定ダイアログにマイクとスピーカーのテスト機能を追加
- Changed
  - [SDK] VideoSource に metaUrl を別で指定できるように変更
  - [SDK] join時とonShareRequested時にconnectionIdの指定が不要に変更
  - [LSConf] 一部レイアウトでカメラがONのSubViewを上位に表示するように変更
  - [LSConf] `web-sdk` を `v1.6.1` に更新
  - [LSConf] Node 16 に対応
  - [SDK, LSConf] 依存ライブラリの更新
- Fixed
  - [SDK] updatePointerを高頻度で呼んだ時に描画が遅くなる問題の修正
  - [LSConf] ダミーデバイス利用時に対向側の発話中に状態表示が反応しない問題の修正
  - [LSConf] Player時のシークバーの操作後に再生が安定しない問題の修正
  - [LSConf] Connection と Track の Metadata が未指定のクライアントの参加/退室時にイベントの値が不正になる問題の修正

### 破壊的な変更による修正内容
#### join時とonShareRequested時にconnectionIdの指定が不要に変更
これまで join時 や onShareRequested時 に connectionId を指定していましたが、[AccessToken](https://api.livestreaming.ricoh/docs/access-token-specification) の connection_id を参照することになったため、指定が不要になりました。

join時
```ts
// 5.0.0 以前
try {
  await iframe.join(LS_CLIENT_ID, accessToken, connectionId, connectOptions);
} catch (e) {
  console.log(e.message)
}

// 5.0.0 以降
try {
  await iframe.join(LS_CLIENT_ID, accessToken, connectOptions);
} catch (e) {
  console.log(e.message)
}
```

onShareRequested時
```ts
// 5.0.0 以前
iframe.onShareRequested(async () => {
  let accessToken = null;
  try {
    accessToken = await createAccessToken();
  } catch(error) {
    console.error('createAccessToken failed: ', error.detail.type);
  }
  const screenShareParameters = {
    connectionId: 'screenShareConnectionId',
    accessToken: accessToken,
  };
  return screenShareParameters;
});

// 5.0.0 以降
iframe.onShareRequested(async () => {
  let accessToken = null;
  try {
    accessToken = await createAccessToken();
  } catch(error) {
    console.error('createAccessToken failed: ', error.detail.type);
  }
  return accessToken;
});
```

## v4.1.0
- Added
  - [LSConf] Player時の同期再生機能を追加
  - [LSConf] 話者表示機能を追加
  - [SDK] create時のCreateParametersに話者表示関連のカスタマイズパラメータを追加
  - [SDK] SubViewMenuに任意のメニューを追加する機能を追加
  - [SDK] join時のconnectOptionsにマイクのミュート設定を追加
- Changed
  - [SDK] ローカル録画時に黒画面を検知すると `RecordingErrorBlackScreen` のエラーが発生するように変更
- Fixed
  - [LSConf] ChromeとEdgeでデバイス設定ダイアログでデバイス名が表示されないことがある問題の修正 
  - [LSConf] viewerモード時に360映像が自動再生されない問題の修正 
  - [LSConf] setPoV実行後の移動アニメーション中にgetPoVを実行すると移動が中断する問題の修正
  - [LSConf] updatePointerでのcolor指定が特定の指定方法では反映されない問題の修正
- Refactored
  - [SDK, LSConf] 依存ライブラリの更新

## v4.0.0
- Added
  - [SDK] 通常映像の拡大/縮小の有効/無効を切り替える機能を追加
  - [SDK] SubView毎のStats情報を取得する機能を追加
  - [SDK] 360映像の自動天頂補正機能(※1)および手動で補正する機能を追加
  - [SDK] 動画ファイルのURLを指定して再生するプレイヤー機能(β)を追加
- Changed
  - [SDK] `getSubViews` のレスポンスのSubViewにカメラとマイクのミュート状態を追加
  - [SDK] ストリングリテラル型を明示的に型定義するように変更
  - [SDK] APIの実行時エラーとイベントリスナーによるエラーイベントを分離
  - [SDK] `addEventListener` で `options.once` 未指定時に毎回イベントが発火するように変更
  - [SDK] join時の受信専用のモード設定機能をβから正式機能に変更
- Fixed
  - [SDK] 一部のエラーイベントで内部構成が仕様と異なっていた問題を修正
  - [LSConf] UIの再描画時に360映像の視点がリセットされる問題を修正
  - [LSConf] `getSubViews` の実行時に自拠点の画面共有のSubViewが重複する問題を修正
  - [LSConf] 切断と映像受信停止のタイミングが重なるとInternalErrorが発生して会議から切断される問題を修正
  - [LSConf] `create` を複数回実行した際に古いイベントリスナーが残る問題を修正
  - [LSConf] join直後に `getSubViews` を実行すると誤ったレスポンスが返ってくる問題を修正
  - [LSConf] 自拠点の画面共有開始時に `remoteConnectionAdded` のイベントが発生する問題を修正
- Refactored
  - [LSConf] `web-sdk` を `v1.4.0` に更新
  - [LSConf] 内部で保持するSubView一覧の構成を変更

(※1) 本機能は `THETAプラグイン側` で取得した各パラメータを TrackMetadata に `pitch`, `roll` のキー名で追加した上でClientSDKの `updateTrackMeta` を呼ぶ必要があります。LSConf側では TrackMetadata の更新のたびに天頂補正処理が実行されます。

### 破壊的な変更による修正内容
#### APIの実行時エラーとイベントリスナーによるエラーイベントを分離
これまでAPI実行時のエラーは `Promise.reject` と `エラーイベント` の両方を返していましたが、API実行時のエラーは`Promise.reject` のみ返すように仕様変更します。

```ts
// 実装部分
iframe.addEventListener('error', async (e: ErrorEvent) => {
  console.log('エラーイベントが発火');
});

try {
  await iframe.join('client_id', 'access_token', 'connection_id', connectOptions);
} catch {
  console.log('実行時エラーが発生');
}

// 4.0.0 以前 で join時エラーが発生した場合のコンソールログ
実行時エラーが発生
エラーイベントが発火

// 4.0.0 以降 で join時エラーが発生した場合のコンソールログ
実行時エラーが発生
```

#### `addEventListener` で `options.once` 未指定時に毎回イベントが発火するように変更
`addEventListener` のデフォルト値が `options.once = false` となるため、一度だけ発火させたい場合にのみ `options.once = true` を明示的に指定してください。

```ts
// 4.0.0 以前
iframe.addEventListener('error', async (e: ErrorEvent) => {
  console.log(e.message);
}, { once: false });

// 4.0.0 以降
iframe.addEventListener('error', async (e: ErrorEvent) => {
  console.log(e.message);
});
```

## v3.0.1
- Fixed
  - [LSConf] 多拠点参加時に自拠点の画面共有を開始するとブラウザのタブがクラッシュする問題を修正

## v3.0.0
- Added
  - [SDK] join時に受信専用のモード設定機能(β)を追加
  - [SDK] 360映像にポインタを表示する機能(β)を追加
  - [SDK] SubViewの非表示/表示時に映像を自動的に受信停止/再開する処理の有効/無効を切り替える機能を追加
  - [SDK] CreateParametersに入室画面の設定オプションを追加
- Changed
  - [SDK] create時の一部カスタマイズパラメータを変更
  - [SDK] create時のタイムアウト時間を5秒から15秒に変更
  - [SDK] `changeLayout` にSubViewを指定できるように変更
  - [SDK] `onSharePoV` を addEventListener で登録する仕様に変更
  - [SDK] ログ取得関連の非推奨のメソッドを削除
  - [SDK] `addEventListener` にLSConf固有のイベントしか登録できない仕様に変更
  - [SDK] `dispatchEvent` を廃止
  - [LSConf] SubViewの非表示/表示時に映像を自動的に受信停止/再開するように変更
  - [LSConf] SubViewの最小幅を定義し、それを下回る場合は画面スクロールが発生するように変更
  - [LSConf] 360映像がPresentationレイアウトの通常表示領域にある場合、拡大/縮小ボタンが非表示になるように変更
- Fixed
  - [LSConf] 特定の環境で通話開始時に相手からの音声が聞こえない問題を修正(※1)
  - [LSConf] Safariで360映像の天地が反転する問題を修正
  - [LSConf] 特定の操作で360映像の座標情報が規定外の値になる問題を修正
- Refactored
  - [SDK] 不要なコンソールログを削除

(※1) 本不具合は入室時のクリック画面でのユーザー操作（クリック, タップ）を伴うことで解消します。入室時画面の設定が"none"の場合はこれまで通りデバイスのアクセス許可が必要です。

### 破壊的な変更による修正内容

#### create時の一部カスタマイズパラメータを変更
create時に以下のカスタマイズパラメータのインタフェースが変更となります。

```ts
// 3.0.0 以前
iframe = window.LSConferenceIframe.create(
  document.getElementById('frame-container'),
  {
    toolbar: {
      toolbarItems: [{ "type": "chat", "iconName": "chat" }]
    },
    isHiddenVideoMenuButton: false,
    isHiddenRecordingButton: false,
    isHiddenSharePoVButton: true,
  }
);

// 3.0.0 以降
iframe = window.LSConferenceIframe.create(
  document.getElementById('frame-container'),
  {
    toolbar: {
      customItems: [{ "type": "chat", "iconName": "chat" }]
    },
    subView: {
      menu: {
        isHidden: false,
        isHiddenRecordingButton: false,
        isHiddenSharePoVButton: true,
      },
    }
  }
);
```

#### `onSharePoV()` を addEventListener で登録する仕様に変更
`onSharePoV()` は `sharePoV` のイベントを addEventListener で登録する仕様に変更となります。

```ts
// 3.0.0 以前
iframe.onSharePoV((subView: SubView, poV: PoV) => {
  console.log(`onSharePoV: subView: ${JSON.stringify(subView)}, poV: ${JSON.stringify(poV)}`);
});

// 3.0.0 以降
iframe.addEventListener('sharePoV', (e: CustomEvent) => {
  console.log(`sharePoV: subView: ${JSON.stringify(e.detail.subView)}, poV: ${JSON.stringify(e.detail.poV)}`);
});
```

#### ログ取得関連の非推奨のメソッドを削除
`getVideoAudioLog` および `getScreenShareLog`が削除されます。
問い合わせ時のログ取得には `getLSConfLog` をご利用ください。

```ts
// 3.0.0 以前
const log1 = await iframe.getVideoAudioLog();
const log2 = await iframe.getScreenShareLog();

// 3.0.0 以降
const log = await iframe.getLSConfLog();
```

## v2.5.0
- Added
  - [SDK] 映像の受信停止/開始の機能を追加
  - [SDK] LSConfのログ取得機能を追加 (※1)
- Changed
  - [LSConf] UIコンポーネントライブラリをRMWCからMaterial-UIに変更 (※2)
  - [LSConf] Material-UIの仕様に合わせて一部デザインのカスタマイズパラメータを追加および変更 (※3)
- Fixed
  - [LSConf] Firefox で360映像の描画が遅くなる問題を修正
  - [LSConf] join時に他のエラーが発生した場合にJoinFailedTimeoutエラーが重複して発生する問題を修正
  - [LSConf] JoinFailedTimeout発生後にデバイスアクセスを許可した場合にLSに接続される問題を修正
  - [LSConf] Mobile Safari で特定の操作後にマイクの音声が自分のスピーカーから聞こえる問題を修正
  - [LSConf] Mobile Safari でデバイスアクセス確認ダイアログで許可しなかった場合にデバイス設定ダイアログで意図しない表示になる問題を修正
  - [LSConf] 画面共有の終了後にログを取得しようとするとエラーになる問題を修正
- Refactored
  - [LSConf] `web-sdk` を `v1.2.0` に更新
  - [SDK, LSConf] 依存ライブラリの更新

(※1) この対応により以下のメソッドの利用が非推奨となります。問い合わせ時のログ取得には新たに追加された `getLSConfLog()` をご利用ください。
  - `getVideoAudioLog()`
  - `getScreenShareLog()`

(※2) この対応により、一部コンポーネントのデザインが変更となります。

(※3) `Theme` の以下のパラメータが追加/変更となります。詳細はデザインカスタマイズガイドをご覧ください。
  - [追加] `theme.components.dialog.inputFocusColor`
  - [変更] `theme.onSurface` → `theme.primaryTextColor`
  - [変更] `theme.textSecondaryOnBackground` → `theme.secondaryTextColor`

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
1. create時のオプションで `customItems` の配列に追加したいボタンを指定してください
  ~~~ts
  // チャットアイコンを指定する例
  {
    ...,
    "createParameters": {
      ...,
      "toolbar": {
        "customItems": [{ "type": "chat", "iconName": "chat" }]
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
  - [LSConf] `web-sdk` を `v1.1.1` に更新
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
  - [SDK] getSubViewsのレスポンスに自拠点と画面共有のSubViewが含まれない問題を修正

## v2.1.0
- Added
  - [SDK] 録画通知機能を追加
  - [SDK] デバイスの変更機能を追加
- Changed
  - [LSConf] デフォルトの背景色を透過に変更
- Fixed
  - [LSConf] 画面共有をしている会議に途中参加すると画面共有が表示されない問題を修正
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
  - [LSConf] 360映像の表示領域が再描画のたびにリセットされる問題を修正
  - [LSConf] 360映像の初期表示領域がブラウザによって異なる問題を修正

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
  - [LSConf] `web-sdk` を `v1.0.4` に更新

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
  - [LSConf] `web-sdk` を `v1.0.1` に更新

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
  - [LSConf] `web-sdk` を `v0.6.2` に更新

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
  - [LSConf] `web-sdk` を `v0.3.0` に更新

## v0.0.6
- Changed
  - [SDK] `DEFAULT_LS_CONF_URL` に `/index.html` を付与するよう修正

## v0.0.5
- Changed
  - [LSConf] room の routes に `/${LS_CONF_VERSION}/index.html` を追加

## v0.0.4
- Changed
  - [LSConf] LSConf の room の path を `/${ls_conf_version}/` となるように修正

## v0.0.3
- Changed
  - [LSConf] LSConf のアセットファイルの展開先が `/${ls-conf-sdk-version}/` となるよう修正

## v0.0.2
- Changed
  - [SDK] lsConfURL が指定されている場合は iframeElement.src を lsConfURL で上書きするように修正
  - [LSConf] DEFAULT_LS_CONF_URL を `https://conf.rsi-ls-dev.rinfra.ricoh.com/{LSConfSDKバージョン}` に修正

## v0.0.1
- ファーストリリース
