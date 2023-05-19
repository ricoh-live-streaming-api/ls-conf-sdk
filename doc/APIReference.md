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

#### MediaTypes

メディアの種別です。

```js
type MediaTypes = 'VIDEO_AUDIO' | 'SCREEN_SHARE' | 'VIDEO_FILE';
```

#### EntranceType

Room 接続時のエントランス画面の種別です。

```js
type EntranceType = 'none' | 'click';
```

各モード設定時の挙動は以下の通りです。
- "none": エントランス画面を表示せず、直接Roomに参加します。
  - ダミーデバイス時でも相手拠点の音声を再生するために、マイクのデバイスアクセス許可が必須となります。
- "click": クリック画面がエントランス画面として表示され、画面をクリックすることでRoomに参加します。

#### LayoutType

レイアウトの種別です。

```js
type LayoutType = 'gallery' | 'presentation' | 'fullscreen';
```

#### ImageMimeType

画像のファイル形式の種別です。

```js
type ImageMimeType = 'image/png' | 'image/jpeg';
```

#### VideoCodecType

送信映像のビデオコーデックの種別です。

```js
type VideoCodecType = 'h264' | 'vp8' | 'vp9' | 'h265' | 'av1';
```

実際に利用可能なcodecはプラットフォームとブラウザによって異なります。未対応のコーデックを指定した場合には接続時にエラーが発生し接続に失敗します。

#### MuteType

メディアデバイスのミュート時の挙動を設定します。

```js
type MuteType = 'hard' | 'soft';
```

各設定時の挙動は以下の通りです。

- "hard": trackを `null` にした際のブラウザ挙動に準拠します
  - ミュート時にデバイスへのアクセスは行いません（アクセスランプがある場合は消灯）
  - マイクミュート時は、音声の送信を行いません（受信側は音が聞こえません）
- "soft": trackを `disabled` にした際のブラウザ挙動に準拠します
  - ミュート時にもデバイスへのアクセスを行います（アクセスランプがある場合は点灯）
  - マイクミュート時は、音声の送信を行いません（受信側は音が聞こえません）

#### ModeType

メディア情報（映像/音声/画面共有）送受信のモードの種別です。

```js
type ModeType = 'normal' | 'viewer';
```

各モード設定時の挙動は以下の通りです。
- "normal": メディア情報（映像/音声/画面共有）の送受信を行います
- "viewer": メディア情報（映像/音声/画面共有）の受信のみを行い、送信は行いません
  - ダミーデバイス固定でデバイスの変更やアンミュート、画面共有ができません
  - Roomに受信拠点しかいない場合を除き、自拠点のSubViewが表示されません

#### TrackKind

トラックの種別です。

```js
type TrackKind = 'video' | 'audio';
```

#### SubView

通話画面に表示される各参加者のカメラ映像や画面共有などの枠の1つ1つをLSConfではSubViewと定義し、特定のSubViewに対して操作を行うAPIで主に使用します。

```js
type SubView = {
    connectionId: IDString;
    type: MediaTypes;
    isTheta: boolean;
    enableVideo: boolean;
    enableAudio: boolean;
};
```

|Name|Type|説明|
|:--|:--|:--|
| connectionId | IDString | 対象のconnection_id |
| type | [MediaTypes](#mediatypes) | メディア種別 |
| isTheta | boolean | 対象が360映像かどうか |
| enableVideo | boolean | 対象のカメラがミュートかどうか |
| enableAudio | boolean | 対象のマイクがミュートかどうか |

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
| pan | number | 水平方向の角度（単位はラジアン）<br>値の範囲は以下で超えた場合は 2π で割った余りとなる<br>`-2π <= pan <= 2π` |
| tilt | number | 垂直方向の角度（単位はラジアン）<br>値の範囲は以下で超えた場合は上限値/下限値となる<br>`-π/2 <= tilt <= π/2` |
| fov | number | 視野角（単位はラジアン）<br>値の範囲は以下で超えた場合は上限値/下限値となる<br>`(65/thetaZoomMaxRange)/180 * π <= fov <= 100/180 * π` |

#### RotationVector

THETA（Android標準の[SensorManager](https://developer.android.com/reference/android/hardware/SensorManager)）から取得できる[回転ベクトルセンサー](https://developer.android.com/guide/topics/sensors/sensors_position?hl=ja)の値で360映像のSubViewに対して天頂補正を行うAPIで主に使用します。

```ts
type RotationVector = {
  pitch: number
  roll: number
}
```

|Name|Type|説明|
|:--|:--|:--|
| pitch | number | THETA本体の前後方向の回転角度<br>値の範囲は以下で超えた場合は上限値/下限値となる<br>`-90 <= pitch <= 90` |
| roll | number | THETA本体の左右方向の回転角度<br>値の範囲は以下で超えた場合は上限値/下限値となる<br>`-180 <= roll <= 180` |

#### EventType

[LSConfの規定のイベント](#Events)の種類を表す文字列で、各イベントリスナーの登録・削除のAPIで使用します。

```ts
type EventType = 'connected' | 'disconnected' | 'screenShareConnected' | 'screenShareDisconnected' | 'remoteConnectionAdded' | 'remoteConnectionRemoved' | 'remoteTrackAdded' | 'startRecording' | 'stopRecording' | 'sharePoV' | 'strokeUpdated' | 'error';
```

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

#### SubViewMenuItem

ツールバー上にアプリケーションから指定したカスタムボタンを表示させる場合に使用します。

```js
type SubViewMenuItem = {
  type: string;
  label: string;
  targetSubView?: {
    type?: MediaTypes;
    isTheta?: boolean;
  };
};
```
|Name|Type|説明|
|:--|:--|:--|
| type | string | カスタムボタン押下時の[ApplicationEvents](#ApplicationEvents)の識別子<br>すべてのtypeは一意となるようにご指定ください(※1) |
| label | string | アイテムの表示名(※2) |
| targetSubView | object |どの種類のSubViewにこのアイテムを表示するか。<br>未指定の場合は全てのSubViewが対象 |
| targetSubView.type | [MediaTypes](#mediatypes) | メディア種別<br>未指定の場合は全てのメディア種別が対象 |
| targetSubView.isTheta | boolean | 対象が360映像かどうか<br>未指定の場合はisThetaの値に依らず全てが対象 |

(※1): 異なるカスタムボタンに対して同一のtypeを指定すると意図しない挙動となる場合があります。

(※2): カスタムボタンの文言の切り替えは、labelに指定する文字列を切り替えてご指定ください。

#### VideoSource

Playerの生成時に指定する動画ファイルのソース情報を表します。

```js
type VideoSource = {
    url: string;
    connectionId: IDString;
    label: string;
    isTheta: boolean;
    metaUrl?: string;
};
```
|Name|Type|説明|
|:--|:--|:--|
| url | string | 動画ファイルのURLの文字列(※) |
| connectionId | IDString | 動画ファイルの取得元の connection_id |
| label | string | 動画ファイルの表示名 |
| isTheta | boolean | 360動画として表示するかどうか |
| metaUrl | string | 動画ファイルのメタデータのURLの文字列(※) |

(※) 指定するファイルについて
- 再生できる動画のファイル形式（`webm`, `mp4`等）はブラウザの仕様に依存します
  - 一部のブラウザでは `webm` ファイルの再生をサポートしていない場合があります
- ファイル名にURIとして使用不可能な文字列（[RFC3986](https://datatracker.ietf.org/doc/html/rfc3986)で定義）が含まれる場合はURLエンコード済の文字列を指定してください
  - NG: `https://example.com/movie/RICOH+THETA+Z1-20220514_152010.webm`
  - OK: `https://example.com/movie/RICOH%2BTHETA%2BZ1-20220514_152010.webm`
- 指定するファイルは以下のLSConfのURLに対してのCORS（Cross-Origin Resource Sharing）設定でアクセスを許可する必要があります
  - `https://conf.livestreaming.mw.smart-integration.ricoh.com`
- メタデータのURLが未指定の場合は動画ファイルのURLと同一ディレクトリ内の同名のjsonファイルを参照します

#### Stroke
SubViewに対して書き込んだストロークの情報を表します。

```ts
type Stroke {
  points: number[][];
  isEnded: boolean;
  option?: StrokeOption;
};
```

|Name|Type|説明|
|:--|:--|:--|
|points|number[][]|ストロークを構成する座標の配列<br>映像の左上を原点(0, 0)とし、映像のサイズを基準とした座標が格納される(※1)<br>ストロークとして連続的な値を保持するため映像のサイズを超えた範囲の座標も含まれる|
|isEnded|boolean|ストロークを書き終わったかどうか|
|option|[StrokeOption](#strokeoption)|ストロークのオプション<br>未指定の場合はデフォルト値となる|

(※1): LSConfから取得したストロークを別クライアント（ClientSDK）側で描画する際は、そのクライアントで描画している映像サイズと同じ倍率でストロークを表示する必要があります

##### StrokeOption

```ts
type StrokeOption {
  size?: number;
};
```

|Name|Type|Default|説明|
|:--|:--|:--|:--|
|size|number|8| ストロークの太さ（単位はpx） |


### Properties

#### CreateParameters

create時、createPlayer時に指定する `CreateParameters` の一覧です。<br>
全てのパラメータが `optional` で未指定時は、デフォルトの値に設定されます。<br>
`theme` によるLSConfのデザインの詳細なカスタマイズ方法については[RICOH Live Streaming Conference デザインカスタマイズガイド](https://api.livestreaming.ricoh/document/ricoh-live-streaming-conference-%e3%83%87%e3%82%b6%e3%82%a4%e3%83%b3%e3%82%ab%e3%82%b9%e3%82%bf%e3%83%9e%e3%82%a4%e3%82%ba%e3%82%ac%e3%82%a4%e3%83%89/)を参照ください。

|Name|Type|Default|Player(※1)|説明|
|:--|:--|:--|:--:|:--|
| `thetaZoomMaxRange` | number | 8 | ◯ | 360映像表示時の最大表示倍率 |
| `defaultLayout` | [LayoutType](#layouttype) | "gallery" | ◯ | ビデオチャット開始時のデフォルトレイアウトを指定する |
| `room` | Object | | - | ルーム設定のオブジェクト |
| `room.entranceScreen` | [EntranceType](#entrancetype) | "none" | - | ルームへの入室時の表示画面 |
| `toolbar` | Object | | - | ツールバー設定のオブジェクト |
| `toolbar.isHidden` | boolean | false | - | ツールバー自体を非表示にするかどうか |
| `toolbar.isHiddenCameraButton` | boolean | false | - | ツールバーのカメラボタンを非表示にするかどうか |
| `toolbar.isHiddenMicButton` | boolean | false | - | ツールバーのマイクボタンを非表示にするかどうか |
| `toolbar.isHiddenScreenShareButton` | boolean | false | - | ツールバーの画面共有ボタンを非表示にするかどうか |
| `toolbar.isHiddenParticipantsButton` | boolean | true | - | ツールバーの参加者一覧ボタンを非表示にするかどうか<br>機能未実装につきデフォルトで非表示 |
| `toolbar.isHiddenDeviceSettingButton` | boolean | false | - | ツールバーのデバイス設定ボタンを非表示にするかどうか |
| `toolbar.isHiddenExitButton` | boolean | false | - | ツールバーの退室ボタンを非表示にするかどうか |
| `toolbar.customItems` | ToolbarItem[] | [] | - | ツールバーに表示するカスタムボタンの配列<br>表示順は左から `切断以外の既定のボタン`, `ToolbarItem[]`, `切断ボタン` の順となる |
| `subView` | Object | | ◯ | SubView設定のオブジェクト |
| `subView.enableAutoVideoReceiving` | boolean | true | - | SubViewの非表示時/表示時に自動的に映像を受信停止/再開するかどうか(※2) |
| `subView.speakingThreshold` | number | 10 | - | 発話判定となる音声ボリュームの閾値<br>設定できる範囲は `1-100` で範囲を超える場合は上限/下限に設定される|
| `subView.speakingIndicatorDuration` | number | 500 | - | 発話判定時にマイクアイコンを継続的に光らせる時間（単位はms）<br>設定できる範囲は `0-5000` で範囲を超える場合は上限/下限に設定される<br>`0`の場合は一瞬光るのみ|
| `subView.isHiddenDrawingButton` | boolean | true | - | SubViewの書き込みボタンを非表示にするかどうか(※4) |
| `subView.drawingInterval` | number | 500 | - | 書き込み中の `strokeUpdated` イベントの発火間隔（単位はms）<br>設定できる範囲は `100-3000` で範囲を超える場合は上限/下限に設定される |
| `subView.drawingColor` | string | "#661FFF" | - | 書き込み時のストロークの色<br>[CSSのColor定義](https://developer.mozilla.org/ja/docs/Web/CSS/color)に準拠した値とする<br>未指定や不正な値の場合はデフォルト値となる |
| `subView.drawingOption` | [StrokeOption](#strokeoption) |  | - | 書き込み時のストロークのオプション |
| `subView.normal` | Object | | ◯ | 通常映像のSubViewの設定オブジェクト |
| `subView.normal.enableZoom` | boolean | false | ◯ | 映像の拡大機能を有効にするかどうか |
| `subView.theta` | Object | | - | 360映像のSubView設定のオブジェクト |
| `subView.theta.enableZenithCorrection` | boolean | true | - | 360映像の自動の天頂補正機能(※3)の有効/無効を切り替える |
| `subView.menu` | Object | | ◯ | SubViewのメニュー設定のオブジェクト |
| `subView.menu.isHidden` | boolean | false | ◯ | SubViewのメニューボタンを非表示にするかどうか |
| `subView.menu.isHiddenRecordingButton` | boolean | false | - | 録画開始ボタンを非表示にするかどうか |
| `subView.menu.isHiddenSharePoVButton` | boolean | true | ◯ | 視点共有ボタンを非表示にするかどうか |
| `subView.menu.customItems` | [SubViewMenuItem](#SubViewMenuItem)[] | [] | ◯ | SubViewMenuのリストに追加するカスタムボタンの配列<br>表示順は上から `既定のメニュー`, `SubViewMenuItem[]` の順となる |
| `theme` | Object | | ◯ | テーマ設定のオブジェクト |

(※1): Playerコンポーネント利用時は一部のカスタマイズのみ対応しています。

(※2): 各設定時の挙動は以下の通りです。
- `false` の場合
  - 常に全てのSubViewの映像を受信します
- `true` の場合
  - レイアウト変更やスクロールでSubViewが画面上から非表示になった際に映像受信を停止します
    - 受信停止時のSubView上の表示は黒画面となります
  - 再度画面上に表示されたタイミングで映像受信を再開します
    - 映像受信の再開時に映像が流れ始めるまでに時間がかかる場合があります
  - 録画中のSubViewは非表示になっていても映像は受信停止しません
  - 受信停止/受信開始のAPIが叩かれた場合は、レイアウトや表示の状態に依らず処理を行います
    - 再度受信停止/再開する状態にレイアウトが変化した場合は自動的に上書きで停止/再開の処理が実行されます

(※3): THETAプラグイン側で取得した各パラメータをTrackMetadataに `pitch`, `roll` のキー名で追加した上でClientSDKの `updateTrackMeta` を呼ぶ必要があります。LSConf側ではTrackMetadataの更新のたびに天頂補正処理が実行されます。

(※4): 書き込みボタンを非表示にしても `updateStroke` を実行するとストロークが表示されます

#### ConnectOptions

join時に指定する `ConnectOptions` の一覧です。

|Name|Type|区分|Default|説明|
|:--|:--|:--|:--|:--|
| `username` | string | require | - | 拠点名に表示されるユーザ名 |
| `enableVideo` | boolean | require | - | 通話開始時にカメラを有効にするかどうか |
| `enableAudio` | boolean | require | - | 通話開始時にマイクを有効にするかどうか |
| `audioMuteType` | [MuteType](#mutetype) | optional | "hard" | マイクミュート時の挙動を設定する<br>通話途中での変更はできない |
| `mode` | [ModeType](#modetype) | optional | "normal" | メディア情報（映像/音声/画面共有）送受信のモードを設定する<br>通話途中でモードの変更はできない |
| `maxVideoBitrate` | number | optional | 2000 | カメラ映像の最大送信ビットレート [kbps]<br>(`100`以上`20000`以下) |
| `maxShareBitrate` | number | optional | 2000 | 画面共有の最大送信ビットレート [kbps]<br>(`100`以上`20000`以下) |
| `useDummyDevice` | boolean | optional | false | ダミーデバイスを有効にする<br> - 通話開始時のカメラとマイクがダミーデバイスとなりデバイスなしで参加可能<br> - デバイス設定で「使用しない」が選択可能となる |
| `signalingURL` | string | optional | デフォルトURL | LSのSignalingURL |
| `videoCodec` | [VideoCodecType](#videocodectype) | optional | "h264" | 送信映像のビデオコーデック |
| `videoAudioConstraints` | [MediaStreamConstraints](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia) | optional | `{ "video": { "aspectRatio": 16 / 9 }, "audio": true }` | カメラ映像とマイク音声に対する制約（[MediaTrackConstraints](https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints)）を指定する(※1)<br>`video`および`audio`に`false`が指定された場合はダミーデバイスを使用する |
| `screenShareConstraints` | [MediaStreamConstraints](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia) | optional | `{ "video": true, "audio": true }` | 画面共有時のディスプレイ映像と音声に対する制約（[MediaTrackConstraints](https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints)）を指定する(※1) |
  
(※1): 実際に利用可能な制約はブラウザによって異なります。未対応の制約は無視されます。詳細は[こちら](https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints#browser_compatibility)をご参照ください。  

### Factory Methods

#### create(parentElement, parameters)

RICOH Live Streamingを利用した、Roomコンポーネントのiframeを生成する。

- 引数
  - require
    - parentElement
    - parameters
- 返り値
  - 成功時: `Promise<LSConferenceIframe>`
  - 失敗時: `Promise`
    - ErrorDetail.error: `'CreateFailed' | 'CreateTimeout' | 'CreateArgsInvalid'`

|Name|Type|説明|
|:--|:--|:--|
|parentElement|HTMLElement|iframeが指定されたElementの子として追加される|
|parameters|`Partial<CreateParameters>`|[`CreateParameters`](#CreateParameters)を設定する|

#### createPlayer(parentElement, sources, parameters?)

RICOH Live Streamingで録画した動画を利用した、Playerコンポーネントのiframeを生成する。

- 引数
  - require
    - parentElement
    - sources
  - optioinal
    - parameters
- 返り値
  - 成功時: `Promise<LSConferenceIframe>`
  - 失敗時: `Promise`
    - ErrorDetail.error: `'CreateFailed' | 'CreateTimeout' | 'CreateArgsInvalid'`

|Name|Type|説明|
|:--|:--|:--|
|parentElement|HTMLElement|iframeが指定されたElementの子として追加される|
|sources|VideoSource[]|Playerに追加したい [VideoSource](#VideoSource) の配列|
|parameters|`Partial<CreateParameters>`|[`CreateParameters`](#CreateParameters) を設定する|

createPlayerで生成されたインスタンスに対しては、Roomで利用する以下のメソッドは利用できません。
- 接続/切断: `join`, `leave`
- デバイス: `getMediaDevices`, `setCameraMute`, `setCameraDevice`, `setMicMute`, `setMicDevice`
- 画面共有: `onShareRequested`
- 統計ログ: `getVideoAudioStats`, `getScreenShareStats`, `getStats`
- 録画: `addRecordingMember`, `removeRecordingMember`
- 映像受信: `startReceiveVideo`, `stopReceiveVideo`

### Instance Methods

#### join(clientId, accessToken, connectOptions)

ビデオチャットに参加する。

- 引数
  - require
    - clientId
    - accessToken
    - connectOptions
- 返り値
  - 成功時: `Promise<void>`
  - 失敗時: `Promise`
    - ErrorDetail.error: `'JoinFailed' | 'JoinFailedTimeout' | 'JoinArgsInvalid'` または [ClientSDKの各エラー](https://api.livestreaming.ricoh/document/ricoh-live-streaming-client-sdk-%e3%82%a8%e3%83%a9%e3%83%bc%e4%bb%95%e6%a7%98/)

|Name|Type|説明|
|:--|:--|:--|
| clientId | string | LS PFを利用するためのClientID |
| accessToken | string | LS Signalingに接続するためのAccessToken |
| connectOptions | ConnectOptions | [`ConnectOptions`](#ConnectOptions)を設定する |

#### leave()

ビデオチャットから退室する。

- 引数
  - なし
- 返り値
  - 成功時: `Promise<void>`
  - 失敗時: `Promise`
    - ErrorDetail.error: `'CloseFailed'`

#### onShareRequested(callback)

画面共有ボタンの押下時にaccessTokenをreturnするコールバック関数を指定する。

- 引数
  - require
    - callback
- 返り値
  - なし

|Name|Type|説明|
|:--|:--|:--|
| callback | Function | 画面共有ボタンの押下時にイベント通知を受け取るためのコールバック関数<br>コールバック関数の返り値でaccessTokenをreturnする必要がある |

#### getMediaDevices()
接続されているメディアデバイス情報の一覧を取得する。
- 引数
  - なし
- 返り値
  - 成功時: `Promise<DeviceInfo[]>`
  - 失敗時: `Promise`
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
  - require
    - isEnabled
- 返り値
  - 成功時: `Promise<void>`
  - 失敗時: `Promise`
    - ErrorDetail.error: `'MicMuteFailed'`

|Name|Type|説明|
|:--|:--|:--|
| isEnabled | boolean | `true`: カメラミュートが有効<br>`false`: カメラミュートが無効 |

#### setCameraDevice(deviceId)
カメラデバイスを変更する。
- 引数
  - require
    - deviceId
- 返り値
  - 成功時: `Promise<void>`
  - 失敗時: `Promise`
    - ErrorDetail.error: `'SetCameraDeviceFailed'`

|Name|Type|説明|
|:--|:--|:--|
| deviceId | string | `getMediaDevices()`で取得した`type: 'videoinput'`のdeviceId |

#### setMicMute(isEnabled)

join後のマイクミュートの有効/無効を変更する。<br>
join前に実行しても値は反映されない。<br>
通話開始時のミュート状態を設定したい場合は、join時に[connectOptions.enableAudio](#join-parameters)を指定する。

- 引数
  - require
    - isEnabled
- 返り値
  - 成功時: `Promise<void>`
  - 失敗時: `Promise`
    - ErrorDetail.error: `'CameraMuteFailed'`

|Name|Type|説明|
|:--|:--|:--|
| isEnabled | boolean | `true`: マイクミュートが有効<br>`false`: マイクミュートが無効 |

#### setMicDevice(deviceId)
マイクデバイスを変更する。
- 引数
  - require
    - deviceId
- 返り値
  - 成功時: `Promise<void>`
  - 失敗時: `Promise`
    - ErrorDetail.error: `'SetMicDeviceFailed'`

|Name|Type|説明|
|:--|:--|:--|
| deviceId | string | `getMediaDevices()`で取得した`type: 'audioinput'`のdeviceId |

#### getVideoAudioStats()

映像/音声での接続の統計ログを取得する。

- 引数
  - なし
- 返り値
  - 成功時: `Promise<string>`
  - 失敗時: `Promise`
    - ErrorDetail.error: `'GetReportFailed' | 'GetReportError'`

#### getScreenShareStats()

画面共有での接続の統計ログを取得する。

- 引数
  - なし
- 返り値
  - 成功時: `Promise<string>`
  - 失敗時: `Promise`
    - ErrorDetail.error: `'GetReportFailed' | 'GetReportError'`

#### getStats(subView, kind?)

指定したSubViewの接続の統計ログを取得する。

- 引数
  - require
    - subView
  - optional
    - kind
- 返り値
  - 成功時: `Promise<string>`
  - 失敗時: `Promise`
    - ErrorDetail.error: `'GetStatsFailed' | 'GetStatsError' | 'GetStatsArgsInvalid'`

|Name|Type|説明|
|:--|:--|:--|
| subView | SubView | 対象となるSubView |
| kind | 'video' \| 'audio' | 取得したいトラックの種別<br>未指定の場合は両方の情報が結合した文字列が返却される |

接続の統計ログは以下のような構造の JSON 文字列で返却されます。  
引数の `kind` でトラック種別を指定した場合は、指定したもの (`"audio"`, `"video"`)のみ出力されます。

```json
{
  "send": {
    "audio": {
      "sfu": {
        "<統計情報のid>": {
          // 統計情報
        },
        "<統計情報のid>": {
          // 統計情報
        }
      }
    },
    "video": {
      "sfu": {
        "<統計情報のid>": {
          // 統計情報
        },
        "<統計情報のid>": {
          // 統計情報
        }
      }
    }
  },
  "receive": {
    "audio": {
      "sfu": {
        "<統計情報のid>": {
          // 統計情報
        },
        "<統計情報のid>": {
          // 統計情報
        }
      }
    },
    "video": {
      "sfu": {
        "<統計情報のid>": {
          // 統計情報
        },
        "<統計情報のid>": {
          // 統計情報
        }
      }
    }
  }
}
```

音声や映像を送信していない場合は、`"send"`の統計は省略されます。  
音声や映像を受信していない場合は、`"receive"`の統計は省略されます。  
音声や映像を送信していない(カメラやマイクがハードミュート)の場合には、そのトラックの種別に対する統計は省略されます。  
以下のように返却する統計が存在しない場合、空の JSON ( `{}` )が返却されます。
- 自分自身の音声と映像を送信していない状態で、自分自身の SubView を引数に指定した場合
- 自分自身の音声（映像）を送信していない状態で、自分自身の SubView と kind に audio(video) を引数に指定した場合

#### getLSConfLog()

LSConfの問い合わせ用のログ情報を取得する。

- 引数
  - なし
- 返り値
  - 成功時: `Promise<string>`
  - 失敗時: `Promise`
    - ErrorDetail.error: `'GetLSConfLogFailed' | 'GetLSConfLogError'`

#### changeLayout(layout, subViews?)

レイアウトを変更する。

- 引数
  - require
    - layout
  - optional
    - subViews
- 返り値
  - 成功時: `Promise<void>`
  - 失敗時: `Promise`
    - ErrorDetail.error: `'ChangeLayoutFailed' | 'ChangeLayoutArgsInvalid'`

|Name|Type|説明|
|:--|:--|:--|
| layout | [LayoutType](#layouttype) | `gallery`: Galleryレイアウトに変更する<br>`presentation`: Presentationレイアウトに変更する<br>`fullscreen`: FullScreenレイアウトに変更する |
| subViews | SubView[] | 特定のSubViewを指定してレイアウトを変更する<br>未指定の場合は任意のSubViewが選択される<br>いずれの場合も不正なSubViewが指定された場合は無視される<br>`gallery`: 指定しても無視される<br>`presentation`: 指定された配列の全てのSubViewを拡大表示領域に表示する<br>`fullscreen`: 指定された配列の一番初めのSubViewを全画面表示する |

#### getSubViews()

SubViewの一覧を取得する。

- 引数
  - なし
- 返り値
  - 成功時: `Promise<SubView[]>`
  - 失敗時: `Promise`
    - ErrorDetail.error: `'GetSubViewsFailed' | 'GetSubViewsError'`

#### highlight(subView)

指定されたSubViewを一定時間強調表示する。

- 引数
  - require
    - subView
- 返り値
  - 成功時: `Promise<void>`
  - 失敗時: `Promise`
    - ErrorDetail.error: `'HighlightFailed' | 'HighlightError' | 'HighlightArgsInvalid'`

|Name|Type|説明|
|:--|:--|:--|
| subView | SubView | 対象となるSubView |

#### getPoV(subView)

視点情報を取得する。

- 引数
  - require
    - subView
- 返り値
  - 成功時: `Promise<PoV>`
  - 失敗時: `Promise`
    - ErrorDetail.error: `'GetPoVFailed' | 'GetPoVError' | 'GetPoVArgsInvalid'`

|Name|Type|説明|
|:--|:--|:--|
| subView | SubView | 対象となるSubView<br>360映像のSubViewのみ指定可能 |

#### setPoV(subView, poV)

視点情報を反映する。

- 引数
  - require
    - subView
    - poV
- 返り値
  - 成功時: `Promise<void>`
  - 失敗時: `Promise`
    - ErrorDetail.error: `'SetPoVFailed' | 'SetPoVError' | 'SetPoVArgsInvalid'`

|Name|Type|説明|
|:--|:--|:--|
| subView | SubView | 対象となるSubView<br>360映像のSubViewのみ指定可能 |
| poV | PoV | 反映する視点情報 |

#### enablePointer(isEnabled)

360映像SubView内に自拠点の視点ポインタ表示を切り替える。
本機能はβ機能であり、今後機能の削除や仕様変更等発生する可能性があります。ご利用の際はご注意ください。

- 引数
  - require
    - isEnabled
- 返り値
  - 成功時: `Promise<void>`
  - 失敗時: `Promise`
    - ErrorDetail.error: `'EnablePointerFailed'`

|Name|Type|説明|
|:--|:--|:--|
| isEnabled | boolean | `true`: 自拠点の視点ポインタ表示が有効<br>`false`: 自拠点の視点ポインタ表示が無効 |

#### updatePointer(subView, connectionId, poV, username?, color?)

360映像SubView内の相手視点ポインタの位置を更新する。
本機能はβ機能であり、今後機能の削除や仕様変更等発生する可能性があります。ご利用の際はご注意ください。

- 引数
  - require
    - subView
    - connectionId
    - poV
  - optional
    - username
    - color
- 返り値
  - 成功時: `Promise<void>`
  - 失敗時: `Promise`
    - ErrorDetail.error: `'UpdatePointerArgsInvalid'`

|Name|Type|説明|
|:--|:--|:--|
| subView | SubView | ポインタの表示対象となるSubView<br>360映像のSubViewのみ指定可能 |
| connectionId | IDString | ポインタの視点情報の元となるconnection_id<br>同じconnection_idが再リクエストされた場合はポインタの表示位置などを更新する |
| poV | PoV \| null | 反映するポインタの表示位置を表す視点情報<br>nullが指定された時はポインタを削除する |
| username | string | ポインタに付随して表示されるラベル<br>未指定の場合はjoin時に指定したusernameを表示<br>空文字列を指定した場合はusernameが非表示となる |
| color | string | ポインタおよびusernameの表示色<br>指定する文字列は[CSSのColor定義](https://developer.mozilla.org/ja/docs/Web/CSS/color)に準拠した値とする<br>未指定や不正な値の場合は赤色（`#ff0000`）が指定される |

#### addRecordingMember(subView, connectionId)

録画通知を追加する。

- 引数
  - require
    - subView
    - connectionId
- 返り値
  - 成功時: `Promise<void>`
  - 失敗時: `Promise`
    - ErrorDetail.error: `'AddRecordingMemberFailed' | 'AddRecordingMemberError' | 'AddRecordingMemberArgsInvalid'`

|Name|Type|説明|
|:--|:--|:--|
| subView | SubView | 録画対象のSubView |
| connectionId | IDString | 録画を行った拠点のconnection_id |

#### removeRecordingMember(subView, connectionId)

録画通知を削除する。

- 引数
  - require
    - subView
    - connectionId
- 返り値
  - 成功時: `Promise<void>`
  - 失敗時: `Promise`
    - ErrorDetail.error: `'RemoveRecordingMemberFailed' | 'RemoveRecordingMemberError' | 'RemoveRecordingMemberArgsInvalid'`

|Name|Type|説明|
|:--|:--|:--|
| subView | SubView | 録画対象のSubView |
| connectionId | IDString | 録画を行った拠点のconnection_id |

#### getCaptureImage(subView, options)

指定したSubViewの静止画をBlob形式で取得する。

- 引数
  - require
    - subView
    - options
- 返り値
  - 成功時: `Promise<Blob>`
  - 失敗時: `Promise`
    - ErrorDetail.error: `'GetCaptureImageFailed' | 'GetCaptureImageError' | 'GetCaptureImageErrorCameraMuted' | 'GetCaptureImageArgsInvalid'`

|Name|Type|説明|
|:--|:--|:--|
| subView | SubView | 取得対象のSubView |
| options | CaptureImageOptions | 静止画の取得設定 |

※ `CaptureImageOptions` は [HTMLCanvasElement.toBlob()](https://developer.mozilla.org/ja/docs/Web/API/HTMLCanvasElement/toBlob) の各プロパティに準ずる。

```ts
type CaptureImageOptions = {
  mimeType?: ImageMineType;
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
| type | [EventType](#EventType) | 対象のイベントの種類を表す文字列 |
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
| type | [EventType](#EventType) | 対象のイベントの種類を表す文字列 |
| callback | Function | 指定された型のイベントが発生するときに通知を受け取るオブジェクト |
| options | AddEventListenerOptions | [EventTarget.addEventListener()](https://developer.mozilla.org/ja/docs/Web/API/EventTarget/addEventListener)のoptionsを参照 |

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

#### stopReceiveVideo(subView)

指定したSubViewの映像受信を停止する。

- 引数
  - require
    - subView
- 返り値
  - 成功時: `Promise<void>`
  - 失敗時: `Promise`
    - ErrorDetail.error: `'StopReceiveVideoFailed' | 'StopReceiveVideoError' | 'StopReceiveVideoArgsInvalid'`

|Name|Type|説明|
|:--|:--|:--|
| subView | SubView | 映像受信を停止する対象のSubView |

※ 録画中のSubViewの映像受信を停止した場合、停止したフレームが記録されます

#### startReceiveVideo(subView)

指定したSubViewの映像受信を開始する。

- 引数
  - subView
- 返り値
  - 成功時: `Promise<void>`
  - 失敗時: `Promise`
    - ErrorDetail.error: `'StartReceiveVideoFailed' | 'StartReceiveVideoError' | 'StartReceiveVideoArgsInvalid'`

|Name|Type|説明|
|:--|:--|:--|
| subView | SubView | 映像受信を開始する対象のSubView |

#### enableZoom(subView, isEnabled)

UI操作やポインティングデバイスによるSubViewの拡大機能の有効/無効を切り替える。

- 引数
  - require
    - subView
    - isEnabled
- 返り値
  - 成功時: `Promise<void>`
  - 失敗時: `Promise`
    - ErrorDetail.error: `'EnableZoomFailed' | 'EnableZoomError' | 'EnableZoomArgsInvalid'`

|Name|Type|説明|
|:--|:--|:--|
| subView | SubView | 対象となるSubView |
| isEnabled | boolean | true: 拡大機能を有効にする<br>false: 拡大機能を無効にする |

#### setRotationVector(subview, rotationVector)

360映像のSubViewに対して天頂補正を行い、正立の状態で表示する。

- 引数
  - subView
  - rotationVector
- 返り値
  - 設定成功時: `Promise<void>`
  - 設定失敗時: `Promise`
    - ErrorDetail.error: `'SetRotationVectorFailed' | 'SetRotationVectorError' | 'SetRotationVectorArgsInvalid'`

|Name|Type|説明|
|:--|:--|:--|
| subView | SubView | 天頂補正を行う対象のSubView<br>360映像でないSubViewが指定された場合はエラーとなる |
| rotationVector | RotationVector | THETA（Android標準の[SensorManager](https://developer.android.com/reference/android/hardware/SensorManager)）から取得できる[回転ベクトルセンサー](https://developer.android.com/guide/topics/sensors/sensors_position?hl=ja)の値 |

#### updateStroke(subView, connectionId, stroke, username?, color?)

ストローク情報を更新する。

- 引数
  - require
    - subView
    - connectionId
    - stroke
  - optional
    - username
    - color
- 返り値
  - 成功時: `Promise<void>`
  - 失敗時: `Promise`
    - ErrorDetail.error: `'UpdateStrokeFailed' | 'UpdateStrokeError' | 'UpdateStrokeArgsInvalid'`

|Name|Type|説明|
|:--|:--|:--|
| subView | SubView | 対象となるSubView<br>360映像以外のSubViewのみ指定可能 |
| connectionId | IDString | ストローク情報の元となるconnection_id<br>同じconnection_idが再リクエストされた場合はストロークを更新する |
| stroke | [Stroke](#stroke) | 反映するストローク情報 |
| username | string | ストロークに付随して表示されるラベル<br>未指定の場合はjoin時に指定したusernameを表示<br>空文字列を指定した場合はusernameが非表示となる |
| color | string | ストロークおよびusernameラベルの表示色<br>指定する文字列は[CSSのColor定義](https://developer.mozilla.org/ja/docs/Web/CSS/color)に準拠した値とする<br>未指定や不正な値の場合はデフォルト値（ '#661FFF' ）となる |

#### addVideoSource(source)

Playerで指定する動画ファイルのソース情報を追加する。
`VideoSource.connectionId` がすでに存在する場合は情報を上書きする。

- 引数
  - source
- 返り値
  - 設定成功時: `Promise<void>`
  - 設定失敗時: `Promise`
    - ErrorDetail.error: `'AddVideoSourceFailed' | 'AddVideoSourceError' | 'AddVideoSourceArgsInvalid'`

|Name|Type|説明|
|:--|:--|:--|
| source | [VideoSource](#videosource) | 動画ファイルのソース情報 |

※ 同期再生中にメタデータの無い動画やメタデータ内のroomIdが他と異なる動画を追加した場合は、以下の挙動になります。
- 動画を追加した時点で SubView として追加される
- 追加された動画の再生位置は VideoControlBar のシークバーとは同期されず、シークできない
- 追加された動画の再生/一時停止は VideoControlBar の再生/一時停止ボタンと連動する

※ 同期再生中に現在の全ての動画の開始時刻より前の時刻を含む動画を追加した場合はその時間の差分だけ再生位置が前に移動します。

### Events

LSConfの既定のイベントに対するイベントハンドラーは `addEventListener()` を介して登録します。<br>
パラメータが含まれるイベントは `CustomEvent.detail` から値を取得してください。

#### connected

映像/音声クライアントが RICOH Live Streaming Service に接続した。

```js
{
  type: 'connected'
}
```

#### disconnected

映像/音声クライアントが RICOH Live Streaming Service から切断した。

```js
{
  type: 'disconnected'
}
```

#### screenShareConnected

画面共有クライアントが RICOH Live Streaming Service に接続した。

```js
{
  type: 'screenShareConnected'
}
```

#### screenShareDisconnected

画面共有クライアントが RICOH Live Streaming Service から切断した。

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
    parentConnectionId: IDString | null,
  }
}
```

|Name|Type|説明|
|:--|:--|:--|
| connectionId | IDString | 接続された connection_id |
| username | string | 表示名 |
| parentConnectionId | IDString \| null | [画面共有クライアントの場合] 同一拠点の映像/音声クライアントの connection_id<br>[映像/音声クライアントの場合] `null` |

#### remoteConnectionRemoved

ルームから他拠点のクライアントが切断した。

```js
{
  type: 'remoteConnectionRemoved',
  detail: {
    connectionId: IDString,
    username: string,
    parentConnectionId: IDString | null,
  }
}
```

|Name|Type|説明|
|:--|:--|:--|
| connectionId | IDString | 切断した connection_id |
| username | string | 表示名 |
| parentConnectionId | IDString \| null | [画面共有クライアントの場合] 同一拠点の映像/音声クライアントの connection_id<br>[映像/音声クライアントの場合] `null` |

#### remoteTrackAdded

他拠点のクライアントの映像や音声のトラックが追加された。

```js
{
  type: 'remoteTrackAdded',
  detail: {
    subView: SubView,
    kind: TrackKind,
  }
}
```

|Name|Type|説明|
|:--|:--|:--|
| subView | SubView | 追加されたトラックが含まれるSubView |
| kind | [TrackKind](#trackkind) | トラック種別 |

※ `detail.subView` の各パラメータは、そのトラック種別のトラックが追加されるまではデフォルト値となります。

例：音声 → 映像 の順でトラックが追加された場合
- 音声のトラックの `remoteTrackAdded` に含まれる値は以下の通り
  - `detail.subView.isTheta`: 対象拠点が360映像であるかどうかに関わらず常に `false`
  - `detail.subView.enableVideo`: 対象拠点のカメラのミュート状態に関わらず常に `false`
  - `detail.subView.enableAudio`: 対象拠点のマイクの実際のミュート状態と同じ値
- 映像のトラックの `remoteTrackAdded` に含まれる値は以下の通り
  - `detail.subView.isTheta`: 対象拠点が360映像であれば `true` そうでなければ `false`
  - `detail.subView.enableVideo`: 対象拠点のカメラの実際のミュート状態と同じ値
  - `detail.subView.enableAudio`: 対象拠点のマイクの実際のミュート状態と同じ値

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

#### sharePoV

視点共有ボタンが押下された。

```js
{
  type: 'sharePoV',
  detail: {
    subView: SubView,
    poV: PoV,
  }
}
```

|Name|Type|説明|
|:--|:--|:--|
| subView | SubView | 押下した対象のSubView |
| poV | PoV | 視点情報 |

#### strokeUpdated

ストロークの書き込みが更新された。

イベントの発火タイミングについては以下の通りです。

- 書き始めに一度
- 書き終わりに一度
- 書いている間は [CreateParameters](#createparameters) の `subView.drawingInterval` の間隔

```js
{
  type: 'strokeUpdated',
  detail: {
    subView: SubView,
    stroke: Stroke
  }
}
```

|Name|Type|説明|
|:--|:--|:--|
| subView | SubView | 対象のSubView |
| stroke | [Stroke](#stroke) | ストローク情報 |

#### error

エラーが発生した。
エラーの詳細な仕様については [エラー仕様](https://api.livestreaming.ricoh/docs/lsconf-error-specification) を参照してください。

```js
{
  type: 'error',
  error: {
    detail: ErrorDetail,
    data?: unknown,
  }
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

#### SubViewMenuItem

SubViewMenu上のカスタムボタンが押された際にイベントが発生します。

```js
{
  type: ${type},
  detail: {
    connectionId: IDString,
  }
}
```

|Name|Type|説明|
|:--|:--|:--|
| connectionId | IDString | ボタンが押された対象のSubViewのconnectionId |
