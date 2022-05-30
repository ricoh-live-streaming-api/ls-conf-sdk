// iframe を表示するページ
import './IframePage.css';

import format from 'date-fns/format';
import qs from 'query-string';
import React, { useLayoutEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

import { fetchAccessToken } from '@/api';
import ErrorDialog from '@/components/ErrorDialog';
import { DEFAULT_LAYOUT, LS_CLIENT_ID, LS_CONF_URL, ROOM_CONFIG, SIGNALING_URL, SUBVIEW_CONFIG, THEME_CONFIG, THETA_ZOOM_MAX_RANGE, TOOLBAR_CONFIG } from '@/constants';
import LSConferenceIframe, { ConnectOptions, CreateParameters, ScreenShareParameters } from '@/lib/ls-conf-sdk';

const CREATE_PARAMETERS: CreateParameters = {
  defaultLayout: (DEFAULT_LAYOUT as 'gallery' | 'presentation' | 'fullscreen') || undefined,
  room: ROOM_CONFIG as {
    entranceScreen?: 'none' | 'click';
  },
  toolbar: TOOLBAR_CONFIG,
  thetaZoomMaxRange: THETA_ZOOM_MAX_RANGE,
  lsConfURL: LS_CONF_URL ? LS_CONF_URL : undefined,
  subView: SUBVIEW_CONFIG,
  theme: THEME_CONFIG,
};

const IframePage: React.FC<Record<string, never>> = () => {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const { username, video_bitrate, share_bitrate, default_layout, enable_video, enable_audio, use_dummy_device, bitrate_reservation_mbps, room_type, video_codec, is_debug } = qs.parse(
    window.location.search
  );
  const { roomId } = useParams<{ roomId: string }>();
  const iframeContainerRef = useRef<HTMLDivElement>(null);
  const [lsConfIframe, setLsConfIframe] = useState<LSConferenceIframe | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const showErrorDialog = errorMessage !== null;
  const connectionId: string = uuidv4();
  const bitrateReservation = bitrate_reservation_mbps && typeof bitrate_reservation_mbps === 'string' ? bitrate_reservation_mbps : undefined;
  const roomType = room_type && typeof room_type === 'string' ? room_type : undefined;
  const videoCodec = video_codec && (video_codec === 'h264' || video_codec === 'vp8' || video_codec === 'vp9' || video_codec === 'h265' || video_codec === 'av1') ? video_codec : undefined;
  const isDebug = Boolean(is_debug && typeof is_debug === 'string' && is_debug.toLowerCase() === 'true');
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
      // eslint-disable-next-line @typescript-eslint/naming-convention
      if (default_layout && typeof default_layout === 'string' && ['gallery', 'presentation', 'fullscreen'].includes(default_layout.toLowerCase())) {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        CREATE_PARAMETERS.defaultLayout = default_layout.toLowerCase() as 'gallery' | 'presentation' | 'fullscreen';
      }
      iframe = await LSConferenceIframe.create(iframeContainerRef.current, CREATE_PARAMETERS);
    } catch (e) {
      setErrorMessage(e.message);
      return;
    }
    iframe.onShareRequested(async () => {
      let screenShareAccessToken;
      const screenShareConnectionId = uuidv4();
      try {
        screenShareAccessToken = await fetchAccessToken(roomId, screenShareConnectionId, bitrateReservation, roomType);
      } catch (e) {
        setErrorMessage(e.message);
        return;
      }
      const screenShareParameters: ScreenShareParameters = {
        connectionId: screenShareConnectionId,
        accessToken: screenShareAccessToken,
      };
      return screenShareParameters;
    });
    let accessToken;
    try {
      accessToken = await fetchAccessToken(roomId, connectionId, bitrateReservation, roomType);
    } catch (e) {
      setErrorMessage(e.message);
      return;
    }
    const connectOptions: ConnectOptions = {
      username: username,
      enableVideo: !enable_video ? false : Boolean(typeof enable_video === 'string' && enable_video.toLowerCase() === 'true'),
      enableAudio: !enable_audio ? true : Boolean(typeof enable_audio === 'string' && enable_audio.toLowerCase() === 'true'),
      maxVideoBitrate: Number(video_bitrate),
      maxShareBitrate: Number(share_bitrate),
      // eslint-disable-next-line @typescript-eslint/naming-convention
      useDummyDevice: Boolean(use_dummy_device && typeof use_dummy_device === 'string' && use_dummy_device.toLowerCase() === 'true'),
      signalingURL: SIGNALING_URL,
      videoCodec: videoCodec,
    };
    iframe.addEventListener(
      'error',
      async (e: ErrorEvent) => {
        setErrorMessage(e.message);

        let log = 'LSConfSample Log\n\n';
        log += `******************** Error Message ********************\n`;
        log += `${e.message}\n`;
        log += `******************** ApplicationLog *******************\n`;
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        log += `LSConfSample Version: v${require('../../../../frontend/package.json').version}\n`;
        log += `LSConfURL: ${LS_CONF_URL || 'default'}\n`;
        log += `LSClientID: ${LS_CLIENT_ID || 'unknown'}\n`;
        log += `SignalingURL: ${SIGNALING_URL || 'default'}\n`;
        log += `UserAgent: ${window.navigator.userAgent}\n`;
        log += `******************** LSConfLog ++++********************\n`;
        try {
          log += await iframe.getLSConfLog();
        } catch {
          // ログ取得失敗時は出力ファイルに追記しない
        }
        if (e.error && e.error.toReportString) {
          log += `******************** toReportString *******************\n`;
          log += `${e.error.toReportString}`;
        }

        const fileName = `ls-conf-sample_${format(new Date(), 'yyyyMMdd_HHmmss')}.log`;
        const downLoadLink = document.createElement('a');
        downLoadLink.download = fileName;
        downLoadLink.href = URL.createObjectURL(new Blob([log], { type: 'text.plain' }));
        downLoadLink.dataset.downloadurl = ['text/plain', downLoadLink.download, downLoadLink.href].join(':');
        downLoadLink.click();
      },
      { once: false }
    );
    iframe.addEventListener('connected', () => {
      console.log('connected event occurred');
    });
    iframe.addEventListener('disconnected', () => {
      console.log('disconnected event occurred');
    });
    iframe.addEventListener(
      'startRecording',
      async (e: CustomEvent) => {
        const targetSubview = e.detail.subView;
        console.log(`startRecording: subView: ${JSON.stringify(targetSubview)}`);
        try {
          await iframe.addRecordingMember(targetSubview, connectionId);
        } catch (e) {
          console.warn(`Failed to addRecordingMember in startRecording event. Detail: ${JSON.stringify(e.detail)}`);
        }
      },
      { once: false }
    );
    iframe.addEventListener(
      'stopRecording',
      async (e: CustomEvent) => {
        const targetSubview = e.detail.subView;
        console.log(`stopRecording: subView: ${JSON.stringify(targetSubview)}`);
        try {
          await iframe.removeRecordingMember(targetSubview, connectionId);
        } catch (e) {
          console.warn(`Failed to removeRecordingMember in stopRecording event. Detail: ${JSON.stringify(e.detail)}`);
        }
      },
      { once: false }
    );
    try {
      await iframe.join(LS_CLIENT_ID, accessToken, connectionId, connectOptions);
    } catch (e) {
      if (isDebug) {
        setErrorMessage(e.message);
        return;
      }
      window.close();
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
