// 共通の型定義置き場
import { Action } from 'redux';
import { ThunkAction } from 'redux-thunk';
// 現在 redux state には何も状態を持っていない
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface RootState {}
// 非同期 Action の型定義
// XXX(kdxu): thunk 定義をslice ごとに切り分けられたらそうするのが良さそう
export type RootThunk = ThunkAction<void, RootState, unknown, Action<string>>;
interface ToolbarConfig {
  isHidden: boolean;
  isHiddenCameraButton: boolean;
  isHiddenMicButton: boolean;
  isHiddenScreenShareButton: boolean;
  isHiddenParticipantsButton: boolean;
  isHiddenDeviceSettingButton: boolean;
  isHiddenExitButton: boolean;
}
interface LSConfSampleConfig {
  BACKEND_API_BASE: string;
  LS_CLIENT_ID: string;
  LS_CONF_URL?: string;
  LS_SIGNALING_URL: string;
  THETA_ZOOM_MAX_RANGE: number;
  IS_HIDDEN_VIDEO_MENU_BUTTON: boolean;
  IS_HIDDEN_RECORDING_BUTTON: boolean;
  DEFAULT_LAYOUT: string;
  TOOLBAR_CONFIG: ToolbarConfig;
  POD_COORDINATES?: {
    upperLeft: number[];
    lowerRight: number[];
  };
  THEME_CONFIG: {
    primary: string;
    background: string;
    surface: string;
    onPrimary: string;
    onSurface: string;
    textSecondaryOnBackground: string;
    components: {
      participantsVideoContainer: {
        background: string;
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
      };
    };
  };
}

// config.XXX  で各値を呼び出せるよう global 空間を拡張
declare global {
  const config: LSConfSampleConfig;
}
