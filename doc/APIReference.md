# RICOH Live Streaming Conference SDK API仕様

## 概要

本文書は、RICOH Live Streaming Serviceを利用したWebアプリケーション用コンポーネントである`LSConf`をアプリケーションから利用するための `LSConfSDK` のAPI仕様を定める。

## API仕様

### データ定義

#### IDString

主にアプリケーションが生成するアプリケーション開発者が利用するIDで利用します。

- 1 文字以上 255 文字以下
- ASCII
- 以下の文字のみ許可
  - 英数字
  - 次の記号: ``.%+^_"`{|}~<>\-``
- 正規表現の例
  - JavaScript: `` /^[a-zA-Z0-9.%+^_"`{|}~<>\\-]{1,255}$/ `` 
  - Ruby: `` /\A[a-zA-Z0-9.%+^_"`{|}~<>\-]{1,255}\z/ `` 

#### SubView

通話画面に表示される各参加者のカメラ映像や共有画面などの枠の1つ1つをLSConfではSubViewと定義し、特定のSubViewに対して操作を行うAPIで主に使用します。

```js
type SubView = {
    connectionId: IDString;
    type: 'VIDEO_AUDIO' | 'SCREEN_SHARE';
    isTheta: boolean;
};
```

|Name|Type|説明|
|:--|:--|:--|
| connectionId | IDString | 対象のconnection_id |
| type | 'VIDEO_AUDIO' \| 'SCREEN_SHARE' | メディア種別 |
| isTheta | boolean | 対象が360映像かどうか |

#### PoV

360映像の視点情報（Point of View）で、360映像の中でどの範囲を表示しているかを表します。

```ts
type PoV {
  pan: number;
  tilt: number;
  fov: number;
};
```

|Name|Type|説明|
|:--|:--|:--|
| pan | number | 水平方向の値 |
| tilt | number | 垂直方向の値 |
| fov | number | 視野（Field of View）の値 |

#### ToolbarItem

ツールバー上にアプリケーションから指定したカスタムボタンを表示させる場合に使用します。

```js
type ToolbarItem = {
  type: string;
  iconName: string;
};
```
|Name|Type|説明|
|:--|:--|:--|
| type | string | カスタムボタン押下時の[ApplicationEvents](#ApplicationEvents)の識別子<br>すべてのtypeは一意となるようにご指定ください(※) |
| iconName | string | [GoogleFontsのアイコン名](https://fonts.google.com/icons) |

(※): 異なるカスタムボタンに対して同一のtypeを指定すると意図しない挙動となる場合があります。

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
| `toolbar.toolbarItem` | ToolbarItem[] | [] | ツールバーに表示するカスタムボタンの配列<br>表示順は左から `切断以外の既定のボタン`, `ToolbarItem[]`, `切断ボタン` の順となる |
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
| `videoCodec` | "h264" \| "vp8" \| "vp9" \| "h265" \| "av1" | optional | "h264" | 送信映像のビデオコーデック(※1) |
| `videoAudioConstraints` | [MediaStreamConstraints](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia) | optional | `{ "video": { "aspectRatio": 16 / 9 }, "audio": true }` | カメラ映像とマイク音声に対する制約（[MediaTrackConstraints](https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints)）を指定する(※2)<br>`video`および`audio`に`false`が指定された場合はダミーデバイスを使用する |
| `screenShareConstraints` | [MediaStreamConstraints](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia) | optional | `{ "video": true, "audio": true }` | 画面共有時のディスプレイ映像と音声に対する制約（[MediaTrackConstraints](https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints)）を指定する(※2) |

(※1): 実際に利用可能なcodecはプラットフォームとブラウザによって異なります。未対応のコーデックを指定した場合には接続時にエラーが発生し接続に失敗します。  
(※2): 実際に利用可能な制約はブラウザによって異なります。未対応の制約は無視されます。詳細は[こちら](https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints#browser_compatibility)をご参照ください。

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
    - ErrorDetail.error: `'JoinFailed' | 'JoinFailedTimeout' | 'JoinArgsInvalid'`

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

画面共有ボタンの押下時にScreenShareParametersをreturnするコールバック関数を指定する。

- 引数
  - callback()
- 返り値
  - なし

|Name|Type|説明|
|:--|:--|:--|
| callback() | Function | 画面共有ボタンの押下時にイベント通知を受け取るためのコールバック関数<br>コールバック関数の返り値でScreenShareParametersをreturnする必要がある |

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

join後のカメラミュートの有効/無効を変更する。<br>
join前に実行しても値は反映されない。<br>
通話開始時のミュート状態を設定したい場合は、join時に[connectOptions.enableVideo](#join-parameters)を指定する。


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

join後のマイクミュートの有効/無効を変更する。<br>
join前に実行しても値は反映されない。<br>
通話開始時のミュート状態を設定したい場合は、join時に[connectOptions.enableAudio](#join-parameters)を指定する。

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
  - callback(SubView, PoV)
- 返り値
  - なし

|Name|Type|説明|
|:--|:--|:--|
| callback(SubView, PoV) | Function | 視点共有ボタンを押下したときにイベント通知を受け取るためのコールバック関数<br>コールバック関数の引数には押下した対象のSubViewと視点情報が含まれる |

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

#### getCaptureImage(subView, options)

指定したSubViewの静止画をBlob形式で取得する。

- 引数
  - subView
  - options
- 返り値
  - 取得成功時: `Promise<Blob>`
  - 取得失敗時: `Promise`
    - ErrorDetail.error: `'GetCaptureImageFailed' | 'GetCaptureImageError' | 'GetCaptureImageErrorCameraMuted' | 'GetCaptureImageArgsInvalid'`

|Name|Type|説明|
|:--|:--|:--|
| subView | SubView | 取得対象のSubView |
| options | CaptureImageOptions | 静止画の取得設定 |

※ `CaptureImageOptions` は [HTMLCanvasElement.toBlob()](https://developer.mozilla.org/ja/docs/Web/API/HTMLCanvasElement/toBlob) の各プロパティに準ずる。

```ts
type CaptureImageOptions = {
  mimeType?: 'image/png' | 'image/jpeg';
  qualityArgument?: number;
};
```

#### iframe()

ラップした iframe DOM element を返す。

- 引数
  - なし
- 返り値
  - iframe

#### addEventListener(type, callback, options?)

LSConf既定のイベントリスナーを追加する。

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

LSConf既定のイベントリスナーを削除する。

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

LSConf既定のイベントをディスパッチする。

- 引数
  - event
- 返り値
  - なし

|Name|Type|説明|
|:--|:--|:--|
| event | Event | ディスパッチするイベント |

#### addApplicationEventListener(type, callback, options?)

アプリケーションから追加したカスタムボタンのイベントリスナーを追加する。

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
| type | string | create時に追加したカスタムボタンのtype |
| callback | Function | 指定されたtypeのイベントが発生したときに通知を受け取るオブジェクト |
| options | AddEventListenerOptions | [EventTarget.addEventListener()](https://developer.mozilla.org/ja/docs/Web/API/EventTarget/addEventListener)のoptionsを参照 |

#### removeApplicationEventListener(type, callback, _options?)

アプリケーションから追加したカスタムボタンのイベントリスナーを削除する。

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
| type | string | create時に追加したカスタムボタンのtype |
| callback | Function | 指定されたtypeのイベントが発生したときに通知を受け取るオブジェクト |
| options | AddEventListenerOptions | [EventTarget.addEventListener()](https://developer.mozilla.org/ja/docs/Web/API/EventTarget/addEventListener)のoptionsを参照 |

### Events

LSConfの既定のイベントに対するイベントハンドラーは `addEventListener()` を介して登録します。<br>
パラメータが含まれるイベントは `CustomEvent.detail` から値を取得してください。

#### connected

映像/音声のクライアントが RICOH Live Streaming Service に接続した。

```js
{
  type: 'connected'
}
```

#### disconnected

映像/音声のクライアントが RICOH Live Streaming Service から切断した。

```js
{
  type: 'disconnected'
}
```

#### screenShareConnected

画面共有のクライアントが RICOH Live Streaming Service に接続した。

```js
{
  type: 'screenShareConnected'
}
```

#### screenShareDisconnected

画面共有のクライアントが RICOH Live Streaming Service から切断した。

```js
{
  type: 'screenShareDisconnected'
}
```

#### remoteConnectionAdded

ルームに他拠点のクライアントが接続した。

```js
{
  type: 'remoteConnectionAdded',
  detail: {
    connectionId: IDString,
    username: string,
    mediaType: 'VIDEO_AUDIO' | 'SCREEN_SHARE',
    parentConnectionId: IDString | null,
  }
}
```

|Name|Type|説明|
|:--|:--|:--|
| connectionId | IDString | 接続された connection_id |
| username | string | 表示名 |
| mediaType | 'VIDEO_AUDIO' \| 'SCREEN_SHARE' | メディア種別 |
| parentConnectionId | IDString \| null | [`mediaType` が `'VIDEO_AUDIO'` の場合] `null` <br>[`mediaType` が `'SCREEN_SHARE'` の場合] 画面共有を開始した `'VIDEO_AUDIO'` の connection_id |

#### remoteConnectionRemoved

ルームから他拠点のクライアントが切断した。

```js
{
  type: 'remoteConnectionRemoved',
  detail: {
    connectionId: IDString,
    username: string,
    mediaType: 'VIDEO_AUDIO' | 'SCREEN_SHARE',
    parentConnectionId: IDString | null,
  }
}
```

|Name|Type|説明|
|:--|:--|:--|
| connectionId | IDString | 切断した connection_id |
| username | string | 表示名 |
| mediaType | 'VIDEO_AUDIO' \| 'SCREEN_SHARE' | メディア種別 |
| parentConnectionId | IDString \| null | [`mediaType` が `'VIDEO_AUDIO'` の場合] `null` <br>[`mediaType` が `'SCREEN_SHARE'` の場合] 画面共有を開始した `'VIDEO_AUDIO'` の connection_id |

#### remoteTrackAdded

他拠点のクライアントの映像や音声のトラックが追加された。

```js
{
  type: 'remoteTrackAdded',
  detail: {
    subView: SubView,
    kind: 'video' | 'audio',
  }
}
```

|Name|Type|説明|
|:--|:--|:--|
| subView | SubView | 追加されたトラックが含まれるSubView |
| kind | 'video' \| 'audio' | トラック種別 |

#### startRecording

録画が開始された。

```js
{
  type: 'startRecording',
  detail: {
    subView: SubView,
  }
}
```

|Name|Type|説明|
|:--|:--|:--|
| subView | SubView | 録画対象のSubView |

#### stopRecording

録画が停止された。

```js
{
  type: 'stopRecording',
  detail: {
    subView: SubView,
  }
}
```

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

### ApplicationEvents

アプリケーションからcreate時にカスタムボタンを追加した場合、そのボタンに対するイベントが発生します。<br>
イベントハンドラーは `addApplicationEventListener()` を介して登録します。<br>
パラメータが含まれるイベントは `CustomEvent.detail` から値を取得してください。

#### ToolbarItem

ツールバー上のカスタムボタンが押された際にイベントが発生します。

```js
{
  type: ${type},
  detail: {
    itemRect: DOMRect,
  }
}
```

|Name|Type|説明|
|:--|:--|:--|
| itemRect | DOMRect | 押されたボタンの [DOMRect](https://developer.mozilla.org/en-US/docs/Web/API/DOMRect) |
