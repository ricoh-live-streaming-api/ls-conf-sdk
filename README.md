# RICOH Live Streaming Conference

<!-- textlint-disable ja-technical-writing/sentence-length -->
株式会社リコーが提供する RICOH Live Streaming Service を利用するための RICOH Live Streaming Conference (Web Application Component) である。
<!-- textlint-enable ja-technical-writing/sentence-length -->

RICOH Live Streaming Service は、映像/音声などのメディアデータやテキストデータなどを
複数の拠点間で双方向かつリアルタイムにやりとりできるプラットフォームである。

サービスのご利用には、API 利用規約への同意とアカウントの登録、ソフトウェア利用許諾書への同意が必要である。
詳細は下記 Web サイトをご確認ください。

* サービスサイト: https://livestreaming.ricoh/
* ソフトウェア使用許諾契約書 : [Software License Agreement](SoftwareLicenseAgreement.txt)

* NOTICE: This package includes SDK and sample application(s) for "RICOH Live Streaming Service".
At this moment, we provide API license agreement / software license agreement only in Japanese.

## はじめに

<!-- textlint-disable ja-technical-writing/sentence-length -->
RICOH Live Streaming Conference は RICOH Live Streaming Service を使った様々な機能を iframe コンポーネントとして Web アプリケーションへ簡単に組み込むための Web アプリケーション用コンポーネントである。
<!-- textlint-enable ja-technical-writing/sentence-length -->

## 配布パッケージ構成

* `README.md`: 本文書
* `CHANGELOG.md`: LSConf および LSConfSDK の変更履歴
* `SoftwareLicenseAgreement.txt`: ソフトウェア使用許諾契約書
* `doc/`
  * `APIReference.md`: LSConfSDK の API 仕様
* `src/`
  * `ls-conf-sdk.d.ts`: TypeScript で必要となる型定義ファイル
  * `ls-conf-sdk.js`: LSConfSDK 本体
  * `lang/`: 言語設定（本ディレクトリを `ls-conf-sdk.js` と同じ場所に配置してください）
* `sample/`
  * `README.md`: LSConf を利用したサンプルアプリの説明
  * `frontend/`: サンプルアプリの frontend
  * `backend/`: サンプルアプリの backend

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
          isHiddenSpeakerButton: true,
          isHiddenScreenShareButton: false,
          isHiddenDeviceSettingButton: false,
          isHiddenExitButton: false
        },
        theme: {
          primary: '#303030',
          background: '#f7f7fa',
          surface: '#fff',
          onPrimary: '#fff'
        },
        subView: {
          menu: {
            isHidden: false,
            isHiddenRecordingButton: false,
            isHiddenSharePoVButton: true,
          }
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
    }
    return accessToken;
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
      accessToken: accessToken,
      connectOptions: {
        username: 'fuga'
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

※ `createAccessToken()` はアプリ側で実装すべきメソッドのため、ここでは詳細は割愛する。
