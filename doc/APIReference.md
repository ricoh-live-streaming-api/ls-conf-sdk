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
| `isHiddenSharePoVButton` | boolean | true | 視点共有ボタンを非表示にするかどうか |
| `theme` | Object | | テーマ設定のオブジェクト |

#### join parameters

join時に指定する `connectOptions` の一覧を記載する。

|Name|Type|区分|Default|説明|
|:--|:--|:--|:--|:--|
| `username` | string | require | - | 拠点名に表示されるユーザ名 |
| `enableVideo` | boolean | require | - | 通話開始時にカメラを有効にするかどうか |
| `enableAudio` | boolean | require | - | 通話開始時にマイクを有効にするかどうか |
| `maxVideoBitrate` | number | optional | 2000 | カメラ映像の最大送信ビットレート [kbps]<br>(`100`以上`20000`以下) |
| `maxShareBitrate` | number | optional | 2000 | 画面共有の最大送信ビットレート [kbps]<br>(`100`以上`20000`以下) |
| `useDummyDevice` | boolean | optional | false | ダミーデバイスを有効にする<br> - 通話開始時のカメラとマイクがダミーデバイスとなりデバイスなしで参加可能<br> - デバイス設定で「使用しない」が選択可能となる |
| `signalingURL` | string | optional | デフォルトURL | LSのSignalingURL |

### Factory Methods

#### create(parentElement, parameters)

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
    - ErrorDetail.error: `'CreateFailed' | 'CreateTimeout' | 'CreateArgsInvalid'`

|Name|Type|説明|
|:--|:--|:--|
|parentElement|HTMLElement|iframeが指定されたElementの子として追加される|
|parameters|`Partial<CreateParameters>`|[`create parameters`](#create-parameters)を設定する|

### Instance Methods

#### join(clientId, accessToken, connectionId, connectOptions)

ビデオチャットに参加する。

- 引数
  - clientId
  - accessToken
  - connectionId
  - connectOptions
- 返り値
  - 参加成功時: `Promise<void>`
  - 参加失敗時: `Promise`
    - ErrorDetail.error: `'JoinFailed' | 'JoinArgsInvalid'`

|Name|Type|説明|
|:--|:--|:--|
| clientId | string | LS PFを利用するためのClientID |
| accessToken | string | LS Signalingに接続するためのAccessToken |
| connectionId | IDString | AccessTokenで指定したconnection_id |
| connectOptions | ConnectOptions | [`join parameters`](#join-parameters)を設定する |

#### leave()

ビデオチャットから退室する。

- 引数
  - なし
- 返り値
  - 切断成功時: `Promise<void>`
  - 切断失敗時: `Promise`
    - ErrorDetail.error: `'CloseFailed'`

#### onShareRequested(callback)

画面共有開始時にScreenShareParametersをreturnするコールバック関数を指定する。

- 引数
  - callback
- 返り値
  - なし

|Name|Type|説明|
|:--|:--|:--|
| callback | Function | 画面共有開始時にScreenShareParametersをreturnするコールバック関数 |

```ts
type ScreenShareParameters = {
  connectionId: string; // 画面共有接続用のconnectionId
  accessToken: string;  // 画面共有接続用のaccessToken
};
```

#### getMediaDevices()
接続されているメディアデバイス情報の一覧を取得する。
- 引数
  - なし
- 返り値
  - 変更成功時: `Promise<DeviceInfo[]>`
  - 変更失敗時: `Promise`
    - ErrorDetail.error: `'GetMediaDevicesFailed' | 'GetMediaDevicesError'`

※ `DeviceInfo` は [MediaDeviceInfo](https://developer.mozilla.org/ja/docs/Web/API/MediaDeviceInfo) の各プロパティに準ずる。

```ts
type DeviceInfo = {
  deviceId: string;
  groupId: string;
  kind: string;
  label: string;
};
```

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

#### setCameraDevice(deviceId: string)
カメラデバイスを変更する。
- 引数
  - deviceId
- 返り値
  - 変更成功時: `Promise<void>`
  - 変更失敗時: `Promise`
    - ErrorDetail.error: `'SetCameraDeviceFailed'`

|Name|Type|説明|
|:--|:--|:--|
| deviceId | string | `getMediaDevices()`で取得した`type: 'videoinput'`のdeviceId |

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

#### setMicDevice(deviceId: string)
マイクデバイスを変更する。
- 引数
  - deviceId
- 返り値
  - 変更成功時: `Promise<void>`
  - 変更失敗時: `Promise`
    - ErrorDetail.error: `'SetMicDeviceFailed'`

|Name|Type|説明|
|:--|:--|:--|
| deviceId | string | `getMediaDevices()`で取得した`type: 'audioinput'`のdeviceId |

#### getVideoAudioLog()

映像/音声での接続のクライアントログを取得する。

- 引数
  - filterOption
- 返り値
  - 変更成功時: `Promise<string>`
  - 変更失敗時: `Promise`
    - ErrorDetail.error: `'GetReportFailed' | 'GetReportError'`

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
    - ErrorDetail.error: `'GetReportFailed' | 'GetReportError'`

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
    - ErrorDetail.error: `'GetReportFailed' | 'GetReportError'`

#### getScreenShareStats()

画面共有での接続の統計ログを取得する。

- 引数
  - なし
- 返り値
  - 変更成功時: `Promise<string>`
  - 変更失敗時: `Promise`
    - ErrorDetail.error: `'GetReportFailed' | 'GetReportError'`

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

#### getSubViews()

SubViewの一覧を取得する。

- 引数
  - なし
- 返り値
  - 取得成功時: `Promise<SubView[]>`
  - 取得失敗時: `Promise`
    - ErrorDetail.error: `'GetSubViewsFailed' | 'GetSubViewsError'`

#### highlight(subView)

指定されたSubViewを一定時間強調表示する。

- 引数
  - subView
- 返り値
  - 設定成功時: `Promise<void>`
  - 設定失敗時: `Promise`
    - ErrorDetail.error: `'HighlightFailed' | 'HighlightError' | 'HighlightArgsInvalid'`

|Name|Type|説明|
|:--|:--|:--|
| subView | SubView | 対象となるSubView |

#### onSharePoV(callback)

視点共有ボタンを押下したときにアプリに視点情報を渡すイベント通知を受け取るためのコールバック関数を指定する。

- 引数
  - callback
- 返り値
  - なし

|Name|Type|説明|
|:--|:--|:--|
| callback | Function | 視点共有ボタンを押下したときにアプリに視点情報を渡すイベント通知を受け取るためのコールバック関数 |

#### getPoV(subView)

視点情報を取得する。

- 引数
  - subView
- 返り値
  - 取得成功時: `Promise<PoV>`
  - 取得失敗時: `Promise`
    - ErrorDetail.error: `'GetPoVFailed' | 'GetPoVError' | 'GetPoVArgsInvalid'`

|Name|Type|説明|
|:--|:--|:--|
| subView | SubView | 対象となるSubView<br>360映像のSubViewのみ指定可能 |

#### setPoV(subView, poV)

視点情報を反映する。

- 引数
  - subView
  - poV
- 返り値
  - 設定成功時: `Promise<void>`
  - 設定失敗時: `Promise`
    - ErrorDetail.error: `'SetPoVFailed' | 'SetPoVError' | 'SetPoVArgsInvalid'`

|Name|Type|説明|
|:--|:--|:--|
| subView | SubView | 対象となるSubView<br>360映像のSubViewのみ指定可能 |
| poV | PoV | 反映する視点情報 |

#### addRecordingMember(subView, connectionId)

録画通知を追加する。

- 引数
  - subView
  - connectionId
- 返り値
  - 設定成功時: `Promise<void>`
  - 設定失敗時: `Promise`
    - ErrorDetail.error: `'AddRecordingMemberFailed' | 'AddRecordingMemberError' | 'AddRecordingMemberArgsInvalid'`

|Name|Type|説明|
|:--|:--|:--|
| subView | SubView | 録画対象のSubView |
| connectionId | IDString | 録画を行った拠点のconnection_id |

#### removeRecordingMember(subView, connectionId)

録画通知を削除する。

- 引数
  - subView
  - connectionId
- 返り値
  - 設定成功時: `Promise<void>`
  - 設定失敗時: `Promise`
    - ErrorDetail.error: `'RemoveRecordingMemberFailed' | 'RemoveRecordingMemberError' | 'RemoveRecordingMemberArgsInvalid'`

|Name|Type|説明|
|:--|:--|:--|
| subView | SubView | 録画対象のSubView |
| connectionId | IDString | 録画を行った拠点のconnection_id |

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

※ disconnect後に再接続を行う場合などに、前回のイベントリスナーが残ったまま重複して登録することのないようご注意ください

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
  action: 'remoteTrackAdded'
}
```

#### startRecording

録画が開始された。

- イベント名
  - startRecording
- インターフェース
  - CustomEvent
    - detail
      - subView

|Name|Type|説明|
|:--|:--|:--|
| subView | SubView | 録画対象のSubView |

#### stopRecording

録画が停止された。

- イベント名
  - stopRecording
- インターフェース
  - CustomEvent
    - detail
      - subView

|Name|Type|説明|
|:--|:--|:--|
| subView | SubView | 録画対象のSubView |

#### error

エラーが発生した。
エラーの詳細な仕様についてはDeveloperGuideに記載のエラー仕様を参照してください。

```js
{
  action: 'error',
  error: error
}
```
