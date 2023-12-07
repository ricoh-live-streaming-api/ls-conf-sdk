// 共通の型定義置き場
import { Action } from 'redux';
import { ThunkAction } from 'redux-thunk';
// 現在 redux state には何も状態を持っていない
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface RootState {}
// 非同期 Action の型定義
// XXX(kdxu): thunk 定義をslice ごとに切り分けられたらそうするのが良さそう
export type RootThunk = ThunkAction<void, RootState, unknown, Action<string>>;
// Access Token 取得設定の型定義
export type AccessTokenSetting = {
  connection_id: string;
  room_id: string;
  room_spec: {
    type: string;
    max_connections?: number;
    media_control?: {
      bitrate_reservation_mbps?: number;
    };
  };
};

interface ToolbarItem {
  type: string;
  iconName: string;
}

interface SubViewMenuItem {
  type: string;
  label: string;
  targetSubView?: {
    type?: 'VIDEO_AUDIO' | 'SCREEN_SHARE' | 'VIDEO_FILE';
    isTheta?: boolean;
  };
}

interface ToolbarConfig {
  isHidden: boolean;
  isHiddenCameraButton: boolean;
  isHiddenMicButton: boolean;
  isHiddenScreenShareButton: boolean;
  isHiddenParticipantsButton: boolean;
  isHiddenDeviceSettingButton: boolean;
  isHiddenExitButton: boolean;
  customItems: ToolbarItem[];
}
interface LSConfSampleConfig {
  BACKEND_API_BASE: string;
  LS_CLIENT_ID: string;
  LS_CONF_URL?: string;
  LS_SIGNALING_URL: string;
  THETA_ZOOM_MAX_RANGE: number;
  DEFAULT_LAYOUT: string;
  TOOLBAR_CONFIG: ToolbarConfig;
  SUBVIEW_CONFIG: {
    isHiddenDrawingButton: boolean;
    drawingInterval: number;
    drawingColor: string;
    drawingOption: {
      size: number;
    };
    theta: {
      enableZenithCorrection: boolean;
    };
    enableAutoVideoReceiving: boolean;
    normal: {
      enableZoom: boolean;
    };
    menu: {
      isHidden: boolean;
      isHiddenRecordingButton: boolean;
      isHiddenSharePoVButton: boolean;
      customItems: SubViewMenuItem[];
    };
  };
  POD_COORDINATES?: {
    upperLeft: number[];
    lowerRight: number[];
  };
  THEME_CONFIG: {
    primary: string;
    background: string;
    surface: string;
    onPrimary: string;
    primaryTextColor: string;
    secondaryTextColor: string;
    disabledTextColor: string;
    components: {
      participantsVideoContainer: {
        background: string;
        subViewSwitchBackgroundColor: string;
        subViewSwitchIconColor: string;
      };
      toolbar: {
        background: string;
        iconColor: string;
      };
      video: {
        background: string;
        textColor: string;
        textBackgroundColor: string;
        iconColor: string;
        menuBackgroundColor: string;
        menuTextColor: string;
        highlightBorderColor: string;
        highlightShadowColor: string;
      };
    };
  };
  ROOM_CONFIG: {
    entranceScreen: string;
  };
}

// config.XXX  で各値を呼び出せるよう global 空間を拡張
declare global {
  const config: LSConfSampleConfig;
}
