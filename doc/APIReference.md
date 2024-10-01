# RICOH Live Streaming Conference SDK API仕様

## 概要
<!-- textlint-disable ja-technical-writing/sentence-length -->
本文書は、RICOH Live Streaming Service を利用した Web アプリケーション用コンポーネントである`LSConf`をアプリケーションから利用するための `LSConfSDK` の API 仕様を定める。
<!-- textlint-enable ja-technical-writing/sentence-length -->

## API仕様

### データ定義

#### IDString

主にアプリケーションが生成するアプリケーションの開発者が利用する ID で利用する。

- 1 文字以上 255 文字以下
- ASCII
- 以下の文字のみ許可
  - 英数字
  - 次の記号: ``.%+^_"`{|}~<>\-``
- 正規表現の例
  - JavaScript: `` /^[a-zA-Z0-9.%+^_"`{|}~<>\\-]{1,255}$/ `` 
  - Ruby: `` /\A[a-zA-Z0-9.%+^_"`{|}~<>\-]{1,255}\z/ `` 

#### MediaTypes

メディアの種別を示す。

```js
type MediaTypes = 'VIDEO_AUDIO' | 'SCREEN_SHARE' | 'VIDEO_FILE' | 'IMAGE_FILE';
```

#### EntranceType

Room 接続時のエントランス画面の種別を示す。

```js
type EntranceType = 'none' | 'click';
```

各モード設定時の挙動は以下の通りである。
- "none": エントランス画面を表示せず、直接 Room に参加しする。
  - ダミーデバイス時でも相手拠点の音声を再生するために、マイクのデバイスアクセス許可が必須である。
- "click": クリック画面がエントランス画面として表示され、画面をクリックすることで Room に参加する。

#### LayoutType

レイアウトの種別を示す。

```js
type LayoutType = 'gallery' | 'presentation' | 'fullscreen';
```

#### ImageMimeType

画像のファイル形式の種別を示す。

```js
type ImageMimeType = 'image/png' | 'image/jpeg';
```

#### VideoCodecType

送信映像のビデオコーデックの種別を示す。

```js
type VideoCodecType = 'h264' | 'vp8' | 'vp9' | 'h265' | 'av1';
```

実際に利用可能な codec はプラットフォームとブラウザによって異なる。<br>
未対応のコーデックを指定した場合には接続時にエラーが発生し接続に失敗する。

#### IceServersProtocolType

iceServers に使用する TURN Protocol の種別を示す。

```js
type IceServersProtocolType = 'all' | 'udp' | 'tcp' | 'tls' | 'tcp_tls';
```

#### MuteType

メディアデバイスのミュート時の挙動を設定する。

```js
type MuteType = 'hard' | 'soft';
```

各設定時の挙動は以下の通りである。

- "hard": track を `null` にした際のブラウザ挙動に準拠する
  - ミュート時にデバイスへのアクセスは行いません（アクセスランプがある場合は消灯）
  - マイクミュート時は、音声の送信しません（受信側は音が聞こえません）
- "soft": track を `disabled` にした際のブラウザ挙動に準拠する
  - ミュート時にもデバイスへアクセスする（アクセスランプがある場合は点灯）
  - マイクミュート時は、音声の送信しません（受信側は音が聞こえません）

#### ModeType

メディア情報（映像/音声/画面共有）送受信のモードの種別を示す。

```js
type ModeType = 'normal' | 'viewer';
```

各モード設定時の挙動は以下の通りである。
- "normal": メディア情報（映像/音声/画面共有）の送受信を行う
- "viewer": メディア情報（映像/音声/画面共有）の受信のみを行い、送信は行いません
  - ダミーデバイス固定でデバイスの変更やアンミュート、画面共有ができません
  - Room に受信拠点しかいない場合を除き、自拠点の SubView が表示されません

#### TrackKind

トラックの種別を示す。

```js
type TrackKind = 'video' | 'audio';
```

#### DeviceInfo

メディアデバイスの情報を示す。

```ts
type DeviceInfo = {
  deviceId: string;
  groupId: string;
  kind: string;
  label: string;
  isSelected: boolean;
  capabilities?: MediaTrackCapabilities;
};
```

|Name|Type|説明|
|:--|:--|:--|
| deviceId | string | [MediaDeviceInfo](https://developer.mozilla.org/ja/docs/Web/API/MediaDeviceInfo).deviceId の値<br>ダミーデバイスの場合は 'dummy-device' となる |
| groupId | string | [MediaDeviceInfo](https://developer.mozilla.org/ja/docs/Web/API/MediaDeviceInfo).groupId の値<br>ダミーデバイスの場合は 'dummy-device' となる |
| kind | string | [MediaDeviceInfo](https://developer.mozilla.org/ja/docs/Web/API/MediaDeviceInfo).kind の値 |
| label | string | [MediaDeviceInfo](https://developer.mozilla.org/ja/docs/Web/API/MediaDeviceInfo).label の値<br>ダミーデバイスの場合は[文言カスタマイズガイド](https://api.livestreaming.ricoh/docs/lsconf-wording-customize-guide/#devicesettingsdialog)の deviceSettingsDialog.notUsed の値となる |
| isSelected | boolean | デバイスを利用しているかどうか<br>- `true`: デバイスを利用中<br>- `false`: デバイスを利用していない<br>（join前は全てのデバイスが `false` となります） |
| capabilities | MediaTrackCapabilities | [MediaStreamTrack.getCapabilities()](https://developer.mozilla.org/en-US/docs/Web/API/MediaStreamTrack/getCapabilities) の値<br>以下の場合は `undefined` となる<br> - 非対応ブラウザ<br> - ダミーデバイス |

#### SubView

通話画面に表示される各参加者のカメラ映像や画面共有などの枠の 1 つ 1 つを LSConf では SubView と定義し、特定の SubView に対して操作する API で主に使用する。

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

360 映像の視点情報（Point of View）で、360 映像の中でどの範囲を表示しているかを表す。

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

THETA（Android 標準の [SensorManager](https://developer.android.com/reference/android/hardware/SensorManager)）から取得できる [回転ベクトルセンサー](https://developer.android.com/guide/topics/sensors/sensors_position?hl=ja) の値で 360 映像の SubView に対して天頂補正する API で主に使用する。

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

[LSConfの規定のイベント](#Events)の種類を表す文字列で、各イベントリスナーの登録・削除の API で使用する。

```ts
type EventType = 'connected' | 'disconnected' | 'screenShareConnected' | 'screenShareDisconnected' | 'remoteConnectionAdded' | 'remoteConnectionRemoved' | 'remoteTrackAdded' | 'mediaDeviceChanged' | 'startRecording' | 'stopRecording' | 'sharePoV' | 'strokeUpdated' | 'playerStateChanged' | 'changeMediaStability' | 'userOperation' | 'log' | 'error';
```

#### ToolbarItem

ツールバー上にアプリケーションから指定したカスタムボタンを表示させる場合に使用する。

```js
type ToolbarItem = {
  type: string;
  iconName: string;
  tips: string;
};
```
|Name|Type|説明|
|:--|:--|:--|
| type | string | カスタムボタン押下時の[ApplicationEvents](#ApplicationEvents)の識別子<br>すべてのtypeは一意となるようにご指定ください(※1) |
| iconName | string | [GoogleFontsのアイコン名](https://fonts.google.com/icons) |
| tips | string | マウスオーバー時にツールチップで表示されるテキスト(※2)<br>未指定 または 空文字 の場合はツールチップが表示されません

(※1): 異なるカスタムボタンに対して同一の type を指定すると意図しない挙動となる場合がある。<br>
(※2): カスタムボタンのツールチップの文言の切り替えは、tips に指定する文字列を切り替えてご指定ください。

#### SubViewMenuItem

ツールバー上にアプリケーションから指定したカスタムボタンを表示させる場合に使用する。

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

(※1): 異なるカスタムボタンに対して同一の type を指定すると意図しない挙動となる場合がある。<br>
(※2): カスタムボタンの文言の切り替えは、label に指定する文字列を切り替えてご指定ください。

#### VideoSource

Player の生成時に指定する動画ファイルのソース情報を表す。

```js
type VideoSource = {
    url: string | Blob;
    connectionId: IDString;
    label: string;
    isTheta: boolean;
    metaUrl?: string;
};
```
|Name|Type|説明|
|:--|:--|:--|
| url | string \| Blob | 動画ファイルのURLの文字列<br>または動画ファイルのBlobデータ(※) |
| connectionId | IDString | 動画ファイルの取得元の connection_id |
| label | string | 動画ファイルの表示名 |
| isTheta | boolean | 360動画として表示するかどうか |
| metaUrl | string | 動画ファイルのメタデータのURLの文字列(※) |

(※) 指定するファイルについて。
- 再生できる動画のファイル形式（`webm`, `mp4`等）はブラウザの仕様に依存する
  - 一部のブラウザでは `webm` ファイルの再生をサポートしていない場合がある
- ファイル名に URI として使用不可能な文字列（[RFC3986](https://datatracker.ietf.org/doc/html/rfc3986)で定義）が含まれる場合は URL エンコード済の文字列を指定してください
  - NG: `https://example.com/movie/RICOH+THETA+Z1-20220514_152010.webm`
  - OK: `https://example.com/movie/RICOH%2BTHETA%2BZ1-20220514_152010.webm`
- 指定するファイルは以下の LSConf の URL に対しての CORS（Cross-Origin Resource Sharing）設定でアクセスを許可する必要がある
  - `https://conf.livestreaming.mw.smart-integration.ricoh.com`
- メタデータの URL が未指定の場合は動画ファイルの URL と同一ディレクトリ内の同名の json ファイルを参照する
- Blob データは [File API](https://developer.mozilla.org/ja/docs/Web/API/File_API) により取得した動画の File オブジェクトを Blob として渡す

#### Stroke

SubView に対して書き込んだストロークの情報を表す。

```ts
type Stroke {
  points: number[][];
  isEnded: boolean;
  option?: StrokeOption;
};
```

|Name|Type|説明|
|:--|:--|:--|
|points|number[][]|ストロークを構成する座標の配列<br>映像の左上を原点(0, 0)、右下を(1, 1)とした時の座標が格納される(※1)<br>ストロークとして連続的な値を保持するため、映像サイズを超えた範囲の座標(0以下や1以上の座標)も含まれる|
|isEnded|boolean|ストロークを書き終わったかどうか|
|option|[StrokeOption](#strokeoption)|ストロークのオプション<br>未指定の場合はデフォルト値となる|

(※1): LSConf から取得したストロークを別クライアント（ClientSDK）側で描画する際は、そのクライアントで描画している映像サイズと同じ大きさに拡大してストロークを表示する必要がある。

##### StrokeOption

```ts
type StrokeOption {
  size?: number;
};
```

|Name|Type|Default|説明|
|:--|:--|:--|:--|
|size|number|8| ストロークの太さ（単位はpx） |

#### PlayerState

Player の再生状態を表す。

```js
type PlayerState = 'loading' | 'playing' | 'pause' | 'ended';
```
|PlayerState|説明|
|:--|:--|
|loading|ロード中|
|playing|再生中|
|pause|一時停止中|
|ended|メディアの終端に到達|

#### ImageSource

SubView に指定する画像ファイルのソース情報を表す。

```js
type ImageSource = {
  url: string;
  connectionId: IDString;
  label: string;
  isTheta: boolean;
};
```
|Name|Type|説明|
|:--|:--|:--|
| url | string | 画像ファイルのURLの文字列(※) |
| connectionId | IDString | 画像ファイルの識別子 |
| label | string | 画像ファイルの表示名 |
| isTheta | boolean | 360画像として表示するかどうか |

(※) 指定するファイルについて。
- 表示できる画像のファイル形式（`jpeg`, `png`等）はブラウザの仕様に依存する
- ファイル名に URI として使用不可能な文字列（[RFC3986](https://datatracker.ietf.org/doc/html/rfc3986)で定義）が含まれる場合は URL エンコード済の文字列を指定してください
  - NG: `https://example.com/image/RICOH+THETA+Z1-20220514_152010.jpeg`
  - OK: `https://example.com/image/RICOH%2BTHETA%2BZ1-20220514_152010.jpeg`
- 指定するファイルは以下の LSConf の URL に対しての CORS（Cross-Origin Resource Sharing）設定でアクセスを許可する必要がある
  - `https://conf.livestreaming.mw.smart-integration.ricoh.com`

#### LogCategory

ログの種別を表す。

```js
type LogCategory = 'environment' | 'setting' | 'recording' | 'device' | 'member' | 'analysis' | 'clientSdk';
```
|LogCategory|説明|
|:--|:--|
|environment|実行環境関連ログ|
|setting|設定パラメータ関連ログ|
|recording|ローカル録画機能関連ログ|
|device|デバイス関連ログ|
|member|参加者情報関連ログ|
|analysis|解析用ログ|
|clientSdk|ClientSDKのログ|

### Properties

#### CreateParameters

create 時、createPlayer 時に指定する `CreateParameters` の一覧である。<br>
全てのパラメータが `optional` で未指定時は、デフォルトの値に設定される。<br>
`theme` による LSConf のデザインの詳細なカスタマイズ方法については[RICOH Live Streaming Conference デザインカスタマイズガイド](https://api.livestreaming.ricoh/document/ricoh-live-streaming-conference-%e3%83%87%e3%82%b6%e3%82%a4%e3%83%b3%e3%82%ab%e3%82%b9%e3%82%bf%e3%83%9e%e3%82%a4%e3%82%ba%e3%82%ac%e3%82%a4%e3%83%89/)を参照ください。

|Name|Type|Default|Player(※1)|説明|
|:--|:--|:--|:--:|:--|
| `thetaZoomMaxRange` | number | 8 | ◯ | 360映像表示時の最大表示倍率 |
| `defaultLayout` | [LayoutType](#layouttype) | "gallery" | ◯ | ビデオチャット開始時のデフォルトレイアウトを指定する |
| `room` | Object | | - | ルーム設定のオブジェクト |
| `room.entranceScreen` | [EntranceType](#entrancetype) | "none" | - | ルームへの入室時の表示画面 |
| `player` | Object | | ◯ | プレイヤー設定のオブジェクト |
| `player.isHiddenVideoControlBar` | Object | false | ◯ | [VideoControlBar](https://api.livestreaming.ricoh/docs/lsconf-function/#videocontrolbar) を非表示にする|
| `toolbar` | Object | | - | ツールバー設定のオブジェクト |
| `toolbar.isHidden` | boolean | false | - | ツールバー自体を非表示にするかどうか |
| `toolbar.isHiddenCameraButton` | boolean | false | - | ツールバーのカメラボタンを非表示にするかどうか |
| `toolbar.isHiddenMicButton` | boolean | false | - | ツールバーのマイクボタンを非表示にするかどうか |
| `toolbar.isHiddenScreenShareButton` | boolean | false | - | ツールバーの画面共有ボタンを非表示にするかどうか |
| `toolbar.isHiddenParticipantsButton` | boolean | true | - | ツールバーの参加者一覧ボタンを非表示にするかどうか<br>機能未実装につきデフォルトで非表示 |
| `toolbar.isHiddenDeviceSettingButton` | boolean | false | - | ツールバーのデバイス設定ボタンを非表示にするかどうか |
| `toolbar.isHiddenExitButton` | boolean | false | - | ツールバーの切断ボタンを非表示にするかどうか |
| `toolbar.customItems` | ToolbarItem[] | [] | - | ツールバーに表示するカスタムボタンの配列<br>表示順は左から `切断以外の既定のボタン`, `ToolbarItem[]`, `切断ボタン` の順となる |
| `subView` | Object | | ◯ | SubView設定のオブジェクト |
| `subView.enableAutoVideoReceiving` | boolean | true | - | SubViewの非表示時/表示時に自動的に映像を受信停止/再開するかどうか(※2) |
| `subView.speakingThreshold` | number | 10 | - | 発話判定となる音声ボリュームの閾値<br>設定できる範囲は `1-100` で範囲を超える場合は上限/下限に設定される|
| `subView.speakingIndicatorDuration` | number | 500 | - | 発話判定時にマイクアイコンを継続的に光らせる時間（単位はms）<br>設定できる範囲は `0-5000` で範囲を超える場合は上限/下限に設定される<br>`0`の場合は一瞬光るのみ|
| `subView.isHiddenDrawingButton` | boolean | true | ◯ | SubViewの書き込みボタンを非表示にするかどうか(※4) |
| `subView.drawingInterval` | number | 500 | ◯ | 書き込み中の `strokeUpdated` イベントの発火間隔（単位はms）<br>設定できる範囲は `100-3000` で範囲を超える場合は上限/下限に設定される |
| `subView.drawingColor` | string | "#661FFF" | ◯ | 書き込み時のストロークの色<br>[CSSのColor定義](https://developer.mozilla.org/ja/docs/Web/CSS/color)に準拠した値とする<br>未指定や不正な値の場合はデフォルト値となる |
| `subView.drawingOption` | [StrokeOption](#strokeoption) |  | ◯ | 書き込み時のストロークのオプション |
| `subView.normal` | Object | | ◯ | 通常映像のSubViewの設定オブジェクト |
| `subView.normal.enableZoom` | boolean | false | ◯ | 映像の拡大機能を有効にするかどうか |
| `subView.theta` | Object | | - | 360映像のSubView設定のオブジェクト |
| `subView.theta.enableZenithCorrection` | boolean | true | - | 360映像の自動の天頂補正機能(※3)の有効/無効を切り替える |
| `subView.menu` | Object | | ◯ | SubViewのメニュー設定のオブジェクト |
| `subView.menu.isHidden` | boolean | false | ◯ | SubViewのメニューボタンを非表示にするかどうか |
| `subView.menu.isHiddenRecordingButton` | boolean | false | - | ローカル録画開始ボタンを非表示にするかどうか |
| `subView.menu.isHiddenSharePoVButton` | boolean | true | ◯ | 視点共有ボタンを非表示にするかどうか |
| `subView.menu.customItems` | [SubViewMenuItem](#SubViewMenuItem)[] | [] | ◯ | SubViewMenuのリストに追加するカスタムボタンの配列<br>表示順は上から `既定のメニュー`, `SubViewMenuItem[]` の順となる |
| `theme` | Object | | ◯ | テーマ設定のオブジェクト |

(※1): Player コンポーネント利用時は一部のカスタマイズのみ対応している。

(※2): 各設定時の挙動は以下の通りである。
- `false` の場合
  - 常に全ての SubView の映像を受信する
- `true` の場合
  - レイアウト変更やスクロールで SubView が画面上から非表示になった際、映像受信を停止する
    - 受信停止時の SubView 上の表示は黒画面となる
  - 再度画面上に表示されたタイミングで映像受信を再開する
    - 映像受信の再開時に映像が流れ始めるまでに時間を要する場合がある
  - 録画中の SubView は非表示になっていても映像は受信停止しません
  - 受信停止/受信開始の API が叩かれた場合は、レイアウトや表示の状態に依らず処理を行う
    - 再度受信停止/再開する状態にレイアウトが変化した場合は自動的に上書きで停止/再開の処理が実行される


<!-- textlint-disable ja-technical-writing/sentence-length -->
(※3): THETA プラグイン側で取得した各パラメータを TrackMetadata に `pitch`, `roll` のキー名を追加した上で ClientSDK の `updateTrackMeta` を呼ぶ必要がある。LSConf 側では TrackMetadata の更新のたびに天頂補正処理が実行される。
<!-- textlint-enable ja-technical-writing/sentence-length -->

(※4): 書き込みボタンを非表示にしても `updateStroke` を実行するとストロークが表示される。

#### ConnectOptions

join 時に指定する `ConnectOptions` の一覧を示す。

|Name|Type|区分|Default|説明|
|:--|:--|:--|:--|:--|
| `username` | string | require | - | 拠点名に表示されるユーザ名 |
| `enableVideo` | boolean | require | - | 通話開始時にカメラを有効にするかどうか |
| `enableAudio` | boolean | require | - | 通話開始時にマイクを有効にするかどうか |
| `audioMuteType` | [MuteType](#mutetype) | optional | "soft" | マイクミュート時の挙動を設定する(※1)<br>通話途中での変更はできない |
| `mode` | [ModeType](#modetype) | optional | "normal" | メディア情報（映像/音声/画面共有）送受信のモードを設定する<br>通話途中でモードの変更はできない |
| `maxVideoBitrate` | number | optional | 2000 | カメラ映像の最大送信ビットレート [kbps]<br>(`100`以上`20000`以下) |
| `maxShareBitrate` | number | optional | 2000 | 画面共有の最大送信ビットレート [kbps]<br>(`100`以上`20000`以下) |
| `useDummyDevice` | boolean | optional | false | ダミーデバイスを有効にする<br> - 通話開始時のカメラとマイクがダミーデバイスとなりデバイスなしで参加可能<br> - デバイス設定で「使用しない」が選択可能となる |
| `signalingURL` | string | optional | デフォルトURL | LSのSignalingURL |
| `videoCodec` | [VideoCodecType](#videocodectype) | optional | "h264" | 送信映像のビデオコーデック |
| `videoAudioConstraints` | [MediaStreamConstraints](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia) | optional | `{ "video": { "aspectRatio": 16 / 9 }, "audio": true }` | カメラ映像とマイク音声に対する制約（[MediaTrackConstraints](https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints)）を指定する(※2)<br>`video`および`audio`に`false`が指定された場合はダミーデバイスを使用する |
| `screenShareConstraints` | [MediaStreamConstraints](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia) | optional | `{ "video": true, "audio": true }` | 画面共有時のディスプレイ映像と音声に対する制約（[MediaTrackConstraints](https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints)）を指定する(※2) |
| `iceServersProtocol` | [IceServersProtocolType](#iceserversprotocoltype) | optional | "all" | iceServers に使用する TURN Protocol(※3) |
  
(※1): Safari では正常に動作しない問題が発生するため、"hard" にした場合も自動的に "soft" となる。

(※2): 実際に利用可能な制約はブラウザによって異なる。未対応の制約は無視される。詳細は[こちら](https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints#browser_compatibility)をご参照ください。  

(※3): 詳細については[こちら](https://api.livestreaming.ricoh/docs/introduction-ice-servers-protocol/)を参照ください。

### Factory Methods

#### create(parentElement, parameters)

RICOH Live Streaming を利用した、Room コンポーネントの iframe を生成する。

- 引数
  - require
    - parentElement
    - parameters
- 返り値
  - `Promise<LSConferenceIframe>`
- エラー（[LSConfError](https://api.livestreaming.ricoh/docs/lsconf-error-specification/#%E3%82%A8%E3%83%A9%E3%83%BC%E4%B8%80%E8%A6%A7)）
  - CreateFailed
  - CreateTimeout
  - CreateArgsInvalid

|Name|Type|説明|
|:--|:--|:--|
|parentElement|HTMLElement|iframeが指定されたElementの子として追加される|
|parameters|`Partial<CreateParameters>`|[`CreateParameters`](#CreateParameters)を設定する|

create で生成されたインスタンスに対しては、Player で利用する以下のメソッドは利用できません。
- 再生状態の変更: `changePlayerState`
- スピーカー音量の設定： `setSpeakerVolume`
- 再生位置の変更: `setSeekPosition`

<!-- textlint-disable ja-technical-writing/no-exclamation-question-mark -->
#### createPlayer(parentElement, sources, parameters?)
<!-- textlint-enable ja-technical-writing/no-exclamation-question-mark -->

RICOH Live Streaming で録画した動画を利用した、Player コンポーネントの iframe を生成する。

- 引数
  - require
    - parentElement
    - sources
  - optional
    - parameters
- 返り値
  - `Promise<LSConferenceIframe>`
- エラー（[LSConfError](https://api.livestreaming.ricoh/docs/lsconf-error-specification/#%E3%82%A8%E3%83%A9%E3%83%BC%E4%B8%80%E8%A6%A7)）
  - CreateFailed
  - CreateTimeout
  - CreateArgsInvalid

|Name|Type|説明|
|:--|:--|:--|
|parentElement|HTMLElement|iframeが指定されたElementの子として追加される|
|sources|VideoSource[] \| string |Playerに追加したい [VideoSource](#VideoSource) の配列<br>または動画ファイルのソース情報が定義されたjsonファイルのURL(※)|
|parameters|`Partial<CreateParameters>`|[`CreateParameters`](#CreateParameters) を設定する|

createPlayer で生成されたインスタンスに対しては、Room で利用する以下のメソッドは利用できません。
- 接続/切断: `join`, `leave`
<!-- textlint-disable ja-technical-writing/sentence-length -->
- デバイス: `getMediaDevices`, `setCameraMute`, `setCameraDevice`, `setMicMute`, `setMicDevice`, `setVideoAudioConstraints`
<!-- textlint-enable ja-technical-writing/sentence-length -->
- 画面共有: `onShareRequested`
- 統計ログ: `getVideoAudioStats`, `getScreenShareStats`, `getStats`
- 録画: `addRecordingMember`, `removeRecordingMember`
- 映像受信: `startReceiveVideo`, `stopReceiveVideo`
- 映像送信: `setVideoSendBitrate`, `setVideoSendFramerate`

(※) 指定するファイルについて。
- Player に追加したい [VideoSource](#VideoSource) の配列が定義されている json ファイルを指定する

  例: sources.json
  ```json
  {
    "sources": [
      {
        "url": "https://example.com/movie/video1.mp4",
        "connectionId": "video1Id",
        "label": "video1",
        "isTheta": true
      },
      {
        "url": "https://example.com/movie/video2.mp4",
        "connectionId": "video2Id",
        "label": "video2",
        "isTheta": false
      }
    ]
  }
  ```

- 指定するファイルは以下の LSConf の URL に対しての CORS（Cross-Origin Resource Sharing）設定でアクセスを許可する必要がある
  - `https://conf.livestreaming.mw.smart-integration.ricoh.com`

### Instance Methods

#### join(clientId, accessToken, connectOptions)

Room に接続（入室）する。

- 引数
  - require
    - clientId
    - accessToken
    - connectOptions
- 返り値
  - `Promise<void>`
- エラー（[LSConfError](https://api.livestreaming.ricoh/docs/lsconf-error-specification/#%E3%82%A8%E3%83%A9%E3%83%BC%E4%B8%80%E8%A6%A7)）
  - JoinFailed
  - JoinFailedTimeout
  - JoinArgsInvalid
  - GetDeviceFailed
  - [ClientSDK の connect 時のエラー](https://api.livestreaming.ricoh/docs/clientsdk-error-specification/#%E3%82%A8%E3%83%A9%E3%83%BC%E4%B8%80%E8%A6%A7)
- エラー理由 ※GetDeviceFailed の場合のみこのプロパティが存在する
  - [getUserMedia()の例外](https://developer.mozilla.org/ja/docs/Web/API/MediaDevices/getUserMedia#%E4%BE%8B%E5%A4%96) 

|Name|Type|説明|
|:--|:--|:--|
| clientId | string | Live Streaming を利用するための ClientID |
| accessToken | string | Live Streaming に接続するための [AccessToken](https://api.livestreaming.ricoh/docs/access-token/) |
| connectOptions | ConnectOptions | [`ConnectOptions`](#ConnectOptions)を設定する |

#### leave()

Room から切断（退室）する。

- 引数
  - なし
- 返り値
  - `Promise<void>`
- エラー（[LSConfError](https://api.livestreaming.ricoh/docs/lsconf-error-specification/#%E3%82%A8%E3%83%A9%E3%83%BC%E4%B8%80%E8%A6%A7)）
  - CloseFailed

#### onShareRequested(callback)

画面共有ボタンの押下時に accessToken を return するコールバック関数を指定する。

- 引数
  - require
    - callback
- 返り値
  - なし

|Name|Type|説明|
|:--|:--|:--|
| callback | Function | 画面共有ボタンの押下時にイベント通知を受け取るためのコールバック関数<br>コールバック関数の返り値で`Promise<string>`のaccessTokenをreturnする必要がある |

#### getMediaDevices()

接続されているメディアデバイス情報の一覧を取得する。

- 引数
  - なし
- 返り値
  - `Promise<[DeviceInfo](#deviceinfo)[]>`
- エラー（[LSConfError](https://api.livestreaming.ricoh/docs/lsconf-error-specification/#%E3%82%A8%E3%83%A9%E3%83%BC%E4%B8%80%E8%A6%A7)）
  - GetMediaDevicesFailed
  - GetMediaDevicesError
- エラー理由 ※GetMediaDevicesError の場合のみこのプロパティが存在する
  - [getUserMedia()の例外](https://developer.mozilla.org/ja/docs/Web/API/MediaDevices/getUserMedia#%E4%BE%8B%E5%A4%96) 

#### setCameraMute(isEnabled)

join 後のカメラミュートの有効/無効を変更する。<br>
join 前に実行しても値は反映されない。<br>
通話開始時のミュート状態を設定したい場合は、join 時に[connectOptions.enableVideo](#join-parameters)を指定する。

- 引数
  - require
    - isEnabled
- 返り値
  - `Promise<void>`
- エラー（[LSConfError](https://api.livestreaming.ricoh/docs/lsconf-error-specification/#%E3%82%A8%E3%83%A9%E3%83%BC%E4%B8%80%E8%A6%A7)）
  - MicMuteFailed

|Name|Type|説明|
|:--|:--|:--|
| isEnabled | boolean | `true`: カメラミュートが有効<br>`false`: カメラミュートが無効 |

#### setCameraDevice(deviceId)

カメラデバイスを変更する。<br>
ローカル録画時に実行した場合は録画が継続されるが録画映像は変更後に停止する。<br>

- 引数
  - require
    - deviceId
- 返り値
  - `Promise<void>`
- エラー（[LSConfError](https://api.livestreaming.ricoh/docs/lsconf-error-specification/#%E3%82%A8%E3%83%A9%E3%83%BC%E4%B8%80%E8%A6%A7)）
  - SetCameraDeviceFailed

|Name|Type|説明|
|:--|:--|:--|
| deviceId | string | `getMediaDevices()`で取得した`type: 'videoinput'`のdeviceId |

#### setMicMute(isEnabled)

join 後のマイクミュートの有効/無効を変更する。<br>
join 前に実行しても値は反映されない。<br>
通話開始時のミュート状態を設定したい場合は、join 時に[connectOptions.enableAudio](#join-parameters)を指定する。

- 引数
  - require
    - isEnabled
- 返り値
  - `Promise<void>`
- エラー（[LSConfError](https://api.livestreaming.ricoh/docs/lsconf-error-specification/#%E3%82%A8%E3%83%A9%E3%83%BC%E4%B8%80%E8%A6%A7)）
  - CameraMuteFailed

|Name|Type|説明|
|:--|:--|:--|
| isEnabled | boolean | `true`: マイクミュートが有効<br>`false`: マイクミュートが無効 |

#### setMicDevice(deviceId)

マイクデバイスを変更する。

- 引数
  - require
    - deviceId
- 返り値
  - `Promise<void>`
- エラー（[LSConfError](https://api.livestreaming.ricoh/docs/lsconf-error-specification/#%E3%82%A8%E3%83%A9%E3%83%BC%E4%B8%80%E8%A6%A7)）
  - SetMicDeviceFailed

|Name|Type|説明|
|:--|:--|:--|
| deviceId | string | `getMediaDevices()`で取得した`type: 'audioinput'`のdeviceId |

#### getVideoAudioStats()

映像/音声での接続の統計ログを取得する。

- 引数
  - なし
- 返り値
  - `Promise<string>`
- エラー（[LSConfError](https://api.livestreaming.ricoh/docs/lsconf-error-specification/#%E3%82%A8%E3%83%A9%E3%83%BC%E4%B8%80%E8%A6%A7)）
  - GetReportFailed
  - GetReportError

#### getScreenShareStats()

画面共有での接続の統計ログを取得する。

- 引数
  - なし
- 返り値
  - `Promise<string>`
- エラー（[LSConfError](https://api.livestreaming.ricoh/docs/lsconf-error-specification/#%E3%82%A8%E3%83%A9%E3%83%BC%E4%B8%80%E8%A6%A7)）
  - GetReportFailed
  - GetReportError


<!-- textlint-disable ja-technical-writing/no-exclamation-question-mark -->
#### getStats(subView, kind?)
<!-- textlint-enable ja-technical-writing/no-exclamation-question-mark -->

指定した SubView の接続の統計ログを取得する。

- 引数
  - require
    - subView
  - optional
    - kind
- 返り値
  - `Promise<string>`
- エラー（[LSConfError](https://api.livestreaming.ricoh/docs/lsconf-error-specification/#%E3%82%A8%E3%83%A9%E3%83%BC%E4%B8%80%E8%A6%A7)）
  - GetStatsFailed
  - GetStatsError
  - GetStatsArgsInvalid

|Name|Type|説明|
|:--|:--|:--|
| subView | SubView | 対象となるSubView |
| kind | 'video' \| 'audio' | 取得したいトラックの種別<br>未指定の場合は両方の情報が結合した文字列が返却される |

接続の統計ログは以下のような構造の JSON 文字列で返却される。  
引数の `kind` でトラック種別を指定した場合は、指定したもの (`"audio"`, `"video"`)のみ出力される。

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

音声や映像を送信していない場合は、`"send"`の統計は省略される。  
音声や映像を受信していない場合は、`"receive"`の統計は省略される。  
音声や映像を送信していない(カメラやマイクがハードミュート)の場合には、そのトラックの種別に対する統計は省略される。  
以下のように返却する統計が存在しない場合、空の JSON ( `{}` )が返却される。
- 自分自身の音声と映像を送信していない状態で、自分自身の SubView を引数に指定した場合
- 自分自身の音声（映像）を送信していない状態で、自分自身の SubView と kind に audio(video) を引数に指定した場合

#### getLSConfLog()

LSConf の問い合わせ用のログ情報を取得する。

- 引数
  - なし
- 返り値
  - `Promise<string>`
- エラー（[LSConfError](https://api.livestreaming.ricoh/docs/lsconf-error-specification/#%E3%82%A8%E3%83%A9%E3%83%BC%E4%B8%80%E8%A6%A7)）
  - GetLSConfLogFailed

<!-- textlint-disable ja-technical-writing/no-exclamation-question-mark -->
#### changeLayout(layout, subViews?)
<!-- textlint-enable ja-technical-writing/no-exclamation-question-mark -->

レイアウトを変更する。

- 引数
  - require
    - layout
  - optional
    - subViews
- 返り値
  - `Promise<void>`
- エラー（[LSConfError](https://api.livestreaming.ricoh/docs/lsconf-error-specification/#%E3%82%A8%E3%83%A9%E3%83%BC%E4%B8%80%E8%A6%A7)）
  - ChangeLayoutFailed
  - ChangeLayoutArgsInvalid

|Name|Type|説明|
|:--|:--|:--|
| layout | [LayoutType](#layouttype) | `gallery`: Galleryレイアウトに変更する<br>`presentation`: Presentationレイアウトに変更する<br>`fullscreen`: FullScreenレイアウトに変更する |
| subViews | SubView[] | 特定のSubViewを指定してレイアウトを変更する<br>未指定の場合は任意のSubViewが選択される<br>いずれの場合も不正なSubViewが指定された場合は無視される<br>`gallery`: 指定しても無視される<br>`presentation`: 指定された配列の全てのSubViewを拡大表示領域に表示する<br>`fullscreen`: 指定された配列の一番初めのSubViewを全画面表示する |

#### moveSubView(to, subView)

SubView の配置先を移動する。

- 引数
  - require
    - to
    - subView
- 返り値
  - `Promise<void>`
- エラー（[LSConfError](https://api.livestreaming.ricoh/docs/lsconf-error-specification/#%E3%82%A8%E3%83%A9%E3%83%BC%E4%B8%80%E8%A6%A7)）
  - MoveSubViewFailed
  - MoveSubViewError
  - MoveSubViewArgsInvalid


|Name|Type|説明|
|:--|:--|:--|
| to | 'presentation_main' \| 'presentation_sub' \| 'fullscreen' | SubViewの配置先 (※)<br>`presentation_main`: Presentationレイアウトの拡大表示領域<br>`presentation_sub`: Presentationレイアウトの通常表示領域<br>`fullscreen`: FullScreenレイアウトの全画面表示 |
| subView | [SubView](#subview) | 配置先を変更するSubView |

※ 現在のレイアウトの状態により、以下の条件で変更される。
  - 配置先に `presentation_main` を指定した場合
    - 現在のレイアウトが Gallery の場合、Presentation レイアウトに変更され、指定した SubView が拡大表示領域に表示される
    - 現在のレイアウトが Presentation の場合、拡大表示領域に指定した SubView が追加される
    - 現在のレイアウトが FullScreen の場合、Presentation レイアウトに変更され、全画面表示していた SubView と指定した SubView が拡大表示領域に表示される
  - 配置先に `presentation_sub` を指定した場合
    - 現在のレイアウトが Gallery の場合、無視される
    - 現在のレイアウトが Presentation の場合
      - 通常表示領域に指定した SubView が移動する
      - 拡大表示領域に SubView が 1 つもなくなった場合は Gallery レイアウトに変更される
    - 現在のレイアウトが FullScreen の場合、無視される
  - 配置先に `fullscreen` を指定した場合
    - 現在のレイアウトが Gallery の場合、FullScreen レイアウトに変更され、指定した SubView が全画面表示される
    - 現在のレイアウトが Presentation の場合、FullScreen レイアウトに変更され、指定した SubView が全画面表示される
    - 現在のレイアウトが FullScreen の場合、指定した SubView が全画面表示される

#### getSubViews()

SubView の一覧を取得する。

- 引数
  - なし
- 返り値
  - `Promise<SubView[]>`
- エラー（[LSConfError](https://api.livestreaming.ricoh/docs/lsconf-error-specification/#%E3%82%A8%E3%83%A9%E3%83%BC%E4%B8%80%E8%A6%A7)）
  - GetSubViewsFailed

#### highlight(subView)

指定された SubView を一定時間強調表示する。

- 引数
  - require
    - subView
- 返り値
  - `Promise<void>`
- エラー（[LSConfError](https://api.livestreaming.ricoh/docs/lsconf-error-specification/#%E3%82%A8%E3%83%A9%E3%83%BC%E4%B8%80%E8%A6%A7)）
  - HighlightFailed
  - HighlightError
  - HighlightArgsInvalid

|Name|Type|説明|
|:--|:--|:--|
| subView | SubView | 対象となるSubView |

#### getPoV(subView)

視点情報を取得する。

- 引数
  - require
    - subView
- 返り値
  - `Promise<PoV>`
- エラー（[LSConfError](https://api.livestreaming.ricoh/docs/lsconf-error-specification/#%E3%82%A8%E3%83%A9%E3%83%BC%E4%B8%80%E8%A6%A7)）
  - GetPoVFailed
  - GetPoVError
  - GetPoVArgsInvalid

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
  - `Promise<void>`
- エラー（[LSConfError](https://api.livestreaming.ricoh/docs/lsconf-error-specification/#%E3%82%A8%E3%83%A9%E3%83%BC%E4%B8%80%E8%A6%A7)）
  - SetPoVFailed
  - SetPoVError
  - SetPoVArgsInvalid

|Name|Type|説明|
|:--|:--|:--|
| subView | SubView | 対象となるSubView<br>360映像のSubViewのみ指定可能 |
| poV | PoV | 反映する視点情報 |

#### enablePointer(isEnabled)

360 映像 SubView 内に自拠点の視点ポインタ表示を切り替える。<br>
本機能はβ機能であり、今後機能の削除や仕様変更等発生する可能性がある。ご利用の際はご注意ください。

- 引数
  - require
    - isEnabled
- 返り値
  - `Promise<void>`
- エラー（[LSConfError](https://api.livestreaming.ricoh/docs/lsconf-error-specification/#%E3%82%A8%E3%83%A9%E3%83%BC%E4%B8%80%E8%A6%A7)）
  - EnablePointerFailed

|Name|Type|説明|
|:--|:--|:--|
| isEnabled | boolean | `true`: 自拠点の視点ポインタ表示が有効<br>`false`: 自拠点の視点ポインタ表示が無効 |

<!-- textlint-disable ja-technical-writing/no-exclamation-question-mark -->
#### updatePointer(subView, connectionId, poV, username?, color?)
<!-- textlint-enable ja-technical-writing/no-exclamation-question-mark -->

360 映像 SubView 内の相手視点ポインタの位置を更新する。<br>
本機能はβ機能であり、今後機能の削除や仕様変更等発生する可能性がある。ご利用の際はご注意ください。

- 引数
  - require
    - subView
    - connectionId
    - poV
  - optional
    - username
    - color
- 返り値
  - `Promise<void>`
- エラー（[LSConfError](https://api.livestreaming.ricoh/docs/lsconf-error-specification/#%E3%82%A8%E3%83%A9%E3%83%BC%E4%B8%80%E8%A6%A7)）
  - UpdatePointerArgsInvalid

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
  - `Promise<void>`
- エラー（[LSConfError](https://api.livestreaming.ricoh/docs/lsconf-error-specification/#%E3%82%A8%E3%83%A9%E3%83%BC%E4%B8%80%E8%A6%A7)）
  - AddRecordingMemberFailed
  - AddRecordingMemberError
  - AddRecordingMemberArgsInvalid

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
  - `Promise<void>`
- エラー（[LSConfError](https://api.livestreaming.ricoh/docs/lsconf-error-specification/#%E3%82%A8%E3%83%A9%E3%83%BC%E4%B8%80%E8%A6%A7)）
  - RemoveRecordingMemberFailed
  - RemoveRecordingMemberError
  - RemoveRecordingMemberArgsInvalid

|Name|Type|説明|
|:--|:--|:--|
| subView | SubView | 録画対象のSubView |
| connectionId | IDString | 録画を行った拠点のconnection_id |

#### getCaptureImage(subView, options)

指定した SubView の静止画を Blob 形式で取得する。

- 引数
  - require
    - subView
    - options
- 返り値
  - `Promise<Blob>`
- エラー（[LSConfError](https://api.livestreaming.ricoh/docs/lsconf-error-specification/#%E3%82%A8%E3%83%A9%E3%83%BC%E4%B8%80%E8%A6%A7)）
  - GetCaptureImageFailed
  - GetCaptureImageError
  - GetCaptureImageErrorCameraMuted
  - GetCaptureImageArgsInvalid

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

<!-- textlint-disable ja-technical-writing/no-exclamation-question-mark -->
#### addEventListener(type, callback, options?)
<!-- textlint-enable ja-technical-writing/no-exclamation-question-mark -->

LSConf 既定のイベントリスナーを追加する。

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

※ disconnect 後に再接続する場合などに、前回のイベントリスナーが残ったまま重複して登録することのないようご注意ください。

<!-- textlint-disable ja-technical-writing/no-exclamation-question-mark -->
#### removeEventListener(type, callback, _options?)
<!-- textlint-enable ja-technical-writing/no-exclamation-question-mark -->

LSConf 既定のイベントリスナーを削除する。

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

<!-- textlint-disable ja-technical-writing/no-exclamation-question-mark -->
#### addApplicationEventListener(type, callback, options?)
<!-- textlint-enable ja-technical-writing/no-exclamation-question-mark -->

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

<!-- textlint-disable ja-technical-writing/no-exclamation-question-mark -->
#### removeApplicationEventListener(type, callback, _options?)
<!-- textlint-enable ja-technical-writing/no-exclamation-question-mark -->

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

指定した SubView の映像受信を停止する。

- 引数
  - require
    - subView
- 返り値
  - `Promise<void>`
- エラー（[LSConfError](https://api.livestreaming.ricoh/docs/lsconf-error-specification/#%E3%82%A8%E3%83%A9%E3%83%BC%E4%B8%80%E8%A6%A7)）
  - StopReceiveVideoFailed
  - StopReceiveVideoError
  - StopReceiveVideoArgsInvalid

|Name|Type|説明|
|:--|:--|:--|
| subView | SubView | 映像受信を停止する対象のSubView |

※ 録画中の SubView の映像受信を停止した場合、停止したフレームが記録される。

#### startReceiveVideo(subView)

指定した SubView の映像受信を開始する。

- 引数
  - subView
- 返り値
  - `Promise<void>`
- エラー（[LSConfError](https://api.livestreaming.ricoh/docs/lsconf-error-specification/#%E3%82%A8%E3%83%A9%E3%83%BC%E4%B8%80%E8%A6%A7)）
  - StartReceiveVideoFailed
  - StartReceiveVideoError
  - StartReceiveVideoArgsInvalid

|Name|Type|説明|
|:--|:--|:--|
| subView | SubView | 映像受信を開始する対象のSubView |

#### enableZoom(subView, isEnabled)

UI 操作やポインティングデバイスによる SubView の拡大機能の有効/無効を切り替える。

- 引数
  - require
    - subView
    - isEnabled
- 返り値
  - `Promise<void>`
- エラー（[LSConfError](https://api.livestreaming.ricoh/docs/lsconf-error-specification/#%E3%82%A8%E3%83%A9%E3%83%BC%E4%B8%80%E8%A6%A7)）
  - EnableZoomFailed
  - EnableZoomError
  - EnableZoomArgsInvalid

|Name|Type|説明|
|:--|:--|:--|
| subView | SubView | 対象となるSubView |
| isEnabled | boolean | true: 拡大機能を有効にする<br>false: 拡大機能を無効にする |

#### setRotationVector(subview, rotationVector)

360 映像の SubView に対して天頂補正し、正立の状態で表示する。

- 引数
  - subView
  - rotationVector
- 返り値
  - 設定`Promise<void>`
- エラー（[LSConfError](https://api.livestreaming.ricoh/docs/lsconf-error-specification/#%E3%82%A8%E3%83%A9%E3%83%BC%E4%B8%80%E8%A6%A7)）
  - SetRotationVectorFailed
  - SetRotationVectorError
  - SetRotationVectorArgsInvalid

|Name|Type|説明|
|:--|:--|:--|
| subView | SubView | 天頂補正を行う対象のSubView<br>360映像でないSubViewが指定された場合はエラーとなる |
| rotationVector | RotationVector | THETA（Android標準の[SensorManager](https://developer.android.com/reference/android/hardware/SensorManager)）から取得できる[回転ベクトルセンサー](https://developer.android.com/guide/topics/sensors/sensors_position?hl=ja)の値 |

<!-- textlint-disable ja-technical-writing/no-exclamation-question-mark -->
#### updateStroke(subView, connectionId, stroke, username?, color?)
<!-- textlint-enable ja-technical-writing/no-exclamation-question-mark -->

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
  - `Promise<void>`
- エラー（[LSConfError](https://api.livestreaming.ricoh/docs/lsconf-error-specification/#%E3%82%A8%E3%83%A9%E3%83%BC%E4%B8%80%E8%A6%A7)）
  - UpdateStrokeArgsInvalid

|Name|Type|説明|
|:--|:--|:--|
| subView | SubView | 対象となるSubView |
| connectionId | IDString | ストローク情報の元となるconnection_id<br>同じconnection_idが再リクエストされた場合はストロークを更新する |
| stroke | [Stroke](#stroke) | 反映するストローク情報 |
| username | string | ストロークに付随して表示されるラベル<br>未指定の場合はjoin時に指定したusernameを表示<br>空文字列を指定した場合はusernameが非表示となる |
| color | string | ストロークおよびusernameラベルの表示色<br>指定する文字列は[CSSのColor定義](https://developer.mozilla.org/ja/docs/Web/CSS/color)に準拠した値とする<br>未指定や不正な値の場合はデフォルト値（ '#661FFF' ）となる |

#### addVideoSource(source)

Player で指定する動画ファイルのソース情報を追加する。<br>
<!-- textlint-disable ja-technical-writing/sentence-length -->
`VideoSource.connectionId` がすでに存在する場合は情報を上書きする。<br>
追加したソース情報内の URL の期限切れなどで [`MediaSourceError`](https://api.livestreaming.ricoh/docs/lsconf-error-specification/#mediasourceerror) が発生した場合は、同一の connectionId に対して URL を更新後のものに差し替えて再度実行することで SubView が更新される。
<!-- textlint-enable ja-technical-writing/sentence-length -->

- 引数
  - source
- 返り値
  - `Promise<void>`
- エラー（[LSConfError](https://api.livestreaming.ricoh/docs/lsconf-error-specification/#%E3%82%A8%E3%83%A9%E3%83%BC%E4%B8%80%E8%A6%A7)）
  - AddVideoSourceFailed
  - AddVideoSourceArgsInvalid

|Name|Type|説明|
|:--|:--|:--|
| source | [VideoSource](#videosource) | 動画ファイルのソース情報 |

※ 同期再生中にメタデータの無い動画やメタデータ内の roomId が他と異なる動画を追加した場合は、以下の挙動になる。
- 動画を追加した時点で SubView として追加される
- 追加された動画の再生位置は VideoControlBar のシークバーとは同期されず、シークできない
- 追加された動画の再生/一時停止は VideoControlBar の再生/一時停止ボタンと連動する

※ 同期再生中に現在の全ての動画の開始時刻より前の時刻を含む動画を追加した場合はその時間の差分だけ再生位置が前に移動する。

<!-- textlint-disable ja-technical-writing/no-exclamation-question-mark -->
#### addImageSource(source, parentConnectionId?)
<!-- textlint-enable ja-technical-writing/no-exclamation-question-mark -->

画像ファイルを指定して SubView に追加する。<br>
<!-- textlint-disable ja-technical-writing/sentence-length -->
`ImageSource.connectionId` がすでに存在する場合は情報を上書きする。<br>
追加したソース情報内の URL の期限切れなどで [`MediaSourceError`](https://api.livestreaming.ricoh/docs/lsconf-error-specification/#mediasourceerror) が発生した場合は、同一の connectionId に対して URL を更新後のものに差し替えて再度実行することで SubView が更新される。
<!-- textlint-enable ja-technical-writing/sentence-length -->

- 引数
  - require
    - source
  - optional
    - parentConnectionId
- 返り値
  - `Promise<void>`
- エラー（[LSConfError](https://api.livestreaming.ricoh/docs/lsconf-error-specification/#%E3%82%A8%E3%83%A9%E3%83%BC%E4%B8%80%E8%A6%A7)）
  - AddImageSourceFailed
  - AddImageSourceError
  - AddImageSourceArgsInvalid

|Name|Type|説明|
|:--|:--|:--|
| source | [ImageSource](#imagesource) | 画像ファイルのソース情報 |
| parentConnectionId | IDString | このSubViewの親のconnection_id(※)<br>未指定の場合は以下となります<br> - [Roomの場合] 自拠点が親となる<br> - [Playerの場合] null となる |

(※) 切断等で親の SubView が非表示となる場合に子の SubView も一緒に非表示となる。

#### removeImageSource(connectionId)

画像の SubView を削除する。

- 引数
  - connectionId
- 返り値
  - `Promise<void>`
- エラー（[LSConfError](https://api.livestreaming.ricoh/docs/lsconf-error-specification/#%E3%82%A8%E3%83%A9%E3%83%BC%E4%B8%80%E8%A6%A7)）
  - RemoveImageSourceFailed
  - RemoveImageSourceError
  - RemoveImageSourceArgsInvalid

|Name|Type|説明|
|:--|:--|:--|
| connectionId | IDString | addImageSource時に指定した [ImageSource](#imagesource).connectionId の値 |

#### changePlayerState(state)

Player 時の再生状態を変更する。<br>
Room 時に実行した場合は無視される。

- 引数
  - require
    - state
- 返り値
  - `Promise<void>`
- エラー（[LSConfError](https://api.livestreaming.ricoh/docs/lsconf-error-specification/#%E3%82%A8%E3%83%A9%E3%83%BC%E4%B8%80%E8%A6%A7)）
  - ChangePlayerStateFailed
  - ChangePlayerStateArgsInvalid

|Name|Type|説明|
|:--|:--|:--|
| state | 'play' \| 'pause' | 変更後のPlayerの再生状態<br>実行前と状態が変化しない場合は無視される |

#### setSpeakerVolume(volume)

Player 時のスピーカーの音量を設定する。<br>
Room 時に実行しても値は反映されない。

- 引数
  - require
    - volume
- 返り値
  - `Promise<void>`
- エラー（[LSConfError](https://api.livestreaming.ricoh/docs/lsconf-error-specification/#%E3%82%A8%E3%83%A9%E3%83%BC%E4%B8%80%E8%A6%A7)）
  - SetSpeakerVolumeFailed
  - SetSpeakerVolumeArgsInvalid

|Name|Type|説明|
|:--|:--|:--|
| volume | number | 設定できる範囲は `0` - `100` で範囲を超える場合は上限/下限に設定される <br> 0（または0以下）を指定するとミュート、0より大きい値を指定するとアンミュートとなる(※) |

(※) 浮動小数点を指定した場合、小数点以下を切り捨てた整数値とみなされる。

#### setSeekPosition(currentTime)

Player 時の再生位置を設定する。<br>
Room 時に実行しても値は反映されない。<br>
createPlayer を実行してから動画ファイルのロード完了後（最初の [playerStateChanged](#playerstatechanged) で pause 状態になった以降）に実行が可能となる。

- 引数
  - require
    - currentTime
- 返り値
  - `Promise<void>`
- エラー（[LSConfError](https://api.livestreaming.ricoh/docs/lsconf-error-specification/#%E3%82%A8%E3%83%A9%E3%83%BC%E4%B8%80%E8%A6%A7)）
  - SetSeekPositionFailed
  - SetSeekPositionArgsInvalid

|Name|Type|説明|
|:--|:--|:--|
| currentTime | number | 移動したい再生位置の [playerStateChanged](#playerstatechanged).currentTime の値<br>設定できる範囲は `0` - [`playerStateChanged.duration`](#playerstatechanged) の値(※)で範囲を超える場合は上限/下限に設定される |

(※) 浮動小数点を指定した場合、小数点以下を切り捨てた整数値とみなされる。

#### setVideoSendBitrate(bitrateKbps)

カメラ映像の送信ビットレートを変更する。<br>
join 完了後に実行が可能となり、join 完了前に実行した場合はエラーが返される。<br>
Player 時に実行した場合は無視される。

- 引数
  - require
    - bitrateKbps
- 返り値
  - `Promise<void>`
- エラー（[LSConfError](https://api.livestreaming.ricoh/docs/lsconf-error-specification/#%E3%82%A8%E3%83%A9%E3%83%BC%E4%B8%80%E8%A6%A7)）
  - SetVideoSendBitrateFailed
  - SetVideoSendBitrateArgsInvalid

|Name|Type|説明|
|:--|:--|:--|
| bitrateKbps | number | カメラ映像の送信ビットレートの値[kbps]<br>設定できる範囲は `100` - [`ConnectOptions.maxVideoBitrate`](#connectoptions)(未指定時はデフォルト) の値(※)で範囲を超える場合は上限/下限に設定される |

(※) 浮動小数点を指定した場合、小数点以下を切り捨てた整数値とみなされる。

#### setVideoSendFramerate(framerate)

カメラ映像の送信フレームレートを変更する。<br>
join 完了後に実行が可能となり、join 完了前に実行した場合はエラーが返される。<br>
Player 時に実行した場合は無視される。

- 引数
  - require
    - framerate
- 返り値
  - `Promise<void>`
- エラー（[LSConfError](https://api.livestreaming.ricoh/docs/lsconf-error-specification/#%E3%82%A8%E3%83%A9%E3%83%BC%E4%B8%80%E8%A6%A7)）
  - SetVideoSendFramerateFailed
  - SetVideoSendFramerateError
  - SetVideoSendFramerateArgsInvalid

|Name|Type|説明|
|:--|:--|:--|
| framerate | number | カメラ映像の送信フレームレートの値[fps]<br>設定できる範囲は `0` - `10000` の値(※) |

<!-- textlint-disable ja-technical-writing/sentence-length -->
(※) [`ConnectOptions.videoAudioConstraints`](#connectoptions) で指定されたフレームレート（またはカメラの出力フレームレート）を超えた値を設定しても実効フレームレートはその値を上限/下限として制限される。
<!-- textlint-enable ja-technical-writing/sentence-length -->

#### setVideoAudioConstraints(constraints)

接続時に指定した [`ConnectOptions.videoAudioConstraints`](#connectoptions) のパラメータを変更する(※1)。<br>
join 完了後に実行が可能となり、join 完了前に実行した場合はエラーが返される。<br>
Player 時に実行した場合は無視される。<br>
自拠点のローカル録画中に実行した場合、録画は停止される。<br>

- 引数
  - require
    - constraints
- 返り値
  - `Promise<void>`
- エラー（[LSConfError](https://api.livestreaming.ricoh/docs/lsconf-error-specification/#%E3%82%A8%E3%83%A9%E3%83%BC%E4%B8%80%E8%A6%A7)）
  - SetVideoAudioConstraintsFailed
  - SetVideoAudioConstraintsError
  - SetVideoAudioConstraintsArgsInvalid

|Name|Type|説明|
|:--|:--|:--|
| constraints | [MediaStreamConstraints](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia) | 自拠点の映像と音声の [MediaTrackConstraints](https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints)(※2) を指定する<br>`video` および `audio` に `false` が指定された場合はダミーデバイスを使用する |

(※1): 変更の際に映像や音声が一時的に途切れることがある。<br>
(※2): 利用可能なパラメータはブラウザによって異なる。未対応や未指定の場合はブラウザ側の仕様に従う。各ブラウザのサポート状況は[こちら](https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints#browser_compatibility)をご参照ください。

### Events

LSConf の既定のイベントに対するイベントハンドラーは `addEventListener()` を介して登録する。<br>
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

※ `detail.subView` の各パラメータは、そのトラック種別のトラックが追加されるまではデフォルト値となる。

例：音声 → 映像の順でトラックが追加された場合。
- 音声のトラックの `remoteTrackAdded` に含まれる値は以下の通り
  - `detail.subView.isTheta`: 対象拠点が 360 映像であるかどうかに関わらず常に `false`
  - `detail.subView.enableVideo`: 対象拠点のカメラのミュート状態に関わらず常に `false`
  - `detail.subView.enableAudio`: 対象拠点のマイクの実際のミュート状態と同じ値
- 映像のトラックの `remoteTrackAdded` に含まれる値は以下の通り
  - `detail.subView.isTheta`: 対象拠点が 360 映像であれば `true`、そうでなければ `false`
  - `detail.subView.enableVideo`: 対象拠点のカメラの実際のミュート状態と同じ値
  - `detail.subView.enableAudio`: 対象拠点のマイクの実際のミュート状態と同じ値

#### mediaDeviceChanged

デバイス設定が変更された。<br>
ダミーデバイスに設定された状態でミュートを解除しようとした場合は変更がなくともこちらのイベントが発火する。

```js
{
  type: 'mediaDeviceChanged',
  detail: {
    deviceId: string,
    groupId: string,
    kind: string,
    label: string,
    isMuted: boolean,
    capabilities?: MediaTrackCapabilities,
  }
}
```

|Name|Type|説明|
|:--|:--|:--|
| deviceId | string | [MediaDeviceInfo](https://developer.mozilla.org/ja/docs/Web/API/MediaDeviceInfo).deviceId の値<br>ダミーデバイスの場合は 'dummy-device' となる |
| groupId | string | [MediaDeviceInfo](https://developer.mozilla.org/ja/docs/Web/API/MediaDeviceInfo).groupId の値<br>ダミーデバイスの場合は 'dummy-device' となる |
| kind | string | [MediaDeviceInfo](https://developer.mozilla.org/ja/docs/Web/API/MediaDeviceInfo).kind の値 |
| label | string | [MediaDeviceInfo](https://developer.mozilla.org/ja/docs/Web/API/MediaDeviceInfo).label の値<br>ダミーデバイスの場合は[文言カスタマイズガイド](https://api.livestreaming.ricoh/docs/lsconf-wording-customize-guide/#devicesettingsdialog)の deviceSettingsDialog.notUsed の値となる |
| isMuted | boolean | `true`: デバイスがミュート状態<br>`false`: デバイスがアンミュート状態 |
| capabilities | MediaTrackCapabilities | [MediaStreamTrack.getCapabilities()](https://developer.mozilla.org/en-US/docs/Web/API/MediaStreamTrack/getCapabilities) の値<br>以下の場合は `undefined` となる<br> - 非対応ブラウザ<br> - ダミーデバイス |

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

ストロークの書き込みが更新された。<br>
イベントの発火タイミングについては以下の通りである。

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

#### playerStateChanged

Player の再生状態が変化した。

```js
{
  type: 'playerStateChanged',
  detail: {
    state: PlayerState,
    duration: number,
    currentTime: number,
    startedAt?: number,
    endedAt?: number,
    currentDate?: number
  }
}
```

|Name|Type|説明|
|:--|:--|:--|
| state | [PlayerState](#playerstate) | 現在のPlayerの状態 |
| duration | number | 総再生時間（単位はms）(※1) |
| currentTime | number | 現在の再生位置（単位はms）(※2) |
| startedAt | number | [同期再生] 動画全体の開始時刻のUnixTime（単位はms）<br>[一括再生] detailに含まれない |
| endedAt | number | [同期再生] 動画全体の終了時刻のUnixTime（単位はms）<br>[一括再生] detailに含まれない |
| currentDate | number | 現在の再生位置の時刻のUnixTime （単位はms）<br>一括再生の場合はdetailに含まれない |

(※1): 総再生時間の定義は以下の通りである。
- 同期再生の場合: 指定された全ての動画の `started_at` と `ended_at` から計算した全体の再生時間
- 一括再生の場合: 指定された全ての動画の中で一番長い動画の再生時間

(※2): 取りうる値の範囲は以下の通りである。
- 同期再生の場合: `0` から `指定された全ての動画の started_at と ended_at から計算した全体の再生時間`
- 一括再生の場合: `0` から `指定された動画の中で一番長い動画の再生時間`

#### changeMediaStability

通信の安定性が変化した。

```js
{
  type: 'changeMediaStability',
  detail: {
    kind: 'VideoAudioClient' | 'ScreenShareClient',
    stability: 'stable' | 'unstable',
  }
}
```

| Name | Type | 説明 |
|:--|:--|:--|
| kind | 'VideoAudioClient' \| 'ScreenShareClient' | イベントが発生したクライアント種別 | 
| stability | stable \| unstable | `stable`: ネットワーク帯域が安定(復帰), `unstable`: ネットワーク帯域が不安定 | 

#### userOperation

ユーザによって UI 操作が行われた。

```js
{
  type: 'userOperation',
  detail: {
    type: string,
    detail: any,
  }
}
```

|Name|Type|説明|
|:--|:--|:--|
| type | string | ユーザによって行われた UI 操作の識別子 |
| detail | any | ユーザによって行われた UI 操作に対して付随する情報 |

- SubView の操作
  | type | 操作 | detail |
  |:--|:--|:--|
  | subView.menu | メニューボタン押下,<br>（表示中に）領域外押下 | `{ subView: SubView, enabled: boolean }`<br>`SubView`: 操作対象のSubView<br>`true`: 表示, `false`: 非表示 |
  | subView.drawingButton | 書き込みボタン押下 | `{ subView: SubView, enabled: boolean }`<br>`SubView`: 操作対象のSubView<br>`true`: 開始, `false`: 終了 |
  | subView.normal.zoom | （通常映像に対して）<br>拡大/縮小ボタン押下,<br>マウスホイール操作,<br>ピンチイン/ピンチアウト | `{ subView: SubView, type: 'in' \| 'out' }`<br>`SubView`: 操作対象のSubView<br>`'in'`: 拡大, `'out'`: 縮小 |
  | subView.theta.pov | （360映像に対して）<br>視点操作,<br>拡大/縮小ボタン押下,<br>マウスホイール操作,<br>ピンチイン/ピンチアウト | `{ subView: SubView, pov: PoV }`<br>`SubView`: 操作対象のSubView<br>`PoV`: 操作終了時点の視点情報(※) |

  (※) 視点操作後は映像を滑らかに見せるため、移動を即座に止めるのではなく、慣性で徐々に動きを抑えていくようにしている。そのため、イベント発火時点の視点情報と視点の移動が完全に止まった後の視点情報が一致するとは限らない。
- SubViewMenu の操作
  | type | 操作 | detail |
  |:--|:--|:--|
  | subView.menu.galleryButton | 一覧表示ボタン押下 | `{}` |
  | subView.menu.presentationButton | 拡大表示ボタン押下 | `{ subView: SubView }`<br>`SubView`: 操作対象のSubView |
  | subView.menu.fullScreenButton | 全画面表示ボタン押下 | `{ subView: SubView }`<br>`SubView`: 操作対象のSubView |
  | subView.menu.exitFullscreenButton | 全画面解除ボタン押下 | `{ subView: SubView }`<br>`SubView`: 操作対象のSubView |
  | subView.menu.sharePoVButton | 視点共有ボタン押下 | `{ subView: SubView }`<br>`SubView`: 操作対象のSubView |
  | subView.menu.startRecordingButton | ローカル録画開始ボタン押下 | `{ subView: SubView }`<br>`SubView`: 操作対象のSubView |
  | subView.menu.stopRecordingButton | ローカル録画停止ボタン押下 | `{ subView: SubView }`<br>`SubView`: 操作対象のSubView |
- 録画設定ダイアログの操作
  | type | 操作 | detail |
  |:--|:--|:--|
  | dialog.recordSetting.mimeType | MIME Type の値を変更 | `{ mimeType: string }`<br>`mimeType`: 選択した MIME Type の値 |
  | dialog.recordSetting.audioMixing | Audio Mixing の値を変更 | `{ audioMixing: string }`<br>`audioMixing`: 選択した Audio Mixing の値 |
  | dialog.recordSetting.audioBitrate | Audio Bitrate の値を変更 | `{ audioBitrate: string }`<br>`audioBitrate`: 選択した Audio Bitrate の値 |
  | dialog.recordSetting.videoBitrate | Video Bitrate の値を変更 | `{ videoBitrate: string }`<br>`videoBitrate`: 選択した Video Bitrate の値 |
  | dialog.recordSetting.cancelButton | キャンセルボタン押下 | `{}` |
  | dialog.recordSetting.startButton | 開始ボタン押下 | `{ mimeType: string, audioMixing: string, audioBitrate: string, videoBitrate: string }`<br>録画開始時に選択されている各パラメータの値 |
- Toolbar の操作
  | type | 操作 | detail |
  |:--|:--|:--|
  | toolbar.cameraButton | カメラボタン押下 | `{ enabled: boolean }`<br>`true`: ON, `false`: OFF |
  | toolbar.micButton  | マイクボタン押下 | `{ enabled: boolean }`<br>`true`: ON, `false`: OFF |
  | toolbar.screenShareButton | 画面共有ボタン押下 | `{ enabled: boolean }`<br>`true`: 開始, `false`: 終了 |
  | toolbar.participantsButton | 参加者一覧ボタン押下 | `{}` |
  | toolbar.deviceSetting | デバイス設定ボタン押下 | `{}` |
  | toolbar.exitButton| 切断ボタン押下 | `{}` |
- デバイス設定ダイアログの操作
  | type | 操作 | detail |
  |:--|:--|:--|
  | dialog.deviceSetting.camera | カメラデバイスの変更 | `{ label: string }`<br>`label`: 選択したカメラデバイス名 |
  | dialog.deviceSetting.mic | マイクデバイスの変更 | `{ label: string }`<br>`label`: 選択したマイクデバイス名 |
  | dialog.deviceSetting.speaker | スピーカーデバイスの変更 | `{ label: string }`<br>`label`: 選択したスピーカーデバイス名 |
  | dialog.deviceSetting.speakerTestButton | スピーカーテストボタン押下 | `{}` |
  | dialog.deviceSetting.cancelButton | キャンセルボタン押下 | `{}` |
  | dialog.deviceSetting.applyButton | 適用ボタン押下 | `{ camera: string, mic: string, speaker: string }`<br>適用時に選択されている各デバイス名 |
- VideoControlBar の操作
  | type | 操作 | detail |
  |:--|:--|:--|
  | videoControlBar.playButton | 再生ボタン押下,<br>一時停止ボタン押下 | `{ playerState: 'play' \| 'pause' }`<br>`'play'`: 再生開始, `'pause'`: 一時停止 |
  | videoControlBar.volumeButton | 音量ボタン押下 | `{ enabled: boolean }`<br>`true`: スピーカーON, `false`: スピーカーOFF |
  | videoControlBar.volumeBar | 音量バー移動 | `{ volume: number }`<br>`volume`: 変更後の音量（0 - 100） |
  | videoControlBar.seekBar | シークバー移動 | `{ currentTime: number }`<br>`currentTime`: 変更後のシークバーの時間 |
- GalleryLayout の操作
  | type | 操作 | detail |
  |:--|:--|:--|
  | galleryLayout.doubleClick | SubViewをダブルクリック | `{ subView: SubView }`<br>`SubView`: 操作対象のSubView |
- PresentationLayout の操作
  | type | 操作 | detail |
  |:--|:--|:--|
  | presentationLayout.horizontalButton | 横並びに切替ボタン押下 | `{}` |
  | presentationLayout.verticalButton | 縦並びに切替ボタン押下 | `{}` |
  | presentationLayout.main.doubleClick | 拡大表示領域のSubViewをダブルクリック | `{ subView: SubView }`<br>`SubView`: 操作対象のSubView |
  | presentationLayout.sub.doubleClick | 通常表示領域のSubViewをダブルクリック | `{ subView: SubView }`<br>`SubView`: 操作対象のSubView |

#### log

ログ出力イベントが発火した。

```js
{
  type: 'log',
  detail: {
    message: string,
    category: LogCategory,
    subcategory: string,
    date: string,
  }
}
```

|Name|Type|説明|
|:--|:--|:--|
| message | string | ログのメッセージ |
| category | [LogCategory](#logcategory) | ログの種別 |
| subcategory | string | ログの第2種別 |  |
| date | string | ISO 8601形式による時刻情報 |

#### error

エラーが発生した。<br>
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

アプリケーションから create 時にカスタムボタンを追加した場合、そのボタンに対するイベントが発生する。<br>
イベントハンドラーは `addApplicationEventListener()` を介して登録する。<br>
パラメータが含まれるイベントは `CustomEvent.detail` から値を取得してください。

#### ToolbarItem

ツールバー上のカスタムボタンが押された際にイベントが発生する。

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

SubViewMenu 上のカスタムボタンが押された際にイベントが発生する。

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
