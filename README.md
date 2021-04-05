# RICOH Live Streaming Conference

株式会社リコーが提供するRICOH Live Streaming Serviceを利用するためのRICOH Live Streaming Conference (Web Application Component) です。

RICOH Live Streaming Serviceは、映像/音声などのメディアデータやテキストデータなどを
複数の拠点間で双方向かつリアルタイムにやりとりできるプラットフォームです。

サービスのご利用には、API利用規約への同意とアカウントの登録、ソフトウェア利用許諾書への同意が必要です。
詳細は下記Webサイトをご確認ください。

* サービスサイト: https://livestreaming.ricoh/
  * ソフトウェア開発者向けサイト: https://api.livestreaming.ricoh/
* ソフトウェア使用許諾契約書 : [Software License Agreement](SoftwareLicenseAgreement.txt)

* NOTICE: This package includes SDK and sample application(s) for "RICOH Live Streaming Service".
At this moment, we provide API license agreement / software license agreement only in Japanese.

## はじめに

RICOH Live Streaming Conference は RICOH Live Streaming Service を使った様々な機能をiframeコンポーネントとしてWebアプリケーションへ簡単に組み込むためのWebアプリケーション用コンポーネントです。

## 配布パッケージ構成

* `README.md`: 本文書
* `CHANGELOG.md`: LSConfおよびLSConfSDKの変更履歴
* `SoftwareLicenseAgreement.txt`: ソフトウェア使用許諾契約書
* `doc/`
  * `APIReference.md`: LSConfSDKのAPI仕様
* `src/`
  * `ls-conf-sdk.d.ts`: TypeScriptで必要となる型定義ファイル
  * `ls-conf-sdk.js`: LSConfSDK本体
* `sample/`
  * `README.md`: LSConfを利用したサンプルアプリの説明
  * `CHANGELOG.md`: サンプルアプリの変更履歴
  * `frontend/`: サンプルアプリのfrontend
  * `backend/`: サンプルアプリのfrontend

## アプリケーションからの利用例

```html
...
<script src="../src/ls-conf-sdk.js"></script>
...
<script>
let frame = null;
async function createAndJoin() {
  try {
    frame = window.LSConferenceIframe.create(
      document.getElementById('frame-container'),
      {
        thetaZoomMaxRange: 8,
        defaultLayout: 'gallery',
        toolbar: {
          isHidden: false,
          isHiddenCameraButton: false,
          isHiddenMicButton: false,
          isHiddenScreenShareButton: false,
          isHiddenDeviceSettingButton: false,
          isHiddenExitButton: false
        },
        isHiddenVideoMenuButton: false,
        isHiddenRecordingButton: false,
        theme: {
          primary: '#303030',
          background: '#f7f7fa',
          surface: '#fff',
          onPrimary: '#fff'
        }
      }
    );
  } catch(error) {
    console.error('LSConferenceIframe.create failed: ', error.detail.type);
    return;
  }

  frame.addEventListener('error', (event) => {
    console.log(`Error occurred, ${event.message}`);
  });

  frame.onShareRequested(() => {
    let accessToken = null;
    try {
      accessToken = await createAccessToken();
    } catch(error) {
      console.error('createAccessToken failed: ', error.detail.type);
      return;
    }
    return accessToken;
  });

  frame.addEventListener('shareRequested', () => {
    console.log('Share button pushed');
  });

  let accessToken = null;
  try {
    accessToken = await createAccessToken();
  } catch(error) {
    console.error('createAccessToken failed: ', error.detail.type);
    return;
  }

  try {
    await frame.join({
      clientId: 'hoge',
      acccessToken: accessToken,
      connectOptions: {
        username: 'huga'
        enableVideo: true,
        enableAudio: true,
      }
    });
  } catch(error) {
    console.error('Join failed: ', error.detail.type);
  }
  console.log('Join success');
}

async function leave() {
  if (frame == null) {
    console.error('leave failed: iframe is not created.');
    return
  }

  try {
    await frame.leave();
  } catch(error) {
    console.error('Leave failed: ', error.detail.type);
  }
  console.log('Leave success');
}
</script>
...
<div>
  <button id="join-meeting" onclick="createAndJoin()">
    join meeting
  </button>
  <button id="leave-meeting" onclick="leave()">
    leave meeting
  </button>
  <div id="frame-container">
  </div>
</div>
...
```

※ `createAccessToken()` はアプリ側で実装すべきメソッドのため、ここでは詳細は割愛する
