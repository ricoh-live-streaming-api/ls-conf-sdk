// iframe を表示するページ
import './IframePage.css';

import format from 'date-fns/format';
import qs from 'query-string';
import React, { useLayoutEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

import { createAccessTokenSetting, fetchAccessToken } from '@/api';
import ErrorDialog from '@/components/ErrorDialog';
import { DEFAULT_LAYOUT, LS_CLIENT_ID, LS_CONF_URL, ROOM_CONFIG, SIGNALING_URL, SUBVIEW_CONFIG, THEME_CONFIG, THETA_ZOOM_MAX_RANGE, TOOLBAR_CONFIG } from '@/constants';
import LSConferenceIframe, { ConnectOptions, CreateParameters, LSConfError, LSConfErrorEvent } from '@/lib/ls-conf-sdk';

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
  const {
    username,
    video_bitrate,
    share_bitrate,
    default_layout,
    enable_video,
    enable_audio,
    audio_mute_type,
    use_dummy_device,
    bitrate_reservation_mbps,
    room_type,
    video_codec,
    max_connections,
    ice_servers_protocol,
  } = qs.parse(window.location.search);
  const { roomId } = useParams<{ roomId: string }>();
  const iframeContainerRef = useRef<HTMLDivElement>(null);
  const [lsConfIframe, setLsConfIframe] = useState<LSConferenceIframe | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  // ダイアログで表示中のダミーデバイス変更通知のデバイス種別
  const showingDummyDeviceTypes = useRef<string[]>([]);
  // logイベントから受け取ったLSConfLogの保持用変数
  const logEvent = useRef(new Map<string, { date: number; log: string }[]>());
  const showErrorDialog = errorMessage !== null;
  const connectionId: string = uuidv4();
  const audioMuteType = audio_mute_type && (audio_mute_type === 'soft' || audio_mute_type === 'hard') ? audio_mute_type : undefined;
  let isUseDummyDevice = Boolean(use_dummy_device && typeof use_dummy_device === 'string' && use_dummy_device.toLowerCase() === 'true');
  const videoCodec = video_codec && (video_codec === 'h264' || video_codec === 'vp8' || video_codec === 'vp9' || video_codec === 'h265' || video_codec === 'av1') ? video_codec : undefined;
  const iceServersProtocol =
    ice_servers_protocol && (ice_servers_protocol === 'all' || ice_servers_protocol === 'udp' || ice_servers_protocol === 'tcp' || ice_servers_protocol === 'tls') ? ice_servers_protocol : undefined;
  const downloadLog = async (iframe: LSConferenceIframe, e?: LSConfError | LSConfErrorEvent): Promise<void> => {
    let log = 'LSConfSample Log\n\n';
    if (e instanceof LSConfError) {
      log += `********** Error Message **********\n`;
      log += `${e.message}\n`;
      log += `********** toReportString() *******\n`;
      log += `${e.toReportString()}\n`;
    } else if (e instanceof LSConfErrorEvent) {
      log += `********** Error Message **********\n`;
      log += `${e.message}\n`;
      log += `********** toReportString() *******\n`;
      log += `${e.error.toReportString()}\n`;
    }
    log += `********** ApplicationLog *********\n`;
    log += `LSConfURL: ${LS_CONF_URL != null && LS_CONF_URL != '' ? LS_CONF_URL : 'default'}\n`;
    log += `LSClientID: ${LS_CLIENT_ID || 'unknown'}\n`;
    log += `SignalingURL: ${SIGNALING_URL || 'default'}\n`;
    log += `UserAgent: ${window.navigator.userAgent}\n\n`;
    log += `********** LSConfLog **************\n`;
    if (e instanceof LSConfErrorEvent && Math.floor(e.error.detail.code / 1000) == 5) {
      // InternalError（5000番台）の場合は内部に保持したログを出力する
      log += `An unexpected error occurs. Output logs by LogEvent. \n\n`;
      log += getStoredLSConfLog();
    } else {
      try {
        const lsConfLog = await iframe.getLSConfLog();
        if (lsConfLog === null || lsConfLog === undefined || lsConfLog == '') {
          // LSConfLogが空の場合は内部に保持したログを出力する
          log += `Result of getLSConfLog is blank. Output logs by LogEvent. \n\n`;
          log += getStoredLSConfLog();
        } else {
          log += `${lsConfLog}\n`;
        }
      } catch {
        // LSConfLogの取得に失敗した場合は内部に保持したログを出力する
        log += `Failed to getLSConfLog. Output logs by LogEvent. \n\n`;
        log += getStoredLSConfLog();
      }
    }
    const downLoadLink = document.createElement('a');
    downLoadLink.download = `ls-conf-sample_${format(new Date(), 'yyyyMMdd_HHmmss')}.log`;
    downLoadLink.href = URL.createObjectURL(new Blob([log], { type: 'text.plain' }));
    downLoadLink.dataset.downloadurl = ['text/plain', downLoadLink.download, downLoadLink.href].join(':');
    downLoadLink.click();
  };
  const downloadStats = async (iframe: LSConferenceIframe): Promise<void> => {
    let log = 'LSConfSample Stats\n\n';
    try {
      const subViews = await iframe.getSubViews();
      for (const subView of subViews) {
        try {
          log += `********** ${subView.connectionId} **********\n`;
          const stats = await iframe.getStats(subView);
          // JSON文字列の可読性向上のため、一度JSONオブジェクトに戻して整形しなおす
          log += `${JSON.stringify(JSON.parse(stats), null, '\t')}\n`;
        } catch {
          log += 'Failed to getStats.\n';
        }
      }
    } catch {
      log += 'Failed to getSubViews.\n';
    }
    const downLoadLink = document.createElement('a');
    downLoadLink.download = `ls-conf-sample_stats_${format(new Date(), 'yyyyMMdd_HHmmss')}.log`;
    downLoadLink.href = URL.createObjectURL(new Blob([log], { type: 'text.plain' }));
    downLoadLink.dataset.downloadurl = ['text/plain', downLoadLink.download, downLoadLink.href].join(':');
    downLoadLink.click();
  };
  const getStoredLSConfLog = (): string => {
    let log = '';
    const categories = ['Environment', 'Setting', 'Recording', 'Device', 'Member', 'Analysis', 'ClientSdk'];
    for (const category of categories) {
      log += `******************** ${category} **********************\n`;
      const categoryLogs = logEvent.current.get(category.charAt(0).toLowerCase() + category.slice(1));
      if (categoryLogs) {
        log += categoryLogs.map((item) => item.log).join('\n') + '\n';
      }
    }
    return log;
  };
  /**
   * 処理の一時停止
   * @param time 停止する時間(ms)
   */
  const sleep = async (time: number): Promise<void> => {
    return new Promise((resolve) => window.setTimeout(resolve, time));
  };
  const createAndConnectRoom = async (): Promise<void> => {
    if (!username || !roomId || typeof username !== 'string') {
      setErrorMessage('入室パラメータが不正です');
      return;
    }
    if (!iframeContainerRef.current) {
      setErrorMessage('iframeContainerが不正です');
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
      if (e instanceof LSConfError) {
        setErrorMessage(e.message);
      } else {
        setErrorMessage(`Unexpected error occurred: ${e}`);
      }
      return;
    }
    iframe.onShareRequested(async () => {
      let screenShareAccessToken;
      const screenShareConnectionId = uuidv4();
      try {
        const accessTokenSetting = createAccessTokenSetting(roomId, screenShareConnectionId, bitrate_reservation_mbps, room_type, max_connections);
        screenShareAccessToken = await fetchAccessToken(accessTokenSetting);
      } catch (e) {
        if (e instanceof Error) {
          setErrorMessage(`アクセストークンの取得に失敗しました: ${e.message}`);
        } else {
          setErrorMessage(`Unexpected error occurred: ${e}`);
        }
        return;
      }
      return screenShareAccessToken;
    });
    const connectOptions: ConnectOptions = {
      username: username,
      enableVideo: !enable_video ? false : Boolean(typeof enable_video === 'string' && enable_video.toLowerCase() === 'true'),
      enableAudio: !enable_audio ? true : Boolean(typeof enable_audio === 'string' && enable_audio.toLowerCase() === 'true'),
      audioMuteType: audioMuteType,
      maxVideoBitrate: Number(video_bitrate),
      maxShareBitrate: Number(share_bitrate),
      // eslint-disable-next-line @typescript-eslint/naming-convention
      useDummyDevice: isUseDummyDevice,
      signalingURL: SIGNALING_URL,
      videoCodec: videoCodec,
      iceServersProtocol,
    };
    iframe.addEventListener('error', async (e: LSConfErrorEvent) => {
      setErrorMessage(e.message);
      try {
        await downloadLog(iframe, e);
      } catch {
        console.warn('Failed to download log.');
      }
    });
    iframe.addEventListener('connected', () => {
      console.log('connected event occurred');
    });
    iframe.addEventListener('disconnected', () => {
      console.log('disconnected event occurred');
    });
    iframe.addEventListener('startRecording', async (e: CustomEvent) => {
      const targetSubview = e.detail.subView;
      console.log(`startRecording: subView: ${JSON.stringify(targetSubview)}`);
      try {
        await iframe.addRecordingMember(targetSubview, connectionId);
      } catch (e) {
        if (e instanceof LSConfError) {
          console.warn(`Failed to addRecordingMember in startRecording event. Detail: ${JSON.stringify(e.detail)}`);
        } else {
          console.warn(`Unexpected error occurred: ${e}`);
        }
      }
    });
    iframe.addEventListener('stopRecording', async (e: CustomEvent) => {
      const targetSubview = e.detail.subView;
      console.log(`stopRecording: subView: ${JSON.stringify(targetSubview)}`);
      try {
        await iframe.removeRecordingMember(targetSubview, connectionId);
      } catch (e) {
        if (e instanceof LSConfError) {
          console.warn(`Failed to removeRecordingMember in stopRecording event. Detail: ${JSON.stringify(e.detail)}`);
        } else {
          console.warn(`Unexpected error occurred: ${e}`);
        }
      }
    });
    iframe.addEventListener('mediaDeviceChanged', async (e: CustomEvent) => {
      // ダミーデバイスに切り替わった場合はダイアログを表示する
      if (e.detail.deviceId === 'dummy-device') {
        const deviceTypeName = e.detail.kind === 'videoinput' ? 'カメラ' : e.detail.kind === 'audioinput' ? 'マイク' : 'スピーカー';
        if (!showingDummyDeviceTypes.current.some((deviceType) => deviceType === deviceTypeName)) {
          showingDummyDeviceTypes.current.push(deviceTypeName);
        }
        const deviceTypeNames = showingDummyDeviceTypes.current.join('と');
        setErrorMessage(`${deviceTypeNames}が接続されていません。${deviceTypeNames}を接続し直し、デバイス設定ダイアログから再度${deviceTypeNames}を設定してください。`);
      }
      console.log(`mediaDeviceChanged: ${JSON.stringify(e.detail)}`);
    });
    // ls-conf-sdkのlogイベントが発生した場合はログを保持する
    iframe.addEventListener('log', (e: CustomEvent) => {
      const { message, category, subcategory, date } = e.detail;
      const logs = logEvent.current.get(category) || [];
      const log = `[${date}]${subcategory ? '[' + subcategory + ']' : ''} ${message}`;
      logs.push({ date: new Date(date).getTime(), log });
      const updateLogs = logs.filter((log) => {
        // 直近10分経過したログを削除する(ログは溜まり続けるためメモリを圧迫させないように適宜削除する)
        return Date.now() - log.date < 1000 * 60 * 10;
      });
      logEvent.current.set(category, updateLogs);
    });
    // ツールバーのダウンロードボタンを押した場合はログをダウンロードする
    iframe.addApplicationEventListener('log', async () => {
      try {
        await downloadLog(iframe);
        // TODO(okada): Mobile Safari において複数のファイルをダウンロードに失敗することを避けるため、ダウンロードの間隔を空ける
        // 複数ファイルをダウンロードさせる場合は 1 ファイルに圧縮することを検討する
        await sleep(200);
        await downloadStats(iframe);
      } catch {
        console.warn('Failed to download log.');
      }
    });
    try {
      if (!isUseDummyDevice) {
        // join APIの実行中にデバイスアクセス許可ダイアログが表示されてJoinTimeoutが発生することを防ぐため、
        // 事前にデバイスのアクセス許可を取得してからAccessTokenの生成とjoin APIの実行を行う
        // Safariは60秒経過でデバイスのアクセス許可が取り消されるため、この処理から60秒以内にjoin APIを実行すること
        await iframe.getMediaDevices();
      }
    } catch (e) {
      // ダミーデバイスでの入室に切り替える
      isUseDummyDevice = true;
      if (e instanceof LSConfError) {
        console.warn(`Failed to getMediaDevices. Join with dummy device. error: ${JSON.stringify(e.detail)}`);
      } else {
        console.warn(`Unexpected error occurred: ${e}`);
      }
    }
    let accessToken;
    try {
      const accessTokenSetting = createAccessTokenSetting(roomId, connectionId, bitrate_reservation_mbps, room_type, max_connections);
      accessToken = await fetchAccessToken(accessTokenSetting);
    } catch (e) {
      if (e instanceof Error) {
        setErrorMessage(`アクセストークンの取得に失敗しました: ${e.message}`);
      } else {
        setErrorMessage(`Unexpected error occurred: ${e}`);
      }
      return;
    }
    try {
      await iframe.join(LS_CLIENT_ID, accessToken, connectOptions);
    } catch (e) {
      if (e instanceof LSConfError) {
        if (e.detail.code === 4120) {
          setErrorMessage('デバイスの取得に失敗したため、カメラとマイクを使用せずに参加します。マイクデバイスへのアクセス許可がない場合、スピーカーから音が出ない場合があります。');
        } else {
          setErrorMessage(e.message);
          try {
            await downloadLog(iframe, e);
          } catch {
            console.warn('Failed to download log.');
          }
        }
      } else {
        setErrorMessage(`Unexpected error occurred: ${e}`);
      }
      return;
    }
    setLsConfIframe(iframe);
  };
  const onCloseErrorDialog = (): void => {
    showingDummyDeviceTypes.current = [];
    setErrorMessage(null);
  };
  useLayoutEffect(() => {
    void createAndConnectRoom();
    return () => {
      if (lsConfIframe) {
        void lsConfIframe.leave();
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
