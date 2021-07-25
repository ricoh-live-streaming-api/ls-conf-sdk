# CHANGE LOG

## v2.2.1
- Changed
  - [LSConf] Videoのアスペクト比をデフォルトで16:9で取得するように変更
- Fixed
  - [LSConf] 録画通知の改善

## v2.2.0
- Added
  - [LSConf] PresentationLayoutの通常表示領域のレイアウトの切替機能を追加
- Fixed
  - [SDK] getSubViews()のレスポンスに自拠点と共有画面のSubViewが含まれない問題を修正

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
