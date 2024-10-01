# CHANGE LOG

## v5.8.0
- Added
  - [SDK]メディア送受信の通信の安定性が変化した `changeMediaStability` イベントを追加
  - [SDK]SubView の配置先を移動する `moveSubView` の機能を追加
  - [SDK,LSConf]ツールバーの各ボタンにツールチップの表示機能を追加
  - [SDK,LSConf]ユーザーによる UI 操作時の `userOperation` イベントを追加
- Changed
  - [LSConf]マーカー機能が 360 映像や 360 静止画に対応
  - [LSConf]対向側の Connection Metadata, Track Metadata の更新時に描画を更新するように変更
  - [SDK,LSConf]ローカル録画の黒画面の検知処理を削除
  - [SDK,LSConf]Node v16 から v20 に更新
  - [SDK,LSConf]Player でローカルの動画ファイルを再生するために VideoSource.url に Blob を追加
- Fixed
  - [SDK]SubViewMenu のカスタムボタンのターゲットに静止画を指定できない問題を修正
  - [LSConf]会議切断後に Client SDK のログが取得できない問題を修正
  - [LSConf]Player でレイアウト変更を繰り返すと映像と音声がずれる問題を修正
  - [LSConf]Player で同期再生中に静止画 SubView が存在する状態で新しい動画が追加されるとローディング状態が終わらなくなる問題を修正
  - [LSConf]Mobile Safari において addImageSource の実行時に拡大状態がリセットされる問題を修正
  - [LSConf]Mobile Safari において Player の再描画時に停止中にも関わらず再生される時がある問題を修正
  - [LSConf]Mobile Safari において createPlayer 実行後にシークしてから再生すると音声が最初から再生される問題を修正
  - [LSConf]依存ライブラリの更新
- Refactored
  - [SDK]発生することのないエラー定義を削除
  - [LSConf]ログ出力のパフォーマンスを改善
  - [SDK,LSConf][Compute Pressure API](https://developer.mozilla.org/en-US/docs/Web/API/Compute_Pressure_API) で取得した CPU の負荷情報をログに追加

## v5.7.1
- Fixed
  - [LSConf]スクロールバーの表示/非表示による再描画の無限ループにより「Maximum update depth exceeded」のエラーが発生して会議に参加できない問題を修正

## v5.7.0
- Changed
  - [SDK]GetMediaDevicesError と GetDeviceFailed のエラーレスポンスにエラー理由を返すように変更
- Fixed
  - [LSConf]デバイスが多い場合に getMediaDevices() の実行に時間がかかる問題を修正

## v5.6.1
- Fixed
  - [LSConf]送信映像の解像度が変更されると受信側で SubView のアスペクト比が崩れる問題を修正

## v5.6.0
- Added
  - [SDK]ログが出力される度に発火する `log` イベントを追加
- Changed
  - [SDK,LSConf]Player での書き込み機能に対応
  - [SDK,LSConf]createPlayer の引数でソース情報が定義された json ファイルの URL を指定できるように変更
  - [LSConf]Player での同期再生時のメタデータ情報取得前の日時表示を変更
  - [LSConf]Player でのデフォルトのスピーカー設定を ON に変更
  - [LSConf]自拠点のローカル録画中に配信設定が変更されると録画が停止されるように変更
  - [LSConf]getLSConfLog の出力に Stats の local-candidate の情報を追加
  - [LSConf]「録画」の文言を「ローカル録画」に変更
  - [SDK]IceServersProtocolType に `tcp_tls` を追加
- Fixed
  - [LSConf]`web-sdk` を `v1.9.2` に更新
  - [LSConf]静止画 SubView の SubViewMenu に録画開始ボタンが表示されていた問題を修正
  - [LSConf]mediaDeviceChanged イベントに含まれる capabilities が変更後のデバイスと異なる問題を修正
  - [LSConf]Firefox で createPlayer を実行すると MediaSourceError が発生する問題を修正
  - [LSConf]同一 connection_id の拠点が切断/再入室した時のクラウド録画を同期再生すると 1 つの動画しか表示されない問題を修正
  - [LSConf]書き込み対象の SubView の位置が変化しても書き込みが終了しない問題を修正
  - [LSConf]Player の全画面表示での再生中に動画が追加されるとローディングが終わらなくなる問題を修正
  - [LSConf]Player でシークバーを連続で操作するとエラーが起きる問題を修正
  - [LSConf]Player でローディング状態のまま進まなくなる問題を修正
  - [LSConf]Player で終端まで再生すると横スクロールバーが表示される問題を修正
  - [LSConf]Safari で Player 時に音声が再生され続ける問題を修正
  - [LSConf]通常表示領域の静止画 SubView 上にマーカーが表示されない問題を修正
  - [LSConf]書き込みボタンの押下時に SubView が一瞬黒くなる問題を修正
  - [LSConf]送信側の解像度変更時に受信側で映像が一瞬黒くちらつく問題を修正
  - [SDK,LSConf]Player の全画面表示再生中に全画面解除するとそれまで非表示だった動画と音声のタイミングがずれる問題を修正
  - [SDK,LSConf]依存ライブラリの更新
- Refactored
  - [SDK,LSConf]非同期/同期処理や分岐条件の記法を変更

## v5.5.0
- Added
  - [SDK]映像の送信フレームレートを変更する機能を追加
  - [SDK]映像や音声の配信設定を変更する機能を追加
- Fixed
  - [LSConf]Player で最後まで再生した後に挙動がおかしくなる問題を修正
  - [LSConf]Player で動画の先頭にシークするとローディング状態のまま進まなくなる問題を修正

## v5.4.1
- Fixed
  - [LSConf]Chrome, Edge において Player で再生中のローディングが終わらなくなる問題を修正
  - [LSConf]Player で MediaSourceError が発火しないことがある問題を修正

## v5.4.0
- Added
  - [SDK]静止画 SubView を追加する機能(β)を追加
  - [SDK]VidyoControlBar 関連の API を追加
  - [SDK]デバイスの変更および切断時のイベント（mediaDeviceChanged）を追加
  - [SDK]LSConfError, LSConfErrorEvent の型を .d.ts に追加
  - [SDK]映像の送信ビットレートを変更する API を追加
- Changed
  - [SDK]createPlayer 実行後に初回ロードが完了した時点で playerStateChanged の pause イベントが通知されるように変更
  - [SDK]デザインカスタマイズパラメータの dialog.inputFocusColor を削除して代わりに primary の色を使うように変更
  - [SDK]getMediaDevices のレスポンスに利用有無と `MediaStreamTrack.getCapabilities()` の情報を追加
- Fixed
  - [LSConf]Player で最初の動画の音声が再生されない問題を修正
  - [LSConf]Player で 360 動画で拡大/縮小ボタンを非表示にすると映像が黒くなる問題を修正
  - [LSConf]Player で FullScreen レイアウトでシークするとロードが終わらない問題を修正
  - [LSConf]映像受信再開時に THETA の天頂補正が一瞬解除される問題を修正
  - [LSConf]ローカル録画中のネットワーク切断時に正常に録画が停止しない問題を修正
  - [LSConf]既に映像受信が停止/開始している場合、stop/startReceiveVideo() が実行されると Promise が解決されない問題を修正
  - [LSConf]Mac+Safari において入室時のクリック画面でクリックしても会議画面に進まない問題を修正
  - [LSConf]iOS15 で入室前に getMediaDevices で audio の権限を取得すると入室後に OS 設定のマイクから変わる問題を修正
  - [LSConf]Chrome と Edge でデバイスアクセスを拒否するとデバイス設定ダイアログのカメラ/マイクのリストに空欄が表示される問題を修正
  - [LSConf]Android でデバイス設定ダイアログで外部マイクを指定してキャンセルすると外部マイクに切り替わる問題を修正
  - [SDK, LSConf]web-sdk のログやレポートが取得できない問題を修正
  - [SDK, LSConf]依存ライブラリの更新

## v5.3.0
- Added
  - [SDK]ConnectOptions に iceServersProtocol のオプションを追加

## v5.2.0
- Added
  - [SDK]`lang/` 配下に各言語の {RFC5646 の言語タグ}.json を配置することで任意の言語に対応できる機能を追加
  - [SDK]Player の再生状態変化のイベントを追加
- Changed
  - [SDK]自拠点がカメラミュートの状態で自拠点の SubView を録画した場合に StartRecordingFailed のエラーを返すように変更
  - [LSConf]ローカル録画でサポートする MIMEType を追加
  - [LSConf]デザインカスタマイズパラメータの追加および変更
  - [LSConf]通常映像の拡大表示時に SubView の黒帯の領域にも映像を表示できるように変更
  - [LSConf]GalleryLayout および PresentationLayout の拡大表示領域の SubView の表示上限を 16 に変更
  - [LSConf]audioMuteType のデフォルト値を "soft" に変更
- Fixed
  - [LSConf]通常映像の描画時に GPU の負荷が高くなる問題を修正
  - [LSConf]書き込み機能でカメラ ON 直後にストロークの書き込み位置がズレる問題を修正
  - [LSConf]`web-sdk` を `v1.7.1` に更新
  - [LSConf]Gallery レイアウトまたは Presentation レイアウトで非表示領域の SubView がカメラ ON で表示領域に表示された時、映像の自動受信が再開されない問題の修正
  - [LSConf]描画が WebGL の Context lost によってチラつくことがある問題を修正
  - [LSConf]画面共有中のウィンドウサイズの高さだけが変更されると受信側で SubView のアスペクト比が崩れる問題の修正
  - [LSConf]Mac Safari でデバイス設定ダイアログでデバイスを変更してキャンセルした時に変更後のデバイスに切り替わる問題の修正
  - [LSConf]天頂補正の値が 0 の時に補正されない問題の修正
  - [SDK, LSConf]依存ライブラリの更新

## v5.1.3
- Fixed
  - [LSConf]iOS/iPadOS15 系でデバイス設定ダイアログを開いた後にマイクの音声が相手に聞こえなくなる問題の修正

## v5.1.2
- Fixed
  - [LSConf]Gallery レイアウトまたは Presentation レイアウトで非表示領域の SubView がカメラ ON で表示領域に表示された時、映像の自動受信が再開されない問題の修正

## v5.1.1
- Fixed
  - [LSConf]Gallery レイアウトまたは Presentation レイアウトで非表示領域の SubView がカメラ ON で表示領域に表示された時、像の自動受信が再開されない問題の暫定対応

## v5.1.0
- Added
  - [SDK]切替可能な言語を追加（タイ語, ベトナム語, 韓国語, 中国語簡体字, 中国語繁体字）

## v5.0.1
- Fixed
  - [LSConf]iOS15 以前で join できない問題の修正

## v5.0.0
- Added
  - [LSConf]通常映像の SubView に対しての書き込み機能を追加
  - [LSConf]Player 時に後から動画ファイルを追加/更新する機能を追加
  - [LSConf]デバイス設定ダイアログにマイクとスピーカーのテスト機能を追加
- Changed
  - [SDK]VideoSource に metaUrl を別で指定できるように変更
  - [SDK]join 時と onShareRequested 時に connectionId の指定が不要に変更
  - [LSConf]一部レイアウトでカメラが ON の SubView を上位に表示するように変更
  - [LSConf]`web-sdk` を `v1.6.1` に更新
  - [LSConf]Node 16 に対応
  - [SDK, LSConf]依存ライブラリの更新
- Fixed
  - [SDK]updatePointer を高頻度で呼んだ時に描画が遅くなる問題の修正
  - [LSConf]ダミーデバイス利用時に対向側の発話中に状態表示が反応しない問題の修正
  - [LSConf]Player 時のシークバーの操作後に再生が安定しない問題の修正
  - [LSConf]Connection と Track の Metadata が未指定のクライアントの参加/切断時にイベントの値が不正になる問題の修正

### 破壊的な変更による修正内容
#### join時とonShareRequested時にconnectionIdの指定が不要に変更
<!-- textlint-disable ja-technical-writing/sentence-length -->
これまで join 時や onShareRequested 時に connectionId を指定していましたが、[AccessToken](https://api.livestreaming.ricoh/docs/access-token-specification) の connection_id を参照することになったため、指定が不要になりました。
<!-- textlint-enable ja-technical-writing/sentence-length -->

##### join 時
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

##### onShareRequested 時
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
  - [LSConf]Player 時の同期再生機能を追加
  - [LSConf]話者表示機能を追加
  - [SDK]create 時の CreateParameters に話者表示関連のカスタマイズパラメータを追加
  - [SDK]SubViewMenu に任意のメニューを追加する機能を追加
  - [SDK]join 時の connectOptions にマイクのミュート設定を追加
- Changed
  - [SDK]ローカル録画時に黒画面を検知すると `RecordingErrorBlackScreen` のエラーが発生するように変更
- Fixed
  - [LSConf]Chrome と Edge でデバイス名がデバイス設定ダイアログに表示されないことがある問題の修正 
  - [LSConf]viewer モード時に 360 映像が自動再生されない問題の修正 
  - [LSConf]setPoV 実行後の移動アニメーション中に getPoV を実行すると移動が中断する問題の修正
  - [LSConf]updatePointer での color 指定が特定の指定方法では反映されない問題の修正
- Refactored
  - [SDK, LSConf]依存ライブラリの更新

## v4.0.0
- Added
  - [SDK]通常映像の拡大/縮小の有効/無効を切り替える機能を追加
  - [SDK]SubView 毎の Stats 情報を取得する機能を追加
  - [SDK]360 映像の自動天頂補正機能(※1)および手動で補正する機能を追加
  - [SDK]動画ファイルの URL を指定して再生するプレイヤー機能(β)を追加
- Changed
  - [SDK]`getSubViews` のレスポンスの SubView にカメラとマイクのミュート状態を追加
  - [SDK]ストリングリテラル型を明示的に型定義するよう変更
  - [SDK]API の実行時エラーとイベントリスナーによるエラーイベントを分離
  - [SDK]`addEventListener` で `options.once` 未指定時に毎回イベントが発火するように変更
  - [SDK]join 時の受信専用のモード設定機能をβから正式機能に変更
- Fixed
  - [SDK]一部のエラーイベントで内部構成が仕様と異なっていた問題を修正
  - [LSConf]UI の再描画時に 360 映像の視点がリセットされる問題を修正
  - [LSConf]`getSubViews` の実行時に自拠点の画面共有の SubView が重複する問題を修正
  - [LSConf]切断と映像受信停止のタイミングが重なると InternalError が発生して会議から切断される問題を修正
  - [LSConf]`create` を複数回実行した際に古いイベントリスナーが残る問題を修正
  - [LSConf]join 直後に `getSubViews` を実行すると誤ったレスポンスが返ってくる問題を修正
  - [LSConf]自拠点の画面共有開始時に `remoteConnectionAdded` のイベントが発生する問題を修正
- Refactored
  - [LSConf]`web-sdk` を `v1.4.0` に更新
  - [LSConf]内部で保持する SubView 一覧の構成を変更

<!-- textlint-disable ja-technical-writing/sentence-length -->
(※1) 本機能は `THETAプラグイン側` で取得した各パラメータを TrackMetadata に `pitch`, `roll` のキー名で追加してから ClientSDK の `updateTrackMeta` を呼ぶ必要がある。LSConf 側では TrackMetadata の更新のたびに天頂補正処理が実行される。
<!-- textlint-enable ja-technical-writing/sentence-length -->

### 破壊的な変更による修正内容
#### APIの実行時エラーとイベントリスナーによるエラーイベントを分離
これまで API 実行時のエラーは `Promise.reject` と `エラーイベント` の両方を返していましたが、API 実行時のエラーは`Promise.reject` のみ返すように仕様変更する。

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
<!-- textlint-disable ja-technical-writing/sentence-length -->
`addEventListener` のデフォルト値が `options.once = false` となるため、一度だけ発火させたい場合にのみ `options.once = true` を明示的に指定してください。
<!-- textlint-enable ja-technical-writing/sentence-length -->

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
  - [LSConf]多拠点参加時に自拠点の画面共有を開始するとブラウザのタブがクラッシュする問題を修正

## v3.0.0
- Added
  - [SDK]join 時に受信専用のモード設定機能(β)を追加
  - [SDK]360 映像にポインタを表示する機能(β)を追加
  - [SDK]SubView の非表示/表示時に映像を自動的に受信停止/再開する処理の有効/無効を切り替える機能を追加
  - [SDK]CreateParameters に入室画面の設定オプションを追加
- Changed
  - [SDK]create 時の一部カスタマイズパラメータを変更
  - [SDK]create 時のタイムアウト時間を 5 秒から 15 秒に変更
  - [SDK]`changeLayout` に SubView を指定できるように変更
  - [SDK]`onSharePoV` を addEventListener で登録する仕様に変更
  - [SDK]ログ取得関連の非推奨のメソッドを削除
  - [SDK]`addEventListener` に LSConf 固有のイベントしか登録できない仕様に変更
  - [SDK]`dispatchEvent` を廃止
  - [LSConf]SubView の非表示/表示時に映像を自動的に受信停止/再開する実装に変更
  - [LSConf]SubView の最小幅を定義し、それを下回る場合は画面スクロールが発生するように変更
  - [LSConf]360 映像が Presentation レイアウトの通常表示領域にある場合、拡大/縮小ボタンが非表示になるように変更
- Fixed
  - [LSConf]特定の環境で通話開始時に相手からの音声が聞こえない問題を修正(※1)
  - [LSConf]Safari で 360 映像の天地が反転する問題を修正
  - [LSConf]特定の操作で 360 映像の座標情報が規定外の値になる問題を修正
- Refactored
  - [SDK]不要なコンソールログを削除

(※1) 本不具合は入室時のクリック画面でのユーザー操作（クリック, タップ）を伴うことで解消する。入室時画面の設定が"none"の場合はこれまで通りデバイスのアクセス許可が必要である。

### 破壊的な変更による修正内容

#### create時の一部カスタマイズパラメータを変更
create 時に以下のカスタマイズパラメータのインタフェースが変更となる。

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
`onSharePoV()` は `sharePoV` のイベントを addEventListener で登録する仕様に変更となる。

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
`getVideoAudioLog` および `getScreenShareLog`が削除される。
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
  - [SDK]映像の受信停止/開始の機能を追加
  - [SDK]LSConf のログ取得機能を追加 (※1)
- Changed
  - [LSConf]UI コンポーネントライブラリを RMWC から Material-UI に変更 (※2)
  - [LSConf]Material-UI の仕様に合わせて一部デザインのカスタマイズパラメータを追加および変更 (※3)
- Fixed
  - [LSConf]Firefox で 360 映像の描画が遅くなる問題を修正
  - [LSConf]join 時に他のエラーが発生した場合に JoinFailedTimeout エラーが重複して発生する問題を修正
  - [LSConf]JoinFailedTimeout 発生後にデバイスアクセスを許可した場合に、LS に接続される問題を修正
  - [LSConf]Mobile Safari で特定の操作後にマイクの音声が自分のスピーカーから聞こえる問題を修正
  - [LSConf]Mobile Safari でデバイスアクセス確認ダイアログで許可しなかった場合にデバイス設定ダイアログで意図しない表示になる問題を修正
  - [LSConf]画面共有の終了後にログを取得しようとするとエラーになる問題を修正
- Refactored
  - [LSConf]`web-sdk` を `v1.2.0` に更新
  - [SDK, LSConf]依存ライブラリの更新

(※1) この対応により以下のメソッドの利用が非推奨になる。問い合わせ時のログ取得には新たに追加された `getLSConfLog()` をご利用ください。
  - `getVideoAudioLog()`
  - `getScreenShareLog()`

(※2) この対応により、一部コンポーネントのデザインが変更となる。

(※3) `Theme` の以下のパラメータが追加/変更となる。詳細はデザインカスタマイズガイドをご覧ください。
  - [追加]`theme.components.dialog.inputFocusColor`
  - [変更]`theme.onSurface` → `theme.primaryTextColor`
  - [変更]`theme.textSecondaryOnBackground` → `theme.secondaryTextColor`

## v2.4.0
- Added
  - [SDK]接続, 切断系のイベントを追加
  - [SDK]Join 時の connectOptions に videoAudioConstraints, screenShareConstraints を追加
  - [SDK]ツールバーに任意のボタンを追加する機能を追加
- Changed
  - [SDK]join 時に一定時間で接続されない場合にタイムアウトのエラーが発生するように変更
  - [LSConf]`getDisplayMedia()`に非対応のブラウザではツールバーの画面共有ボタンが非表示になるように変更
  - [LSConf]スピーカーのデバイス変更に非対応のブラウザではデバイス設定ダイアログのスピーカーの項目がグレーアウトするように変更
  - [LSConf]iframe の width が 900px 以下の場合、PresentationLayout の通常表示領域を非表示にするように変更
  - [LSConf]PC で SubView 内にマウスカーソルがある場合にのみ SubViewMenu のアイコンを表示するように変更
  - [LSConf]PresentationLayout で通常表示領域が非表示の場合に SubView が大きく表示されるように変更
- Fixed
  - [LSConf]leave 実行後に再度同じ iframe で join するとイベントが受け取れなくなる問題を修正
  - [LSConf]join 前にデバイス変更の API を実行すると、変更が反映されない問題を修正
  - [LSConf]join 前にデバイス情報の取得 API を実行すると、デバイス情報が取得できない問題を修正
  - [LSConf]360 映像の拡大/縮小ボタンが Firefox において反応しないことがある問題を修正
  - [LSConf]Firefox で setMicDevice の実行時にマイクが切り替わらない問題を修正
  - [LSConf]特定の環境で PresentationLayout の通常表示領域のスクロールバーが常に表示される問題を修正
  - [LSConf]360 映像の SubView でウィンドウサイズ変更時にエラーが起きる問題を修正
  - [LSConf]username が長い場合に SubView のレイアウトが崩れる問題を修正
  - [LSConf]自拠点映像の録画中にマイクミュートを行うと再度アンミュートしても録画ファイルにミュート後の音声が含まれない問題を修正
  - [LSConf]自拠点映像の録画中にマイク/カメラを両方とも一度でもミュート状態にすると録画が停止される問題を修正
  - [LSConf]会議中にカメラやマイクが切断された時に画面が固まる問題を修正

#### ツールバーに任意のボタンを追加する方法
1. create 時のオプションで `customItems` の配列に追加したいボタンを指定してください
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
2. 指定した type に対応するコールバックを `addApplicationEventListener` で登録してください
  ~~~ts
  iframe.addApplicationEventListener('chat', () => {
    console.log('Chat button pushed');
  });
  ~~~
3. ツールバーでチャットアイコン押下時に指定したコールバックが実行される

## v2.3.0
- Added
  - [SDK]Join 時の connectOptions に videoCodec を追加
  - [SDK]ブラウザの言語設定による言語切替（日英）および文言のカスタマイズ機能を追加
  - [SDK]静止画取得機能を追加
  - [LSConf]ローカル録画の設定ダイアログに全拠点の音声を MIX するオプションを追加
- Changed
  - [LSConf]setPoV の実行時にイージング処理によるアニメーションを追加
  - [LSConf]iframe の width が 600px 未満の時に PresentationLayout の通常表示領域を非表示にするように変更
- Refactored
  - [LSConf]依存ライブラリの更新

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
  - [LSConf]`web-sdk` を `v1.1.1` に更新
- Fixed
  - [LSConf]iOS と iPadOS でダミーデバイス有効またはカメラマイク OFF で会議開始時に相手からの音声が再生されない問題を修正
  - [SDK/LSConf]入室直後にカメラやマイクのミュート/アンミュートを行うとエラーが発生する問題を修正

## v2.2.3
- Added
  - [SDK]ローカル録画できない条件で録画を開始した場合、録画開始失敗のエラーを追加
- Changed
  - [LSConf]デバイス設定ダイアログを表示している間はカメラ/マイクがミュートになるように変更
  - [LSConf]録画機能を Windows, Mac かつ Chrome, Edge のみに制限
- Fixed
  - [LSConf]ローカル録画停止ボタン以外での録画停止時に stopRecording のイベントが発火しない問題を修正
  - [LSConf]Android の特定の機種でデバイス設定からカメラデバイスが変更できない問題を修正
  - [LSConf]PresentationLayout で共通画面が勝手に拡大表示領域に表示されることがある問題を修正
  - [LSConf]デバイス設定からスピーカーデバイスの変更を行なっても指定したスピーカーから音が出ない問題を修正
  - [LSConf]カメラ/マイクの OFF 時にデバイス設定の変更が反映されない問題を修正
  - [LSConf]自拠点の画面共有の録画中に画面共有が終了した場合に録画が自動停止しない問題を修正
  - [LSConf]Safari で録画ファイルが 0KB になってしまう問題を修正
  - [LSConf]デバイス設定からデバイス変更後に適用やキャンセルボタンが iOS において反応しないことがある問題を修正
  - [LSConf]Firefox でカメラ OFF の状態で入室後にカメラを ON にして相手に映像が届かない問題を修正
  - [LSConf]Firefox でカメラ OFF の状態で入室後にマイクデバイスの変更が反映されない問題を修正
  - [LSConf]Firefox で GalleryLayout の表示が崩れる問題を修正
  - [LSConf]iOS/iPadOS でデバイス設定ダイアログを閉じた後に音がマイクから出ないことがある問題を修正
  - [LSConf]changeLayout で指定以外の文字列が入った場合、 GalleryLayout に切り替わる問題を修正

## v2.2.2
- Fixed
  - [LSConf]Chrome 92 の WebMediaPlayers の上限設定によりレンダリング時に SubView 内の映像や音声が再生されなくなる問題を修正

## v2.2.1
- Changed
  - [LSConf]Video のアスペクト比をデフォルトで 16:9 で取得するように変更
- Fixed
  - [LSConf]録画通知の改善

## v2.2.0
- Added
  - [LSConf]PresentationLayout の通常表示領域のレイアウトの切替機能を追加
- Fixed
  - [SDK]getSubViews のレスポンスに自拠点と画面共有の SubView が含まれない問題を修正

## v2.1.0
- Added
  - [SDK]録画通知機能を追加
  - [SDK]デバイスの変更機能を追加
- Changed
  - [LSConf]デフォルトの背景色を透過に変更
- Fixed
  - [LSConf]画面共有をしている会議に途中参加すると画面共有が表示されない問題を修正
- Refactored
  - [LSConf]依存ライブラリの更新

## v2.0.0
- Added
  - [SDK]SubView の強調表示機能を追加
- Changed
  - [SDK]接続時に connectionId を渡すように仕様を変更
  - [LSConf]複数拠点を同時にローカル録画できるように変更
- Fixed
  - [LSConf]画面共有時にアクセストークンの取得に失敗した際、状態がおかしくなる問題を修正
  - [LSConf]カメラミュート時にカメラのアクセスランプが光ったままになる問題を修正
  - [LSConf]一部のコンポーネントにフォントが適用されない問題を修正

### 破壊的な変更による修正内容
#### join時の引数の追加
join 時に connectionId が必須パラメータとなる。

```ts
// 2.0.0 以前
iframe.join({
  clientId: 'hoge',
  accessToken: accessToken,
  connectOptions: {
    username: 'fuga'
    enableVideo: true,
    enableAudio: true,
  }
});

// 2.0.0 以降
iframe.join({
  clientId: 'hoge',
  accessToken: accessToken,
  connectionId: 'connectionId', // アクセストークンで指定したconnectionIdと同じ値を指定
  connectOptions: {
    username: 'fuga'
    enableVideo: true,
    enableAudio: true,
  }
});
```

#### onShareRequestedの戻り値の追加
onShareRequested の戻り値に connectionId を加えた ScreenShareParameters が必須パラメータになる。

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
  - [SDK]視点共有機能を追加
- Changed
  - [LSConf]OnTrackTimeout 発生時に ignore するように変更
- Fixed
  - [SDK]CreateParameters の各パラメータがオプショナル化されていなかったのを修正
  - [LSConf]Gallery レイアウトが SubViewMenu 表示時に崩れることがある問題を修正
  - [LSConf]Gallery レイアウトの通常表示領域が 6 拠点以上になると画面が崩れる問題を修正
  - [LSConf]username と connectionId が異なる場合に THETA 拠点の映像がリセットされる問題を修正

## v1.2.4
- Added
  - [SDK]コンポーネント単位のテーマ変更機能を追加
- Changed
  - [LSConf]デフォルトの背景色を不透過に変更
  - [LSConf]ツールバーの参加者一覧ボタンをデフォルトで非表示に変更
- Fixed
  - [LSConf]Join 時の enableAudio/enableVideo の設定が効かない問題を修正
  - [LSConf]WebM 形式の録画ファイル再生時にシークが遅い問題を修正
  - [LSConf]画面共有時に Gallery レイアウトが崩れる問題を修正
  - [LSConf]360 映像の表示領域が再描画のたびにリセットされる問題を修正
  - [LSConf]360 映像の初期表示領域がブラウザによって異なる問題を修正

## v1.2.3
- Fixed
  - [LSConf]ツールバーサイズが iframe の幅に応じて変化しない問題を修正

## v1.2.2
- Added
  - [SDK]ローカル録画対応
- Changed
  - [SDK]デバイス取得に失敗したときはダミーデバイスで会議開始するように変更
- Fixed
  - [LSConf]iOS+Safari でレイアウト制御がおかしくなる問題を修正

## v1.2.1
- Fixed
  - [LSConf]マイクミュート状態の拠点がいる場合にレイアウト制御がおかしくなる問題を修正

## v1.2.0
- Changed
  - [SDK]外部向けインタフェース仕様の修正

## v1.1.1
- Added
  - [SDK]テーマ変更対応
  - [SDK]ダミーデバイス対応
- Changed
  - [LSConf]ダブルタップ判定処理を修正
- Fixed
  - [LSConf]Safari の特定のバージョンで他拠点の音声が聞こえなくなる問題を修正
  - [LSConf]iOS+Safari でレイアウト切替後に自拠点映像が黒くなる問題を修正
- Refactored
  - [LSConf]`web-sdk` を `v1.0.4` に更新

## v1.1.0
- Added
  - [SDK]レイアウト変更 API の追加
  - [LSConf]iframe のフレームサイズが小さい時に自動的にツールバーを小さくする

## v1.0.2
- Changed
  - [LSConf]videoContainer を常に保持するように修正

## v1.0.1
- Changed
  - [LSConf]エラー処理修正

### v1.0.0
- Changed
  - [SDK]LS-PF Prod 環境対応（`DEFAULT_SIGNALING_URL`の修正）
  - [LSConf]エラー処理修正
- Refactored
  - [LSConf]`web-sdk` を `v1.0.1` に更新

## v0.0.11
- Fixed
  - [LSConf]Android からの映像が表示されない不具合の修正

## v0.0.10
- Fixed
  - [LSConf]Prod 環境で相手からの映像が届かない不具合の修正

## v0.0.9
- Added
  - [SDK]デバイス設定のツールバーのボタン非表示 API の追加
  - [SDK]映像の最大送信ビットレートの指定 API の追加
  - [SDK]解析ログの取得 API の追加
  - [LSConf]デバイス設定の追加
  - [LSConf]参加拠点のミュート状態表示
  - [LSConf]ハードミュート対応
  - [LSConf]THETA の SubView 内に拡大縮小ボタンを追加
- Changed
  - [SDK]解析ログのエラー処理の修正
- Fixed
  - [LSConf]isTheta のメタデータの指定がない場合に映像が表示されない問題を修正
  - [LSConf]THETA の拡大縮小ボタン押下時に画面が白くなる問題を修正
- Refactored
  - [LSConf]`web-sdk` を `v0.6.2` に更新

## v0.0.8
- Changed
  - [LSConf]addRemoteTrack の mediaType が未指定時の場合に`'VIDEO_AUDIO'`として扱うように修正
  - [LSConf]Presentation Layout へ切り替える際は mainConnectionIds をクリアするよう修正
  - [LSConf]cappella-web のエラーを error event として通知するように修正する
  - [LSConf]removeremoteconnection 時の mainConnectionIds の処理を修正する
- Refactored
  - [LSConf]@types/webrtc パッケージを取り除く

## v0.0.7
- Added
  - [LSConf]PresentationLayout の複数拠点対応
- Changed
  - [SDK]LS-PF Dev 環境対応（`DEFAULT_LS_CONF_URL`, `DEFAULT_SIGNALING_URL`の修正）
  - [SDK]remoteTrackRemoved イベントを削除
  - [LSConf]three.js 対応
- Refactored
  - [LSConf]`web-sdk` を `v0.3.0` に更新

## v0.0.6
- Changed
  - [SDK]`DEFAULT_LS_CONF_URL` に `/index.html` を付与するよう修正

## v0.0.5
- Changed
  - [LSConf]room の routes に `/${LS_CONF_VERSION}/index.html` を追加

## v0.0.4
- Changed
  - [LSConf]LSConf の room の path を `/${ls_conf_version}/` となるように修正

## v0.0.3
- Changed
  - [LSConf]LSConf のアセットファイルの展開先が `/${ls-conf-sdk-version}/` となるよう修正

## v0.0.2
- Changed
  - [SDK]lsConfURL が指定されている場合は iframeElement.src を lsConfURL で上書きするように修正
  - [LSConf]DEFAULT_LS_CONF_URL を `https://conf.rsi-ls-dev.rinfra.ricoh.com/{LSConfSDKバージョン}` に修正

## v0.0.1
- ファーストリリース
