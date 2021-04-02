// iframe を表示するページ
import './IframePage.css';

import format from 'date-fns/format';
import qs from 'query-string';
import React, { useLayoutEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';

import { fetchAccessToken } from '@/api';
import ErrorDialog from '@/components/ErrorDialog';
import { DEFAULT_LAYOUT, IS_HIDDEN_RECORDING_BUTTON, IS_HIDDEN_VIDEO_MENU_BUTTON, LS_CLIENT_ID, LS_CONF_URL, SIGNALING_URL, THEME_CONFIG, THETA_ZOOM_MAX_RANGE, TOOLBAR_CONFIG } from '@/constants';
import LSConferenceIframe from '@/lib/ls-conf-sdk';

const CREATE_PARAMETERS = {
  defaultLayout: (DEFAULT_LAYOUT as 'gallery' | 'presentation' | 'fullscreen') || undefined,
  isHiddenVideoMenuButton: IS_HIDDEN_VIDEO_MENU_BUTTON,
  isHiddenRecordingButton: IS_HIDDEN_RECORDING_BUTTON,
  toolbar: TOOLBAR_CONFIG,
  thetaZoomMaxRange: THETA_ZOOM_MAX_RANGE,
  lsConfURL: LS_CONF_URL ? LS_CONF_URL : undefined,
  theme: THEME_CONFIG,
};

const IframePage: React.FC<{}> = () => {
  // eslint-disable-next-line @typescript-eslint/camelcase
  const { username, video_bitrate, share_bitrate, default_layout, use_dummy_device } = qs.parse(window.location.search);
  const { roomId } = useParams<{ roomId: string }>();
  const iframeContainerRef = useRef<HTMLDivElement>(null);
  const [lsConfIframe, setLsConfIframe] = useState<LSConferenceIframe | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const showErrorDialog = errorMessage !== null;
  const createAndConnectRoom = async (): Promise<void> => {
    if (!username || !roomId || typeof username !== 'string') {
      // 現在 ls-conf-sdk への対応と同様にエラーをそのまま errorMessage に入れている
      // TODO(kdxu): ls-conf-sdk のシステムエラーに対するユーザーへのメッセージが仕様として策定され次第、こちらのエラー文言も合わせて修正する
      setErrorMessage('INVALID-PARAMETERS');
      return;
    }
    if (!iframeContainerRef.current) {
      // 現在 ls-conf-sdk への対応と同様にエラーをそのまま errorMessage に入れている
      // TODO(kdxu): ls-conf-sdk のシステムエラーに対するユーザーへのメッセージが仕様として策定され次第、こちらのエラー文言も合わせて修正する
      setErrorMessage('INVALID-IFRAME-CONTAINER');
      return;
    }
    let iframe: LSConferenceIframe;
    try {
      // eslint-disable-next-line @typescript-eslint/camelcase
      if (default_layout && typeof default_layout === 'string' && ['gallery', 'presentation', 'fullscreen'].includes(default_layout.toLowerCase())) {
        // eslint-disable-next-line @typescript-eslint/camelcase
        CREATE_PARAMETERS.defaultLayout = default_layout.toLowerCase() as 'gallery' | 'presentation' | 'fullscreen';
      }
      iframe = await LSConferenceIframe.create(iframeContainerRef.current, CREATE_PARAMETERS);
    } catch (e) {
      setErrorMessage(e.message);
      return;
    }
    iframe.onShareRequested(async () => {
      let screenShareAccessToken;
      const connectionId = username + '_screen';
      try {
        screenShareAccessToken = await fetchAccessToken(roomId, connectionId);
      } catch (e) {
        setErrorMessage(e.message);
        return;
      }
      return screenShareAccessToken;
    });
    let accessToken;
    const connectionId = username;
    try {
      accessToken = await fetchAccessToken(roomId, connectionId);
    } catch (e) {
      setErrorMessage(e.message);
      return;
    }
    const connectOptions = {
      username: username,
      enableVideo: false,
      enableAudio: true,
      maxVideoBitrate: Number(video_bitrate),
      maxShareBitrate: Number(share_bitrate),
      // eslint-disable-next-line @typescript-eslint/camelcase
      useDummyDevice: Boolean(use_dummy_device && typeof use_dummy_device === 'string' && use_dummy_device.toLowerCase() === 'true'),
      signalingURL: SIGNALING_URL,
    };
    iframe.addEventListener('error', async (e: ErrorEvent) => {
      setErrorMessage(e.message);

      let log = 'LSConfSample Log\n\n';
      log += `******************** Error Message ********************\n`;
      log += `${e.message}\n`;
      log += `******************** Environment **********************\n`;
      log += `LSConfSample Version: v${require('../../../../frontend/package.json').version}\n`;
      log += `LSConfURL: ${LS_CONF_URL || 'default'}\n`;
      log += `LSClientID: ${LS_CLIENT_ID || 'unknown'}\n`;
      log += `SignalingURL: ${SIGNALING_URL || 'default'}\n`;
      log += `UserAgent: ${window.navigator.userAgent}\n`;
      log += `******************** VideoAudioLog ********************\n`;
      try {
        log += await iframe.getVideoAudioLog();
      } catch {
        // ログ取得失敗時は出力ファイルに追記しない
      }
      log += `******************** ScreenShareLog *******************\n`;
      try {
        log += await iframe.getScreenShareLog();
      } catch {
        // ログ取得失敗時は出力ファイルに追記しない
      }
      log += `******************** VideoAudioStats ******************\n`;
      try {
        log += await iframe.getVideoAudioStats();
      } catch {
        // ログ取得失敗時は出力ファイルに追記しない
      }
      log += `******************** ScreenShareStats *****************\n`;
      try {
        log += await iframe.getScreenShareStats();
      } catch {
        // ログ取得失敗時は出力ファイルに追記しない
      }
      if (e.error.toReportString) {
        log += `******************** toReportString *******************\n`;
        log += `${e.error.toReportString}`;
      }

      const fileName = `ls-conf-sample_${format(new Date(), 'yyyyMMdd_HHmmss')}.log`;
      const downLoadLink = document.createElement('a');
      downLoadLink.download = fileName;
      downLoadLink.href = URL.createObjectURL(new Blob([log], { type: 'text.plain' }));
      downLoadLink.dataset.downloadurl = ['text/plain', downLoadLink.download, downLoadLink.href].join(':');
      downLoadLink.click();
    });
    iframe.addEventListener('disconnected', () => {
      // TODO(ueue): disconnect時の挙動が決まったら実装
    });
    try {
      await iframe.join(LS_CLIENT_ID, accessToken, connectOptions);
    } catch (e) {
      setErrorMessage(e.message);
      return;
    }
    setLsConfIframe(iframe);
  };
  const onCloseErrorDialog = (): void => {
    setErrorMessage(null);
  };
  useLayoutEffect(() => {
    createAndConnectRoom();
    return () => {
      if (lsConfIframe) {
        lsConfIframe.leave();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <>
      <div ref={iframeContainerRef} className="iframe-container" />
      <ErrorDialog open={showErrorDialog} message={errorMessage} onClose={onCloseErrorDialog} />
    </>
  );
};

export default IframePage;
