# RICOH Live Streaming Conference SDK API仕様

## 概要

本文書は、RICOH Live Streaming Serviceを利用したWebアプリケーション用コンポーネントである`LSConf`をアプリケーションから利用するための `LSConfSDK` のAPI仕様を定める。

## API仕様

### データ定義

#### IDString型

- 1 文字以上 255 文字以下
- ASCII
- 以下の文字のみ許可
  - 英数字
  - 次の記号: ``.%+^_"`{|}~<>\-``
- 正規表現の例
  - JavaScript: `` /^[a-zA-Z0-9.%+^_"`{|}~<>\\-]{1,255}$/ `` 
  - Ruby: `` /\A[a-zA-Z0-9.%+^_"`{|}~<>\-]{1,255}\z/ `` 

### Properties

#### create parameters

create時に指定する `properties` の一覧を記載する。<br>
全てのパラメータが `optional` で未指定時は、デフォルトの値に設定される。<br>
`theme` によるLSConfのデザインの詳細なカスタマイズ方法については[RICOH Live Streaming Conference デザインカスタマイズガイド](https://api.livestreaming.ricoh/document/ricoh-live-streaming-conference-%e3%83%87%e3%82%b6%e3%82%a4%e3%83%b3%e3%82%ab%e3%82%b9%e3%82%bf%e3%83%9e%e3%82%a4%e3%82%ba%e3%82%ac%e3%82%a4%e3%83%89/)を参照ください。

|Name|Type|Default|説明|
|:--|:--|:--|:--|
| `thetaZoomMaxRange` | number | 8 | THETA映像表示時の最大表示倍率 |
| `defaultLayout` | "gallery" \| "presentation" \| "fullscreen" | "gallery" | ビデオチャット開始時のデフォルトレイアウトを指定する |
| `toolbar` | Object | | ツールバー設定のオブジェクト |
| `toolbar.isHidden` | boolean | false | ツールバー自体を非表示にするかどうか |
| `toolbar.isHiddenCameraButton` | boolean | false | ツールバーのカメラボタンを非表示にするかどうか |
| `toolbar.isHiddenMicButton` | boolean | false | ツールバーのマイクボタンを非表示にするかどうか |
| `toolbar.isHiddenScreenShareButton` | boolean | false | ツールバーの画面共有ボタンを非表示にするかどうか |
| `toolbar.isHiddenParticipantsButton` | boolean | true | ツールバーの参加者一覧ボタンを非表示にするかどうか<br>機能未実装につきデフォルトで非表示 |
| `toolbar.isHiddenDeviceSettingButton` | boolean | false | ツールバーのデバイス設定ボタンを非表示にするかどうか |
| `toolbar.isHiddenExitButton` | boolean | false | ツールバーの退室ボタンを非表示にするかどうか |
| `isHiddenVideoMenuButton` | boolean | false | SubViewのメニューボタンを非表示にするかどうか |
| `isHiddenRecordingButton` | boolean | false | 録画開始ボタンを非表示にするかどうか |
| `theme` | Object | | テーマ設定のオブジェクト |

#### join parameters

join時に指定する `connectOptions` の一覧を記載する。

|Name|Type|区分|Default|説明|
|:--|:--|:--|:--|:--|
| `username` | IDString | require | - | 拠点名に表示されるユーザ名 |
| `enableVideo` | boolean | require | - | 通話開始時にカメラを有効にするかどうか |
| `enableAudio` | boolean | require | - | 通話開始時にマイクを有効にするかどうか |
| `maxVideoBitrate` | number | optional | 2000 | カメラ映像の最大送信ビットレート [kbps]<br>(`100`以上`20000`以下) |
| `maxShareBitrate` | number | optional | 2000 | 画面共有の最大送信ビットレート [kbps]<br>(`100`以上`20000`以下) |
| `useDummyDevice` | boolean | optional | false | ダミーデバイスを有効にする<br> - 通話開始時のカメラとマイクがダミーデバイスとなりデバイスなしで参加可能<br> - デバイス設定で「使用しない」が選択可能となる |
| `signalingURL` | string | optional | デフォルトURL | LSのSignalingURL |

### Factory Methods

#### create(parentEl?, properties?)

カスタマイズされたiframeを生成する。

- 引数
  - require
    - なし
  - optional
    - parentEl
    - properties
- 返り値
  - 生成成功時: `Promise<LSConferenceIframe>`
  - 生成失敗時: `Promise`
    - ErrorDetail.error: `'CreateFailed'`

|Name|Type|説明|
|:--|:--|:--|
|parentEl|Element|指定された場合はそのElementの子として追加される<br>指定がない場合はdocument.bodyの子として追加される|
|properties|Object|[`create parameters`](#create-parameters)を設定する|

### Instance Methods

#### join(clientId, accessToken, connectOptions)

ビデオチャットに参加する。

- 引数
  - clientId
  - accessToken
  - connectOptions
- 返り値
  - 参加成功時: `Promise<void>`
  - 参加失敗時: `Promise`
    - ErrorDetail.error: `'JoinFailed'`

|Name|Type|説明|
|:--|:--|:--|
| clientId | string | LS PFを利用するためのClientID |
| accessToken | string | LS Signalingに接続するためのトークン |
| connectOptions | Object | [`join parameters`](#join-parameters)を設定する |

#### leave()

ビデオチャットから退室する。

- 引数
  - なし
- 返り値
  - 切断成功時: `Promise<void>`
  - 切断失敗時: `Promise`
    - ErrorDetail.error: `'CloseFailed'`

#### onShareRequested(callback)

画面共有開始時にAccessTokenをreturnするコールバック関数を指定する。

- 引数
  - callback
- 返り値
  - なし

|Name|Type|説明|
|:--|:--|:--|
| callback | Function | 画面共有開始時にAccessTokenをreturnするコールバック関数 |

#### setCameraMute(isEnabled)

カメラミュートの有効/無効を変更する。

- 引数
  - isEnabled
- 返り値
  - 変更成功時: `Promise<void>`
  - 変更失敗時: `Promise`
    - ErrorDetail.error: `'MicMuteFailed'`

|Name|Type|説明|
|:--|:--|:--|
| isEnabled | boolean | `true`: カメラミュートが有効<br>`false`: カメラミュートが無効 |

#### setMicMute(isEnabled)

マイクミュートの有効/無効を変更する。

- 引数
  - isEnabled
- 返り値
  - 変更成功時: `Promise<void>`
  - 変更失敗時: `Promise`
    - ErrorDetail.error: `'CameraMuteFailed'`

|Name|Type|説明|
|:--|:--|:--|
| isEnabled | boolean | `true`: マイクミュートが有効<br>`false`: マイクミュートが無効 |

#### getVideoAudioLog()

映像/音声での接続のクライアントログを取得する。

- 引数
  - filterOption
- 返り値
  - 変更成功時: `Promise<string>`
  - 変更失敗時: `Promise`
    - ErrorDetail.error: `'GetReportFailed'`

|Name|Type|説明|
|:--|:--|:--|
| filterOption | string | `head`: 開始数分のみのログを取得<br>`tail`: 直近数分のみのログを取得<br>未指定、または上記以外: 開始数分+直近数分のログを取得 |

#### getScreenShareLog()

画面共有での接続のクライアントログを取得する。

- 引数
  - filterOption
- 返り値
  - 変更成功時: `Promise<string>`
  - 変更失敗時: `Promise`
    - ErrorDetail.error: `'GetReportFailed'`

|Name|Type|説明|
|:--|:--|:--|
| filterOption | string | `head`: 開始数分のみのログを取得<br>`tail`: 直近数分のみのログを取得<br>未指定、または上記以外: 開始数分+直近数分のログを取得 |

#### getVideoAudioStats()

映像/音声での接続の統計ログを取得する。

- 引数
  - なし
- 返り値
  - 変更成功時: `Promise<string>`
  - 変更失敗時: `Promise`
    - ErrorDetail.error: `'GetReportFailed'`

#### getScreenShareStats()

画面共有での接続の統計ログを取得する。

- 引数
  - なし
- 返り値
  - 変更成功時: `Promise<string>`
  - 変更失敗時: `Promise`
    - ErrorDetail.error: `'GetReportFailed'`

#### changeLayout(layout)

レイアウトを変更する。

- 引数
  - layout
- 返り値
  - 変更成功時: `Promise<void>`
  - 変更失敗時: `Promise`
    - ErrorDetail.error: `'ChangeLayoutFailed'`

|Name|Type|説明|
|:--|:--|:--|
| layout | string | `"gallery" \| "presentation" \| "fullscreen"`

#### iframe()

ラップした iframe DOM element を返す。

- 引数
  - なし
- 返り値
  - iframe

#### addEventListener(type, callback, options?)

イベントリスナーを追加する。

- 引数
  - require
    - type
    - callback
  - optional
    - options
- 返り値
  - なし

|Name|Type|説明|
|:--|:--|:--|
| type | string | 対象のイベントの種類を表す文字列 |
| callback | Function | 指定された型のイベントが発生するときに通知を受け取るオブジェクト |
| options | AddEventListenerOptions | [EventTarget.addEventListener()](https://developer.mozilla.org/ja/docs/Web/API/EventTarget/addEventListener)のoptionsを参照 |

#### removeEventListener(type, callback, _options?)

イベントリスナーを削除する。

- 引数
  - require
    - type
    - callback
  - optional
    - options
- 返り値
  - なし

|Name|Type|説明|
|:--|:--|:--|
| type | string | 対象のイベントの種類を表す文字列 |
| callback | Function | 指定された型のイベントが発生するときに通知を受け取るオブジェクト |
| options | AddEventListenerOptions | [EventTarget.addEventListener()](https://developer.mozilla.org/ja/docs/Web/API/EventTarget/addEventListener)のoptionsを参照 |

#### dispatchEvent(event)

特定のイベントをディスパッチする。

- 引数
  - event
- 返り値
  - なし

|Name|Type|説明|
|:--|:--|:--|
| event | Event | ディスパッチするイベント |

### Events

イベントハンドラーは `on()` および `addEventListener()` を介して登録する。

#### disconnected

切断された。

```js
{
  action: 'disconnected'
}
```

#### remoteTrackAdded

リモートトラックが追加された。

```js
{
  action: 'remoteTrackAdded',
  connectionId: string,
  type: MediaTypes
}
```

#### shareRequested

ユーザ操作で画面共有の開始ボタンが押された。<br>
このイベント発火時に画面共有用のAccessTokenをbackendから発行し、コールバック関数内でreturnする必要がある。

```js
{
  action: 'shareRequested'
}
```

#### error

エラーが発生した。
エラーの詳細な仕様についてはDeveloperGuideに記載のエラー仕様を参照してください。

```js
{
  action: 'error',
  error: error
}
```
