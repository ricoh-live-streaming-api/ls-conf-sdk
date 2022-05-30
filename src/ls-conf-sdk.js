/**
 * ls-conf-sdk
 * ls-conf-sdk
 * @version: 3.0.1
 **/

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.LSConferenceIframe = factory());
}(this, (function () { 'use strict';

  // LSConfの規定のイベント
  class LSConfEvent {
      constructor(type, eventInit) {
          this.type = type;
          if (type === 'error') {
              this.event = new ErrorEvent(type, eventInit);
          }
          else if (eventInit) {
              this.event = new CustomEvent(type, eventInit);
          }
          else {
              this.event = new Event(type);
          }
      }
  }
  // ls-conf-sdk のバージョン
  const LS_CONF_SDK_VERSION = '3.0.1';
  const DEFAULT_LS_CONF_URL = `https://conf.livestreaming.mw.smart-integration.ricoh.com/${LS_CONF_SDK_VERSION}/index.html`;
  const DEFAULT_SIGNALING_URL = 'wss://signaling.livestreaming.mw.smart-integration.ricoh.com/v1/room';
  const DEFAULT_MAX_BITRATE = 2000;
  const DEFAULT_USE_DUMMY_DEVICE = false;
  const DEFAULT_VIDEO_CODEC = 'h264';
  const DEFAULT_CREATE_TIMEOUT_MSEC = 15000;
  const DEFAULT_JOIN_TIMEOUT_MSEC = 10000;
  const DEFAULT_MODE = 'normal';
  const REQUEST_ERRORS = {
      CreateArgsInvalid: {
          code: 4010,
          type: 'RequestError',
          error: 'CreateArgsInvalid',
      },
      JoinArgsInvalid: {
          code: 4020,
          type: 'RequestError',
          error: 'JoinArgsInvalid',
      },
      SetArgsInvalid: {
          code: 4030,
          type: 'RequestError',
          error: 'SetArgsInvalid',
      },
      CreateFailed: {
          code: 4040,
          type: 'RequestError',
          error: 'CreateFailed',
      },
      CreateTimeout: {
          code: 4041,
          type: 'RequestError',
          error: 'CreateTimeout',
      },
      JoinFailed: {
          code: 4050,
          type: 'RequestError',
          error: 'JoinFailed',
      },
      JoinFailedTimeout: {
          code: 4051,
          type: 'RequestError',
          error: 'JoinFailedTimeout',
      },
      CloseFailed: {
          code: 4060,
          type: 'RequestError',
          error: 'CloseFailed',
      },
      CameraMuteFailed: {
          code: 4070,
          type: 'RequestError',
          error: 'CameraMuteFailed',
      },
      MicMuteFailed: {
          code: 4080,
          type: 'RequestError',
          error: 'MicMuteFailed',
      },
      ShareRequestFailed: {
          code: 4090,
          type: 'RequestError',
          error: 'ShareRequestFailed',
      },
      GetReportFailed: {
          code: 4100,
          type: 'RequestError',
          error: 'GetReportFailed',
      },
      GetReportError: {
          code: 4101,
          type: 'RequestError',
          error: 'GetReportError',
      },
      ChangeLayoutFailed: {
          code: 4110,
          type: 'RequestError',
          error: 'ChangeLayoutFailed',
      },
      GetDeviceFailed: {
          code: 4120,
          type: 'RequestError',
          error: 'GetDeviceFailed',
      },
      GetSubViewsFailed: {
          code: 4130,
          type: 'RequestError',
          error: 'GetSubViewsFailed',
      },
      GetSubViewsError: {
          code: 4131,
          type: 'RequestError',
          error: 'GetSubViewsError',
      },
      GetPoVFailed: {
          code: 4140,
          type: 'RequestError',
          error: 'GetPoVFailed',
      },
      GetPoVError: {
          code: 4141,
          type: 'RequestError',
          error: 'GetPoVError',
      },
      GetPoVArgsInvalid: {
          code: 4150,
          type: 'RequestError',
          error: 'GetPoVArgsInvalid',
      },
      SetPoVFailed: {
          code: 4160,
          type: 'RequestError',
          error: 'SetPoVFailed',
      },
      SetPoVError: {
          code: 4161,
          type: 'RequestError',
          error: 'SetPoVError',
      },
      SetPoVArgsInvalid: {
          code: 4170,
          type: 'RequestError',
          error: 'SetPoVArgsInvalid',
      },
      ShareRequestArgsInvalid: {
          code: 4180,
          type: 'RequestError',
          error: 'ShareRequestArgsInvalid',
      },
      HighlightArgsInvalid: {
          code: 4190,
          type: 'RequestError',
          error: 'HighlightArgsInvalid',
      },
      HighlightFailed: {
          code: 4200,
          type: 'RequestError',
          error: 'HighlightFailed',
      },
      HighlightError: {
          code: 4210,
          type: 'RequestError',
          error: 'HighlightError',
      },
      AddRecordingMemberArgsInvalid: {
          code: 4220,
          type: 'RequestError',
          error: 'AddRecordingMemberArgsInvalid',
      },
      AddRecordingMemberFailed: {
          code: 4230,
          type: 'RequestError',
          error: 'AddRecordingMemberFailed',
      },
      AddRecordingMemberError: {
          code: 4240,
          type: 'RequestError',
          error: 'AddRecordingMemberError',
      },
      RemoveRecordingMemberArgsInvalid: {
          code: 4250,
          type: 'RequestError',
          error: 'RemoveRecordingMemberArgsInvalid',
      },
      RemoveRecordingMemberFailed: {
          code: 4260,
          type: 'RequestError',
          error: 'RemoveRecordingMemberFailed',
      },
      RemoveRecordingMemberError: {
          code: 4270,
          type: 'RequestError',
          error: 'RemoveRecordingMemberError',
      },
      SetCameraDeviceFailed: {
          code: 4280,
          type: 'RequestError',
          error: 'SetCameraDeviceFailed',
      },
      SetMicDeviceFailed: {
          code: 4290,
          type: 'RequestError',
          error: 'SetMicDeviceFailed',
      },
      GetMediaDevicesFailed: {
          code: 4300,
          type: 'RequestError',
          error: 'GetMediaDevicesFailed',
      },
      GetMediaDevicesError: {
          code: 4310,
          type: 'RequestError',
          error: 'GetMediaDevicesError',
      },
      GetCaptureImageFailed: {
          code: 4320,
          type: 'RequestError',
          error: 'GetCaptureImageFailed',
      },
      GetCaptureImageError: {
          code: 4330,
          type: 'RequestError',
          error: 'GetCaptureImageError',
      },
      GetCaptureImageErrorCameraMuted: {
          code: 4331,
          type: 'RequestError',
          error: 'GetCaptureImageErrorCameraMuted',
      },
      GetCaptureImageArgsInvalid: {
          code: 4340,
          type: 'RequestError',
          error: 'GetCaptureImageArgsInvalid',
      },
      StartRecordingFailed: {
          code: 4350,
          type: 'RequestError',
          error: 'StartRecordingFailed',
      },
      StartReceiveVideoFailed: {
          code: 4360,
          type: 'RequestError',
          error: 'StartReceiveVideoFailed',
      },
      StartReceiveVideoError: {
          code: 4370,
          type: 'RequestError',
          error: 'StartReceiveVideoError',
      },
      StartReceiveVideoArgsInvalid: {
          code: 4380,
          type: 'RequestError',
          error: 'StartReceiveVideoArgsInvalid',
      },
      StopReceiveVideoFailed: {
          code: 4390,
          type: 'RequestError',
          error: 'StopReceiveVideoFailed',
      },
      StopReceiveVideoError: {
          code: 4400,
          type: 'RequestError',
          error: 'StopReceiveVideoError',
      },
      StopReceiveVideoArgsInvalid: {
          code: 4410,
          type: 'RequestError',
          error: 'StopReceiveVideoArgsInvalid',
      },
      GetLSConfLogFailed: {
          code: 4420,
          type: 'RequestError',
          error: 'GetLSConfLogFailed',
      },
      GetLSConfLogError: {
          code: 4430,
          type: 'RequestError',
          error: 'GetLSConfLogError',
      },
      EnablePointerFailed: {
          code: 4440,
          type: 'RequestError',
          error: 'EnablePointerFailed',
      },
      UpdatePointerArgsInvalid: {
          code: 4450,
          type: 'RequestError',
          error: 'UpdatePointerArgsInvalid',
      },
      UpdatePointerFailed: {
          code: 4460,
          type: 'RequestError',
          error: 'UpdatePointerFailed',
      },
      UpdatePointerError: {
          code: 4470,
          type: 'RequestError',
          error: 'UpdatePointerError',
      },
      ModeInvalid: {
          code: 4480,
          type: 'RequestError',
          error: 'ModeInvalid',
      },
      ChangeLayoutArgsInvalid: {
          code: 4490,
          type: 'RequestError',
          error: 'ChangeLayoutArgsInvalid',
      },
  };
  const INTERNAL_ERRORS = {
      InternalError5001: {
          code: 5001,
          type: 'InternalError',
          error: 'InternalError5001',
      },
      InternalError5002: {
          code: 5002,
          type: 'InternalError',
          error: 'InternalError5002',
      },
  };
  class LSConferenceIframeError extends Error {
      constructor(errorDetail) {
          super(errorDetail.error);
          this.detail = errorDetail;
      }
  }
  class LSConferenceIframe {
      constructor(parentElement) {
          this.logCallbacks = new Map();
          this.parentElement = parentElement;
          this.iframeElement = document.createElement('iframe');
          this.lsConfURL = DEFAULT_LS_CONF_URL;
          this.iframeElement.src = DEFAULT_LS_CONF_URL;
          this.clientId = null;
          this.connectOptions = null;
          this.state = 'idle';
          this.shareRequestedCallback = () => { };
          this.joinCallback = { success: () => { }, error: () => { }, accepted: () => { } };
          this.getSubViewsCallback = { success: () => { }, error: () => { } };
          this.highlightCallback = { success: () => { }, error: () => { } };
          this.getPoVCallback = { success: () => { }, error: () => { } };
          this.setPoVCallback = { success: () => { }, error: () => { } };
          this.addRecordingMemberCallback = { success: () => { }, error: () => { } };
          this.removeRecordingMemberCallback = { success: () => { }, error: () => { } };
          this.getMediaDevicesCallback = { success: () => { }, error: () => { } };
          this.updatePointerCallback = { success: () => { }, error: () => { } };
          this.getCaptureImageCallback = { success: () => { }, error: () => { } };
          this.getLSConfLogCallback = { success: () => { }, error: () => { } };
          this.startReceiveVideoCallback = { success: () => { }, error: () => { } };
          this.stopReceiveVideoCallback = { success: () => { }, error: () => { } };
          this.eventListeners = new Map();
          this.applicationEventListeners = new Map();
      }
      setWindowMessageCallback() {
          window.addEventListener('message', async (event) => {
              const data = event.data;
              if (!this.iframeElement.contentWindow) {
                  throw new LSConferenceIframeError(INTERNAL_ERRORS['InternalError5001']);
              }
              if (data.type === 'shareRequest' && this.connectOptions) {
                  let shareParams = undefined;
                  try {
                      shareParams = await this.shareRequestedCallback();
                  }
                  catch (e) {
                      console.warn('Exception occurred in onShareRequested.', e);
                  }
                  if (!shareParams || !this.validateScreenShareParameters(shareParams)) {
                      const error = new LSConferenceIframeError(REQUEST_ERRORS['ShareRequestArgsInvalid']);
                      this.dispatchEvent(new LSConfEvent('error', error));
                      throw error;
                  }
                  // screen share の role, mediaType は固定
                  const postMessageParameters = {
                      type: 'connectShare',
                      clientId: this.clientId,
                      accessToken: shareParams.accessToken,
                      connectionId: shareParams.connectionId,
                      role: 'sendonly',
                      mediaType: 'screenshare',
                      connectOptions: this.connectOptions,
                  };
                  if (!this.iframeElement.contentWindow) {
                      throw new LSConferenceIframeError(INTERNAL_ERRORS['InternalError5001']);
                  }
                  try {
                      this.iframeElement.contentWindow.postMessage(postMessageParameters, this.lsConfURL);
                  }
                  catch (e) {
                      const error = new LSConferenceIframeError(REQUEST_ERRORS['ShareRequestFailed']);
                      this.dispatchEvent(new LSConfEvent('error', error));
                      throw error;
                  }
              }
              else if (data.type === 'log') {
                  const callback = this.logCallbacks.get(data.logType);
                  if (callback) {
                      if (data.error) {
                          const error = new LSConferenceIframeError(REQUEST_ERRORS['GetReportError']);
                          callback.error(error);
                      }
                      else {
                          callback.success(data.log);
                      }
                      this.logCallbacks.delete(data.logType);
                  }
              }
              else if (data.type === 'recording') {
                  if (data.error) {
                      throw new LSConferenceIframeError(INTERNAL_ERRORS['InternalError5002']);
                  }
              }
              else if (data.type === 'startRecording') {
                  if (data.error) {
                      const error = new LSConferenceIframeError(REQUEST_ERRORS['StartRecordingFailed']);
                      const eventInitDict = {
                          error: error,
                          message: `code: ${error.detail.code}, type: ${error.detail.type}, error: ${error.detail.error}, description: ${data.error}`,
                      };
                      this.dispatchEvent(new LSConfEvent('error', eventInitDict));
                  }
                  else {
                      this.dispatchEvent(new LSConfEvent('startRecording', { detail: { subView: data.subView } }));
                  }
              }
              else if (data.type === 'stopRecording') {
                  this.dispatchEvent(new LSConfEvent('stopRecording', { detail: { subView: data.subView } }));
              }
              else if (data.type === 'addRecordingMember') {
                  if (data.error) {
                      const error = new LSConferenceIframeError(REQUEST_ERRORS['AddRecordingMemberError']);
                      this.addRecordingMemberCallback.error(error);
                  }
                  else {
                      this.addRecordingMemberCallback.success();
                  }
              }
              else if (data.type === 'removeRecordingMember') {
                  if (data.error) {
                      const error = new LSConferenceIframeError(REQUEST_ERRORS['RemoveRecordingMemberError']);
                      this.removeRecordingMemberCallback.error(error);
                  }
                  else {
                      this.removeRecordingMemberCallback.success();
                  }
              }
              else if (data.type === 'connected') {
                  if (data.error) {
                      this.state = 'created';
                      const error = new LSConferenceIframeError(REQUEST_ERRORS['JoinFailed']);
                      this.joinCallback.error(error);
                  }
                  else {
                      this.state = 'open';
                      this.joinCallback.success();
                  }
                  this.dispatchEvent(new LSConfEvent('connected'));
              }
              else if (data.type === 'connectCanceled') {
                  this.state = 'created';
              }
              else if (data.type === 'connectAccepted') {
                  if (data.error) {
                      this.state = 'created';
                      const error = new LSConferenceIframeError(REQUEST_ERRORS['JoinFailed']);
                      this.joinCallback.error(error);
                  }
                  else {
                      this.joinCallback.accepted();
                  }
              }
              else if (data.type === 'disconnected') {
                  this.state = 'created';
                  this.dispatchEvent(new LSConfEvent('disconnected'));
              }
              else if (data.type === 'screenShareConnected') {
                  this.dispatchEvent(new LSConfEvent('screenShareConnected'));
              }
              else if (data.type === 'screenShareDisconnected') {
                  this.dispatchEvent(new LSConfEvent('screenShareDisconnected'));
              }
              else if (data.type === 'remoteConnectionAdded') {
                  const event = new LSConfEvent('remoteConnectionAdded', {
                      detail: {
                          connectionId: data.connectionId,
                          username: data.username,
                          mediaType: data.mediaType,
                          parentConnectionId: data.parentConnectionId,
                      },
                  });
                  this.dispatchEvent(event);
              }
              else if (data.type === 'remoteConnectionRemoved') {
                  const event = new LSConfEvent('remoteConnectionRemoved', {
                      detail: {
                          connectionId: data.connectionId,
                          username: data.username,
                          mediaType: data.mediaType,
                          parentConnectionId: data.parentConnectionId,
                      },
                  });
                  this.dispatchEvent(event);
              }
              else if (data.type === 'remoteTrackAdded') {
                  const event = new LSConfEvent('remoteTrackAdded', {
                      detail: {
                          subView: data.subView,
                          kind: data.kind,
                      },
                  });
                  this.dispatchEvent(event);
              }
              else if (data.type === 'getDeviceFailed') {
                  const error = new LSConferenceIframeError(REQUEST_ERRORS['GetDeviceFailed']);
                  this.dispatchEvent(new LSConfEvent('error', error));
              }
              else if (data.type === 'getSubViews') {
                  if (data.error) {
                      const error = new LSConferenceIframeError(REQUEST_ERRORS['GetSubViewsError']);
                      this.getSubViewsCallback.error(error);
                  }
                  else {
                      this.getSubViewsCallback.success(data.subViews);
                  }
              }
              else if (data.type === 'highlight') {
                  if (data.error) {
                      const error = new LSConferenceIframeError(REQUEST_ERRORS['HighlightError']);
                      this.highlightCallback.error(error);
                  }
                  else {
                      this.highlightCallback.success();
                  }
              }
              else if (data.type === 'sharePoV') {
                  const { subView, poV } = data;
                  this.dispatchEvent(new LSConfEvent('sharePoV', { detail: { subView, poV } }));
              }
              else if (data.type === 'getPoV') {
                  if (data.error) {
                      const error = new LSConferenceIframeError(REQUEST_ERRORS['GetPoVError']);
                      this.getPoVCallback.error(error);
                  }
                  else {
                      this.getPoVCallback.success(data.poV);
                  }
              }
              else if (data.type === 'setPoV') {
                  if (data.error) {
                      const error = new LSConferenceIframeError(REQUEST_ERRORS['SetPoVError']);
                      this.setPoVCallback.error(error);
                  }
                  else {
                      this.setPoVCallback.success();
                  }
              }
              else if (data.type === 'getMediaDevices') {
                  if (data.error) {
                      const error = new LSConferenceIframeError(REQUEST_ERRORS['GetMediaDevicesError']);
                      this.getMediaDevicesCallback.error(error);
                  }
                  else {
                      this.getMediaDevicesCallback.success(data.devices);
                  }
              }
              else if (data.type === 'updatePointer') {
                  if (data.error) {
                      const error = new LSConferenceIframeError(REQUEST_ERRORS['UpdatePointerError']);
                      this.updatePointerCallback.error(error);
                  }
                  else {
                      this.updatePointerCallback.success();
                  }
              }
              else if (data.type === 'getCaptureImage') {
                  if (data.error) {
                      if (data.errorType === 'GetCaptureImageErrorCameraMuted') {
                          const error = new LSConferenceIframeError(REQUEST_ERRORS['GetCaptureImageErrorCameraMuted']);
                          this.getCaptureImageCallback.error(error);
                      }
                      else {
                          const error = new LSConferenceIframeError(REQUEST_ERRORS['GetCaptureImageError']);
                          this.getCaptureImageCallback.error(error);
                      }
                  }
                  else {
                      this.getCaptureImageCallback.success(data.blob);
                  }
              }
              else if (data.type === 'applicationEvent') {
                  this.dispatchApplicationEvent(new CustomEvent(data.eventId, { detail: data.args }));
              }
              else if (data.type === 'getLSConfLog') {
                  if (data.error) {
                      const error = new LSConferenceIframeError(REQUEST_ERRORS['GetLSConfLogError']);
                      this.getLSConfLogCallback.error(error);
                  }
                  else {
                      this.getLSConfLogCallback.success(data.lsConfLog);
                  }
              }
              else if (data.type === 'startReceiveVideo') {
                  if (data.error) {
                      const error = new LSConferenceIframeError(REQUEST_ERRORS['StartReceiveVideoError']);
                      this.startReceiveVideoCallback.error(error);
                  }
                  else {
                      this.startReceiveVideoCallback.success();
                  }
              }
              else if (data.type === 'stopReceiveVideo') {
                  if (data.error) {
                      const error = new LSConferenceIframeError(REQUEST_ERRORS['StopReceiveVideoError']);
                      this.stopReceiveVideoCallback.error(error);
                  }
                  else {
                      this.stopReceiveVideoCallback.success();
                  }
              }
              else if (data.type === 'error' && data.error) {
                  const eventInitDict = {
                      error: data.error,
                      message: `code: ${data.error.detail.code}, type: ${data.error.detail.type}, error: ${data.error.detail.error}`,
                  };
                  if (this.state === 'connecting') {
                      this.state = 'created';
                      this.joinCallback.error(new LSConferenceIframeError(REQUEST_ERRORS['JoinFailed']));
                  }
                  this.dispatchEvent(new LSConfEvent('error', eventInitDict));
              }
          });
      }
      validateCreateParameters(parameters) {
          if (parameters.thetaZoomMaxRange && typeof parameters.thetaZoomMaxRange !== 'number') {
              return false;
          }
          if (parameters.defaultLayout !== undefined && parameters.defaultLayout !== 'gallery' && parameters.defaultLayout !== 'presentation' && parameters.defaultLayout !== 'fullscreen') {
              return false;
          }
          if (parameters.room !== undefined) {
              if (typeof parameters.room.entranceScreen !== undefined && parameters.room.entranceScreen !== 'none' && parameters.room.entranceScreen !== 'click') {
                  return false;
              }
          }
          if (parameters.toolbar !== undefined) {
              if (typeof parameters.toolbar !== 'object') {
                  return false;
              }
              if (parameters.toolbar.isHidden !== undefined && typeof parameters.toolbar.isHidden !== 'boolean') {
                  return false;
              }
              if (parameters.toolbar.isHiddenCameraButton !== undefined && typeof parameters.toolbar.isHiddenCameraButton !== 'boolean') {
                  return false;
              }
              if (parameters.toolbar.isHiddenMicButton !== undefined && typeof parameters.toolbar.isHiddenMicButton !== 'boolean') {
                  return false;
              }
              if (parameters.toolbar.isHiddenScreenShareButton !== undefined && typeof parameters.toolbar.isHiddenScreenShareButton !== 'boolean') {
                  return false;
              }
              if (parameters.toolbar.isHiddenParticipantsButton !== undefined && typeof parameters.toolbar.isHiddenParticipantsButton !== 'boolean') {
                  return false;
              }
              if (parameters.toolbar.isHiddenDeviceSettingButton !== undefined && typeof parameters.toolbar.isHiddenDeviceSettingButton !== 'boolean') {
                  return false;
              }
              if (parameters.toolbar.isHiddenExitButton !== undefined && typeof parameters.toolbar.isHiddenExitButton !== 'boolean') {
                  return false;
              }
              if (parameters.toolbar.customItems !== undefined) {
                  if (typeof parameters.toolbar.customItems !== 'object') {
                      return false;
                  }
                  let isValid = true;
                  parameters.toolbar.customItems.forEach((item) => {
                      if (item.iconName !== undefined && typeof item.iconName !== 'string') {
                          isValid = false;
                      }
                      if (item.type !== undefined && typeof item.type !== 'string') {
                          isValid = false;
                      }
                  });
                  if (!isValid) {
                      return false;
                  }
              }
          }
          if (parameters.subView !== undefined) {
              if (typeof parameters.subView !== 'object') {
                  return false;
              }
              if (parameters.subView.enableAutoVideoReceiving !== undefined && typeof parameters.subView.enableAutoVideoReceiving !== 'boolean') {
                  return false;
              }
              if (parameters.subView.menu !== undefined) {
                  if (typeof parameters.subView.menu !== 'object') {
                      return false;
                  }
                  if (parameters.subView.menu.isHidden !== undefined && typeof parameters.subView.menu.isHidden !== 'boolean') {
                      return false;
                  }
                  if (parameters.subView.menu.isHiddenRecordingButton !== undefined && typeof parameters.subView.menu.isHiddenRecordingButton !== 'boolean') {
                      return false;
                  }
                  if (parameters.subView.menu.isHiddenSharePoVButton !== undefined && typeof parameters.subView.menu.isHiddenSharePoVButton !== 'boolean') {
                      return false;
                  }
              }
              if (parameters.subView.theta !== undefined) {
                  if (typeof parameters.subView.theta !== 'object') {
                      return false;
                  }
                  if (parameters.subView.theta.isHiddenFramerate !== undefined && typeof parameters.subView.theta.isHiddenFramerate !== 'boolean') {
                      return false;
                  }
              }
          }
          if (parameters.podCoordinates !== undefined) {
              if (typeof parameters.podCoordinates !== 'object') {
                  return false;
              }
              if (parameters.podCoordinates.upperLeft !== undefined && !Array.isArray(parameters.podCoordinates.upperLeft)) {
                  return false;
              }
              if (parameters.podCoordinates.lowerRight !== undefined && !Array.isArray(parameters.podCoordinates.lowerRight)) {
                  return false;
              }
          }
          if (parameters.lsConfURL !== undefined) {
              try {
                  new URL(parameters.lsConfURL);
              }
              catch (e) {
                  return false;
              }
          }
          if (parameters.theme !== undefined) {
              if (typeof parameters.theme !== 'object') {
                  return false;
              }
              if (parameters.theme.primary !== undefined && typeof parameters.theme.primary !== 'string') {
                  return false;
              }
              if (parameters.theme.background !== undefined && typeof parameters.theme.background !== 'string') {
                  return false;
              }
              if (parameters.theme.surface !== undefined && typeof parameters.theme.surface !== 'string') {
                  return false;
              }
              if (parameters.theme.onPrimary !== undefined && typeof parameters.theme.onPrimary !== 'string') {
                  return false;
              }
              if (parameters.theme.primaryTextColor !== undefined && typeof parameters.theme.primaryTextColor !== 'string') {
                  return false;
              }
              if (parameters.theme.secondaryTextColor !== undefined && typeof parameters.theme.secondaryTextColor !== 'string') {
                  return false;
              }
              if (parameters.theme.components !== undefined) {
                  if (typeof parameters.theme.components !== 'object') {
                      return false;
                  }
                  if (parameters.theme.components.participantsVideoContainer !== undefined) {
                      if (typeof parameters.theme.components.participantsVideoContainer !== 'object') {
                          return false;
                      }
                      if (parameters.theme.components.participantsVideoContainer.background !== undefined && typeof parameters.theme.components.participantsVideoContainer.background !== 'string') {
                          return false;
                      }
                      if (parameters.theme.components.participantsVideoContainer.subViewSwitchBackgroundColor !== undefined &&
                          typeof parameters.theme.components.participantsVideoContainer.subViewSwitchBackgroundColor !== 'string') {
                          return false;
                      }
                      if (parameters.theme.components.participantsVideoContainer.subViewSwitchIconColor !== undefined &&
                          typeof parameters.theme.components.participantsVideoContainer.subViewSwitchIconColor !== 'string') {
                          return false;
                      }
                  }
                  if (parameters.theme.components.toolbar !== undefined) {
                      if (typeof parameters.theme.components.toolbar !== 'object') {
                          return false;
                      }
                      if (parameters.theme.components.toolbar.background !== undefined && typeof parameters.theme.components.toolbar.background !== 'string') {
                          return false;
                      }
                      if (parameters.theme.components.toolbar.iconColor !== undefined && typeof parameters.theme.components.toolbar.iconColor !== 'string') {
                          return false;
                      }
                  }
                  if (parameters.theme.components.video !== undefined) {
                      if (typeof parameters.theme.components.video !== 'object') {
                          return false;
                      }
                      if (parameters.theme.components.video.background !== undefined && typeof parameters.theme.components.video.background !== 'string') {
                          return false;
                      }
                      if (parameters.theme.components.video.textColor !== undefined && typeof parameters.theme.components.video.textColor !== 'string') {
                          return false;
                      }
                      if (parameters.theme.components.video.textBackgroundColor !== undefined && typeof parameters.theme.components.video.textBackgroundColor !== 'string') {
                          return false;
                      }
                      if (parameters.theme.components.video.iconColor !== undefined && typeof parameters.theme.components.video.iconColor !== 'string') {
                          return false;
                      }
                      if (parameters.theme.components.video.menuTextColor !== undefined && typeof parameters.theme.components.video.menuTextColor !== 'string') {
                          return false;
                      }
                      if (parameters.theme.components.video.menuBackgroundColor !== undefined && typeof parameters.theme.components.video.menuBackgroundColor !== 'string') {
                          return false;
                      }
                      if (parameters.theme.components.video.highlightBorderColor !== undefined && typeof parameters.theme.components.video.highlightBorderColor !== 'string') {
                          return false;
                      }
                      if (parameters.theme.components.video.highlightShadowColor !== undefined && typeof parameters.theme.components.video.highlightShadowColor !== 'string') {
                          return false;
                      }
                  }
                  if (parameters.theme.components.dialog !== undefined) {
                      if (typeof parameters.theme.components.dialog !== 'object') {
                          return false;
                      }
                      if (parameters.theme.components.dialog.inputFocusColor !== undefined && typeof parameters.theme.components.dialog.inputFocusColor !== 'string') {
                          return false;
                      }
                  }
              }
          }
          return true;
      }
      validateJoinParameters(clientId, accessToken, connectionId, connectOptions) {
          if (typeof clientId !== 'string') {
              return false;
          }
          if (typeof accessToken !== 'string') {
              return false;
          }
          if (typeof connectionId !== 'string') {
              return false;
          }
          if (typeof connectOptions.username !== 'string') {
              return false;
          }
          if (typeof connectOptions.enableAudio !== 'boolean') {
              return false;
          }
          if (typeof connectOptions.enableVideo !== 'boolean') {
              return false;
          }
          if (connectOptions.mode !== undefined) {
              if (typeof connectOptions.mode !== 'string') {
                  return false;
              }
              if (connectOptions.mode !== 'normal' && connectOptions.mode !== 'viewer') {
                  return false;
              }
          }
          if (connectOptions.maxVideoBitrate !== undefined) {
              if (typeof connectOptions.maxVideoBitrate !== 'number') {
                  return false;
              }
              if (connectOptions.maxVideoBitrate < 100 || 20000 < connectOptions.maxVideoBitrate) {
                  return false;
              }
          }
          if (connectOptions.maxShareBitrate !== undefined) {
              if (typeof connectOptions.maxShareBitrate !== 'number') {
                  return false;
              }
              if (connectOptions.maxShareBitrate < 100 || 20000 < connectOptions.maxShareBitrate) {
                  return false;
              }
          }
          if (connectOptions.useDummyDevice !== undefined) {
              if (typeof connectOptions.useDummyDevice !== 'boolean') {
                  return false;
              }
          }
          if (connectOptions.signalingURL !== undefined) {
              try {
                  new URL(connectOptions.signalingURL);
              }
              catch (e) {
                  return false;
              }
          }
          if (connectOptions.videoCodec !== undefined) {
              if (typeof connectOptions.videoCodec !== 'string') {
                  return false;
              }
              if (connectOptions.videoCodec !== 'h264' &&
                  connectOptions.videoCodec !== 'vp8' &&
                  connectOptions.videoCodec !== 'vp9' &&
                  connectOptions.videoCodec !== 'h265' &&
                  connectOptions.videoCodec !== 'av1') {
                  return false;
              }
          }
          if (connectOptions.videoAudioConstraints !== undefined && typeof connectOptions.videoAudioConstraints !== 'object') {
              return false;
          }
          if (connectOptions.screenShareConstraints !== undefined && typeof connectOptions.screenShareConstraints !== 'object') {
              return false;
          }
          return true;
      }
      validateScreenShareParameters(param) {
          if (typeof param.accessToken !== 'string') {
              return false;
          }
          if (typeof param.connectionId !== 'string') {
              return false;
          }
          return true;
      }
      validateSubViewType(subView) {
          if (subView.connectionId !== undefined && typeof subView.connectionId !== 'string') {
              return false;
          }
          if (subView.isTheta !== undefined && typeof subView.isTheta !== 'boolean') {
              return false;
          }
          if (subView.type !== undefined && subView.type !== 'VIDEO_AUDIO' && subView.type !== 'SCREEN_SHARE') {
              return false;
          }
          return true;
      }
      validatePoVType(poV) {
          if (poV.pan !== undefined && typeof poV.pan !== 'number') {
              return false;
          }
          if (poV.tilt !== undefined && typeof poV.tilt !== 'number') {
              return false;
          }
          if (poV.fov !== undefined && typeof poV.fov !== 'number') {
              return false;
          }
          return true;
      }
      validateLayoutType(layout) {
          if (layout !== undefined && (typeof layout !== 'string' || (layout !== 'gallery' && layout !== 'presentation' && layout !== 'fullscreen'))) {
              return false;
          }
          return true;
      }
      validateCaptureImageOptionsType(options) {
          if (options.mimeType !== undefined) {
              if (typeof options.mimeType !== 'string') {
                  return false;
              }
              if (options.mimeType !== 'image/png' && options.mimeType !== 'image/jpeg') {
                  return false;
              }
          }
          if (options.qualityArgument !== undefined && typeof options.qualityArgument !== 'number') {
              return false;
          }
          return true;
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setRequestTimer(reject, error, time) {
          return window.setTimeout(() => {
              // 指定された時間内で処理が完了しない場合は reject する
              if (this.iframeElement.contentWindow) {
                  this.iframeElement.contentWindow.postMessage({
                      type: 'connectCancel',
                  }, this.lsConfURL);
              }
              this.dispatchEvent(new LSConfEvent('error', error));
              reject(error);
          }, time);
      }
      __create(parameters) {
          return new Promise((resolve, reject) => {
              this.state = 'creating';
              if (parameters.lsConfURL) {
                  this.lsConfURL = parameters.lsConfURL;
                  this.iframeElement.src = this.lsConfURL;
              }
              const createTimeoutId = this.setRequestTimer(reject, new LSConferenceIframeError(REQUEST_ERRORS['CreateTimeout']), DEFAULT_CREATE_TIMEOUT_MSEC);
              // allow =  "display-capture" は Chrome だと unknown parameter の warning が出るが
              // MDN の仕様では getDM する場合設定する必要があるので記載している
              // cf: https://developer.mozilla.org/en-US/docs/Web/API/Screen_Capture_API/Using_Screen_Capture
              this.iframeElement.allow = 'camera *;microphone *;autoplay *;display-capture *; fullscreen *';
              this.parentElement.appendChild(this.iframeElement);
              this.iframeElement.onload = () => {
                  // Safari では onload 時に即時に postMessage することができないため、500 ms 遅延させて postMessage を実行する
                  window.setTimeout(() => {
                      if (!this.iframeElement.contentWindow) {
                          this.state = 'idle';
                          throw new LSConferenceIframeError(INTERNAL_ERRORS['InternalError5001']);
                      }
                      const postMessageParameters = {
                          type: 'create',
                          origin: location.href,
                          parameters: {
                              defaultLayout: parameters.defaultLayout,
                              room: parameters.room,
                              toolbar: parameters.toolbar,
                              podCoordinates: parameters.podCoordinates,
                              thetaZoomMaxRange: parameters.thetaZoomMaxRange,
                              subView: parameters.subView,
                              theme: parameters.theme,
                              locales: parameters.locales,
                          },
                      };
                      try {
                          this.iframeElement.contentWindow.postMessage(postMessageParameters, this.lsConfURL);
                      }
                      catch (e) {
                          this.state = 'idle';
                          const error = new LSConferenceIframeError(REQUEST_ERRORS['CreateFailed']);
                          this.dispatchEvent(new LSConfEvent('error', error));
                          return reject(error);
                      }
                      this.setWindowMessageCallback();
                      clearTimeout(createTimeoutId);
                      this.state = 'created';
                      return resolve();
                  }, 500);
              };
          });
      }
      static create(parentElement, parameters) {
          return new Promise((resolve, reject) => {
              const instance = new this(parentElement);
              const element = parentElement || document.querySelector('body');
              if (!(element instanceof HTMLElement)) {
                  const error = new LSConferenceIframeError(REQUEST_ERRORS['CreateArgsInvalid']);
                  instance.dispatchEvent(new LSConfEvent('error', error));
                  return reject(error);
              }
              if (!instance.validateCreateParameters(parameters)) {
                  const error = new LSConferenceIframeError(REQUEST_ERRORS['CreateArgsInvalid']);
                  instance.dispatchEvent(new LSConfEvent('error', error));
                  return reject(error);
              }
              let extParam = parameters;
              try {
                  // eslint-disable-next-line @typescript-eslint/no-var-requires
                  const enJson = require('./lang/en.json');
                  // eslint-disable-next-line @typescript-eslint/no-var-requires
                  const jaJson = require('./lang/ja.json');
                  extParam = { ...parameters, locales: { ja: jaJson, en: enJson } };
              }
              catch (e) {
                  console.warn(`Language file could not be read : ${e.message}`);
              }
              instance
                  .__create(extParam)
                  .then(() => {
                  resolve(instance);
              })
                  .catch((e) => {
                  //XXX(kdxu): __create 内で dispatch error event を行っているため、この時点では error event を dispatch しない
                  reject(e);
              });
          });
      }
      async join(clientId, accessToken, connectionId, connectOptions) {
          return new Promise((resolve, reject) => {
              this.state = 'connecting';
              const joinTimeoutId = this.setRequestTimer(reject, new LSConferenceIframeError(REQUEST_ERRORS['JoinFailedTimeout']), DEFAULT_JOIN_TIMEOUT_MSEC);
              if (!this.iframeElement.contentWindow) {
                  clearTimeout(joinTimeoutId);
                  this.state = 'created';
                  throw new LSConferenceIframeError(INTERNAL_ERRORS['InternalError5001']);
              }
              if (!this.validateJoinParameters(clientId, accessToken, connectionId, connectOptions)) {
                  this.state = 'created';
                  const error = new LSConferenceIframeError(REQUEST_ERRORS['JoinArgsInvalid']);
                  this.dispatchEvent(new LSConfEvent('error', error));
                  clearTimeout(joinTimeoutId);
                  return reject(error);
              }
              // optionalパラメータのデフォルト値の設定
              connectOptions.signalingURL = connectOptions.signalingURL || DEFAULT_SIGNALING_URL;
              connectOptions.maxVideoBitrate = connectOptions.maxVideoBitrate || DEFAULT_MAX_BITRATE;
              connectOptions.maxShareBitrate = connectOptions.maxShareBitrate || DEFAULT_MAX_BITRATE;
              connectOptions.useDummyDevice = connectOptions.useDummyDevice || DEFAULT_USE_DUMMY_DEVICE;
              connectOptions.videoCodec = connectOptions.videoCodec || DEFAULT_VIDEO_CODEC;
              connectOptions.mode = connectOptions.mode || DEFAULT_MODE;
              // video audio の role, mediaType は固定
              const postMessageParameters = {
                  type: 'connect',
                  clientId: clientId,
                  accessToken: accessToken,
                  connectionId: connectionId,
                  role: 'sendrecv',
                  mediaType: 'videoaudio',
                  connectOptions: connectOptions,
              };
              this.joinCallback = {
                  success: () => {
                      clearTimeout(joinTimeoutId);
                      resolve();
                  },
                  error: (err) => {
                      clearTimeout(joinTimeoutId);
                      reject(err);
                  },
                  accepted: () => {
                      clearTimeout(joinTimeoutId);
                  },
              };
              try {
                  this.iframeElement.contentWindow.postMessage(postMessageParameters, this.lsConfURL);
              }
              catch (e) {
                  this.state = 'created';
                  const error = new LSConferenceIframeError(REQUEST_ERRORS['JoinFailed']);
                  this.dispatchEvent(new LSConfEvent('error', error));
                  clearTimeout(joinTimeoutId);
                  return reject(error);
              }
              this.clientId = clientId;
              this.connectOptions = connectOptions;
          });
      }
      leave() {
          return new Promise((resolve, reject) => {
              this.state = 'closing';
              if (!this.iframeElement.contentWindow) {
                  this.state = 'open';
                  throw new LSConferenceIframeError(INTERNAL_ERRORS['InternalError5001']);
              }
              const postMessageParameters = {
                  type: 'leave',
              };
              try {
                  this.iframeElement.contentWindow.postMessage(postMessageParameters, this.lsConfURL);
              }
              catch (e) {
                  this.state = 'open';
                  const error = new LSConferenceIframeError(REQUEST_ERRORS['CloseFailed']);
                  this.dispatchEvent(new LSConfEvent('error', error));
                  return reject(error);
              }
              return resolve();
          });
      }
      onShareRequested(callback) {
          if (typeof callback !== 'function') {
              throw new TypeError(`Failed to execute 'onShareRequested' on '${this.constructor.name}': The callback provided as parameter 1 is not an object.`);
          }
          this.shareRequestedCallback = callback;
      }
      getSubViews() {
          return new Promise((resolve, reject) => {
              if (!this.iframeElement.contentWindow) {
                  throw new LSConferenceIframeError(INTERNAL_ERRORS['InternalError5001']);
              }
              const postMessageParameters = {
                  type: 'getSubViews',
              };
              this.getSubViewsCallback = { success: (subViews) => resolve(subViews), error: (err) => reject(err) };
              try {
                  this.iframeElement.contentWindow.postMessage(postMessageParameters, this.lsConfURL);
              }
              catch (e) {
                  const error = new LSConferenceIframeError(REQUEST_ERRORS['GetSubViewsFailed']);
                  this.dispatchEvent(new LSConfEvent('error', error));
                  return reject(error);
              }
          });
      }
      highlight(subView) {
          return new Promise((resolve, reject) => {
              if (!this.iframeElement.contentWindow) {
                  return reject(new LSConferenceIframeError(INTERNAL_ERRORS['InternalError5001']));
              }
              if (!this.validateSubViewType(subView)) {
                  return reject(new LSConferenceIframeError(REQUEST_ERRORS['HighlightArgsInvalid']));
              }
              const postMessageParameters = {
                  type: 'highlight',
                  subView: subView,
              };
              this.highlightCallback = { success: () => resolve(), error: (err) => reject(err) };
              try {
                  this.iframeElement.contentWindow.postMessage(postMessageParameters, this.lsConfURL);
              }
              catch (e) {
                  const error = new LSConferenceIframeError(REQUEST_ERRORS['HighlightFailed']);
                  this.dispatchEvent(new LSConfEvent('error', error));
                  return reject(error);
              }
          });
      }
      getPoV(subView) {
          return new Promise((resolve, reject) => {
              if (!this.iframeElement.contentWindow) {
                  return reject(new LSConferenceIframeError(INTERNAL_ERRORS['InternalError5001']));
              }
              if (!this.validateSubViewType(subView)) {
                  return reject(new LSConferenceIframeError(REQUEST_ERRORS['GetPoVArgsInvalid']));
              }
              if (!subView.isTheta) {
                  return reject(new LSConferenceIframeError(REQUEST_ERRORS['GetPoVArgsInvalid']));
              }
              const postMessageParameters = {
                  type: 'getPoV',
                  subView: subView,
              };
              this.getPoVCallback = { success: (poV) => resolve(poV), error: (err) => reject(err) };
              try {
                  this.iframeElement.contentWindow.postMessage(postMessageParameters, this.lsConfURL);
              }
              catch (e) {
                  const error = new LSConferenceIframeError(REQUEST_ERRORS['GetPoVFailed']);
                  this.dispatchEvent(new LSConfEvent('error', error));
                  return reject(error);
              }
          });
      }
      setPoV(subView, poV) {
          return new Promise((resolve, reject) => {
              if (!this.iframeElement.contentWindow) {
                  return reject(new LSConferenceIframeError(INTERNAL_ERRORS['InternalError5001']));
              }
              if (!this.validateSubViewType(subView) || !this.validatePoVType(poV)) {
                  return reject(new LSConferenceIframeError(REQUEST_ERRORS['SetPoVArgsInvalid']));
              }
              if (!subView.isTheta) {
                  return reject(new LSConferenceIframeError(REQUEST_ERRORS['SetPoVArgsInvalid']));
              }
              const postMessageParameters = {
                  type: 'setPoV',
                  subView: subView,
                  poV: poV,
              };
              this.setPoVCallback = { success: () => resolve(), error: (err) => reject(err) };
              try {
                  this.iframeElement.contentWindow.postMessage(postMessageParameters, this.lsConfURL);
              }
              catch (e) {
                  const error = new LSConferenceIframeError(REQUEST_ERRORS['SetPoVFailed']);
                  this.dispatchEvent(new LSConfEvent('error', error));
                  return reject(error);
              }
          });
      }
      getMediaDevices() {
          return new Promise((resolve, reject) => {
              if (!this.iframeElement.contentWindow) {
                  return reject(new LSConferenceIframeError(INTERNAL_ERRORS['InternalError5001']));
              }
              if (this.connectOptions && this.connectOptions.mode === 'viewer' && this.state === 'open') {
                  return reject(new LSConferenceIframeError(REQUEST_ERRORS['ModeInvalid']));
              }
              const postMessageParameters = {
                  type: 'getMediaDevices',
              };
              this.getMediaDevicesCallback = { success: (devices) => resolve(devices), error: (err) => reject(err) };
              try {
                  this.iframeElement.contentWindow.postMessage(postMessageParameters, this.lsConfURL);
              }
              catch (e) {
                  const error = new LSConferenceIframeError(REQUEST_ERRORS['GetMediaDevicesFailed']);
                  this.dispatchEvent(new LSConfEvent('error', error));
                  return reject(error);
              }
          });
      }
      setCameraMute(isEnabled) {
          return new Promise((resolve, reject) => {
              if (!this.iframeElement.contentWindow) {
                  return reject(new LSConferenceIframeError(INTERNAL_ERRORS['InternalError5001']));
              }
              if (this.connectOptions && this.connectOptions.mode === 'viewer' && this.state === 'open') {
                  return reject(new LSConferenceIframeError(REQUEST_ERRORS['ModeInvalid']));
              }
              const postMessageParameters = {
                  type: 'cameraMute',
                  isEnabled: isEnabled,
              };
              try {
                  this.iframeElement.contentWindow.postMessage(postMessageParameters, this.lsConfURL);
              }
              catch (e) {
                  const error = new LSConferenceIframeError(REQUEST_ERRORS['CameraMuteFailed']);
                  this.dispatchEvent(new LSConfEvent('error', error));
                  return reject(error);
              }
              return resolve();
          });
      }
      setCameraDevice(deviceId) {
          return new Promise((resolve, reject) => {
              if (!this.iframeElement.contentWindow) {
                  return reject(new LSConferenceIframeError(INTERNAL_ERRORS['InternalError5001']));
              }
              if (this.connectOptions && this.connectOptions.mode === 'viewer' && this.state === 'open') {
                  return reject(new LSConferenceIframeError(REQUEST_ERRORS['ModeInvalid']));
              }
              const postMessageParameters = {
                  type: 'setCameraDevice',
                  deviceId: deviceId,
              };
              try {
                  this.iframeElement.contentWindow.postMessage(postMessageParameters, this.lsConfURL);
              }
              catch (e) {
                  const error = new LSConferenceIframeError(REQUEST_ERRORS['SetCameraDeviceFailed']);
                  this.dispatchEvent(new LSConfEvent('error', error));
                  return reject(error);
              }
              return resolve();
          });
      }
      setMicMute(isEnabled) {
          return new Promise((resolve, reject) => {
              if (!this.iframeElement.contentWindow) {
                  return reject(new LSConferenceIframeError(INTERNAL_ERRORS['InternalError5001']));
              }
              if (this.connectOptions && this.connectOptions.mode === 'viewer' && this.state === 'open') {
                  return reject(new LSConferenceIframeError(REQUEST_ERRORS['ModeInvalid']));
              }
              const postMessageParameters = {
                  type: 'micMute',
                  isEnabled: isEnabled,
              };
              try {
                  this.iframeElement.contentWindow.postMessage(postMessageParameters, this.lsConfURL);
              }
              catch (e) {
                  const error = new LSConferenceIframeError(REQUEST_ERRORS['MicMuteFailed']);
                  this.dispatchEvent(new LSConfEvent('error', error));
                  return reject(error);
              }
              return resolve();
          });
      }
      setMicDevice(deviceId) {
          return new Promise((resolve, reject) => {
              if (!this.iframeElement.contentWindow) {
                  return reject(new LSConferenceIframeError(INTERNAL_ERRORS['InternalError5001']));
              }
              if (this.connectOptions && this.connectOptions.mode === 'viewer' && this.state === 'open') {
                  return reject(new LSConferenceIframeError(REQUEST_ERRORS['ModeInvalid']));
              }
              const postMessageParameters = {
                  type: 'setMicDevice',
                  deviceId: deviceId,
              };
              try {
                  this.iframeElement.contentWindow.postMessage(postMessageParameters, this.lsConfURL);
              }
              catch (e) {
                  const error = new LSConferenceIframeError(REQUEST_ERRORS['SetMicDeviceFailed']);
                  this.dispatchEvent(new LSConfEvent('error', error));
                  return reject(error);
              }
              return resolve();
          });
      }
      enablePointer(isEnabled) {
          return new Promise((resolve, reject) => {
              if (!this.iframeElement.contentWindow) {
                  return reject(new LSConferenceIframeError(INTERNAL_ERRORS['InternalError5001']));
              }
              const postMessageParameters = {
                  type: 'enablePointer',
                  isEnabled: isEnabled,
              };
              try {
                  this.iframeElement.contentWindow.postMessage(postMessageParameters, this.lsConfURL);
              }
              catch (e) {
                  const error = new LSConferenceIframeError(REQUEST_ERRORS['EnablePointerFailed']);
                  this.dispatchEvent(new LSConfEvent('error', error));
                  return reject(error);
              }
              return resolve();
          });
      }
      updatePointer(subView, connectionId, poV, username, color) {
          return new Promise((resolve, reject) => {
              if (!this.iframeElement.contentWindow) {
                  return reject(new LSConferenceIframeError(INTERNAL_ERRORS['InternalError5001']));
              }
              if (!this.validateSubViewType(subView) || (poV && !this.validatePoVType(poV))) {
                  return reject(new LSConferenceIframeError(REQUEST_ERRORS['UpdatePointerArgsInvalid']));
              }
              if (typeof connectionId !== 'string') {
                  return reject(new LSConferenceIframeError(REQUEST_ERRORS['UpdatePointerArgsInvalid']));
              }
              if (username !== undefined && typeof username !== 'string') {
                  return reject(new LSConferenceIframeError(REQUEST_ERRORS['UpdatePointerArgsInvalid']));
              }
              if (color !== undefined && typeof color !== 'string') {
                  return reject(new LSConferenceIframeError(REQUEST_ERRORS['UpdatePointerArgsInvalid']));
              }
              const postMessageParameters = {
                  type: 'updatePointer',
                  subView: subView,
                  connectionId: connectionId,
                  poV: poV,
                  username: username,
                  color: color,
              };
              this.updatePointerCallback = { success: () => resolve(), error: (err) => reject(err) };
              try {
                  this.iframeElement.contentWindow.postMessage(postMessageParameters, this.lsConfURL);
              }
              catch (e) {
                  const error = new LSConferenceIframeError(REQUEST_ERRORS['UpdatePointerFailed']);
                  this.dispatchEvent(new LSConfEvent('error', error));
                  return reject(error);
              }
          });
      }
      getReport(type, filterOption) {
          return new Promise((resolve, reject) => {
              if (!this.iframeElement.contentWindow) {
                  throw new LSConferenceIframeError(INTERNAL_ERRORS['InternalError5001']);
              }
              const postMessageParameters = {
                  type: type,
                  filterOption: filterOption,
              };
              this.logCallbacks.set(type, { success: (log) => resolve(log), error: (err) => reject(err) });
              try {
                  this.iframeElement.contentWindow.postMessage(postMessageParameters, this.lsConfURL);
              }
              catch (e) {
                  this.logCallbacks.delete(type);
                  const error = new LSConferenceIframeError(REQUEST_ERRORS['GetReportFailed']);
                  this.dispatchEvent(new LSConfEvent('error', error));
                  return reject(error);
              }
          });
      }
      getLSConfLog() {
          return new Promise((resolve, reject) => {
              if (!this.iframeElement.contentWindow) {
                  return reject(new LSConferenceIframeError(INTERNAL_ERRORS['InternalError5001']));
              }
              const postMessageParameters = {
                  type: 'getLSConfLog',
              };
              this.getLSConfLogCallback = {
                  success: async (lsConfLog) => resolve(lsConfLog),
                  error: (err) => reject(err),
              };
              try {
                  this.iframeElement.contentWindow.postMessage(postMessageParameters, this.lsConfURL);
              }
              catch (e) {
                  const error = new LSConferenceIframeError(REQUEST_ERRORS['GetLSConfLogFailed']);
                  this.dispatchEvent(new LSConfEvent('error', error));
                  return reject(error);
              }
          });
      }
      getVideoAudioStats() {
          return this.getReport('VideoAudioStats');
      }
      getScreenShareStats() {
          return this.getReport('ScreenShareStats');
      }
      changeLayout(layout, subViews) {
          return new Promise((resolve, reject) => {
              if (!this.iframeElement.contentWindow) {
                  return reject(new LSConferenceIframeError(INTERNAL_ERRORS['InternalError5001']));
              }
              let isValidSubViews = true;
              if (subViews) {
                  subViews.forEach((subView) => {
                      if (!this.validateSubViewType(subView)) {
                          isValidSubViews = false;
                      }
                  });
              }
              if (!this.validateLayoutType(layout) || !isValidSubViews) {
                  return reject(new LSConferenceIframeError(REQUEST_ERRORS['ChangeLayoutArgsInvalid']));
              }
              const postMessageParameters = {
                  type: 'changeLayout',
                  layout,
                  subViews,
              };
              try {
                  this.iframeElement.contentWindow.postMessage(postMessageParameters, this.lsConfURL);
              }
              catch (e) {
                  const error = new LSConferenceIframeError(REQUEST_ERRORS['ChangeLayoutFailed']);
                  this.dispatchEvent(new LSConfEvent('error', error));
                  return reject(error);
              }
              return resolve();
          });
      }
      addRecordingMember(subView, connectionId) {
          return new Promise((resolve, reject) => {
              if (!this.iframeElement.contentWindow) {
                  return reject(new LSConferenceIframeError(INTERNAL_ERRORS['InternalError5001']));
              }
              if (typeof connectionId !== 'string') {
                  return reject(new LSConferenceIframeError(REQUEST_ERRORS['AddRecordingMemberArgsInvalid']));
              }
              if (!this.validateSubViewType(subView)) {
                  return reject(new LSConferenceIframeError(REQUEST_ERRORS['AddRecordingMemberArgsInvalid']));
              }
              const postMessageParameters = {
                  type: 'addRecordingMember',
                  subView,
                  connectionId,
              };
              this.addRecordingMemberCallback = { success: () => resolve(), error: (err) => reject(err) };
              try {
                  this.iframeElement.contentWindow.postMessage(postMessageParameters, this.lsConfURL);
              }
              catch (e) {
                  const error = new LSConferenceIframeError(REQUEST_ERRORS['AddRecordingMemberFailed']);
                  this.dispatchEvent(new LSConfEvent('error', error));
                  return reject(error);
              }
          });
      }
      removeRecordingMember(subView, connectionId) {
          return new Promise((resolve, reject) => {
              if (!this.iframeElement.contentWindow) {
                  return reject(new LSConferenceIframeError(INTERNAL_ERRORS['InternalError5001']));
              }
              if (typeof connectionId !== 'string') {
                  return reject(new LSConferenceIframeError(REQUEST_ERRORS['RemoveRecordingMemberArgsInvalid']));
              }
              if (!this.validateSubViewType(subView)) {
                  return reject(new LSConferenceIframeError(REQUEST_ERRORS['RemoveRecordingMemberArgsInvalid']));
              }
              const postMessageParameters = {
                  type: 'removeRecordingMember',
                  subView,
                  connectionId,
              };
              this.removeRecordingMemberCallback = { success: () => resolve(), error: (err) => reject(err) };
              try {
                  this.iframeElement.contentWindow.postMessage(postMessageParameters, this.lsConfURL);
              }
              catch (e) {
                  const error = new LSConferenceIframeError(REQUEST_ERRORS['RemoveRecordingMemberFailed']);
                  this.dispatchEvent(new LSConfEvent('error', error));
                  return reject(error);
              }
          });
      }
      getCaptureImage(subView, options) {
          return new Promise((resolve, reject) => {
              if (!this.iframeElement.contentWindow) {
                  return reject(new LSConferenceIframeError(INTERNAL_ERRORS['InternalError5001']));
              }
              if (!this.validateSubViewType(subView)) {
                  return reject(new LSConferenceIframeError(REQUEST_ERRORS['GetCaptureImageArgsInvalid']));
              }
              if (!this.validateCaptureImageOptionsType(options)) {
                  return reject(new LSConferenceIframeError(REQUEST_ERRORS['GetCaptureImageArgsInvalid']));
              }
              const postMessageParameters = {
                  type: 'getCaptureImage',
                  subView,
                  options,
              };
              this.getCaptureImageCallback = { success: (blob) => resolve(blob), error: (err) => reject(err) };
              try {
                  this.iframeElement.contentWindow.postMessage(postMessageParameters, this.lsConfURL);
              }
              catch (e) {
                  const error = new LSConferenceIframeError(REQUEST_ERRORS['GetCaptureImageFailed']);
                  this.dispatchEvent(new LSConfEvent('error', error));
                  return reject(error);
              }
          });
      }
      startReceiveVideo(subView) {
          return new Promise((resolve, reject) => {
              if (!this.iframeElement.contentWindow) {
                  return reject(new LSConferenceIframeError(INTERNAL_ERRORS['InternalError5001']));
              }
              if (!this.validateSubViewType(subView)) {
                  return reject(new LSConferenceIframeError(REQUEST_ERRORS['StartReceiveVideoArgsInvalid']));
              }
              const postMessageParameters = {
                  type: 'startReceiveVideo',
                  subView,
              };
              this.startReceiveVideoCallback = { success: () => resolve(), error: (err) => reject(err) };
              try {
                  this.iframeElement.contentWindow.postMessage(postMessageParameters, this.lsConfURL);
              }
              catch (e) {
                  const error = new LSConferenceIframeError(REQUEST_ERRORS['StartReceiveVideoFailed']);
                  this.dispatchEvent(new LSConfEvent('error', error));
                  return reject(error);
              }
          });
      }
      stopReceiveVideo(subView) {
          return new Promise((resolve, reject) => {
              if (!this.iframeElement.contentWindow) {
                  return reject(new LSConferenceIframeError(INTERNAL_ERRORS['InternalError5001']));
              }
              if (!this.validateSubViewType(subView)) {
                  return reject(new LSConferenceIframeError(REQUEST_ERRORS['StopReceiveVideoArgsInvalid']));
              }
              const postMessageParameters = {
                  type: 'stopReceiveVideo',
                  subView,
              };
              this.stopReceiveVideoCallback = { success: () => resolve(), error: (err) => reject(err) };
              try {
                  this.iframeElement.contentWindow.postMessage(postMessageParameters, this.lsConfURL);
              }
              catch (e) {
                  const error = new LSConferenceIframeError(REQUEST_ERRORS['StopReceiveVideoFailed']);
                  this.dispatchEvent(new LSConfEvent('error', error));
                  return reject(error);
              }
          });
      }
      iframe() {
          return this.iframeElement;
      }
      addEventListener(type, callback, options) {
          if (arguments.length < 2) {
              throw new TypeError(`Failed to execute 'addEventListener' on '${this.constructor.name}': 2 arguments required, but only ${arguments.length} present.`);
          }
          if (typeof callback !== 'function' && typeof callback !== 'object') {
              throw new TypeError(`Failed to execute 'addEventListener' on '${this.constructor.name}': The callback provided as parameter 2 is not an object.`);
          }
          const listeners = this.eventListeners.get(type) || [];
          listeners.push({ listener: callback, options: options });
          this.eventListeners.set(type, listeners);
      }
      removeEventListener(type, callback, _options) {
          // window.removeEventListener の options 相当の実装はしない
          if (arguments.length < 2) {
              throw new TypeError(`Failed to execute 'removeEventListener' on '${this.constructor.name}': 2 arguments required, but only ${arguments.length} present.`);
          }
          if (typeof callback !== 'function' && typeof callback !== 'object') {
              throw new TypeError(`Failed to execute 'removeEventListener' on '${this.constructor.name}': The callback provided as parameter 2 is not an object.`);
          }
          const listeners = this.eventListeners.get(type) || [];
          const removedListeners = listeners.filter(({ listener }) => listener !== callback);
          this.eventListeners.set(type, removedListeners);
      }
      dispatchEvent(event) {
          // eventListeners の options 相当の実装はしない
          if (!(event instanceof LSConfEvent)) {
              throw new TypeError(`Failed to execute 'dispatchEvent' on '${this.constructor.name}': parameter 1 is not of type 'LSConfEvent'.`);
          }
          const type = event.type;
          const listeners = this.eventListeners.get(type);
          if (listeners) {
              listeners.forEach(({ listener, options }) => {
                  listener.call(this, event.event);
                  if (options && !options.once)
                      return;
                  this.removeEventListener(event.type, listener, options);
              });
          }
      }
      addApplicationEventListener(type, callback, options) {
          if (arguments.length < 2) {
              throw new TypeError(`Failed to execute 'addApplicationEventListener' on '${this.constructor.name}': 2 arguments required, but only ${arguments.length} present.`);
          }
          if (typeof callback !== 'function' && typeof callback !== 'object') {
              throw new TypeError(`Failed to execute 'addApplicationEventListener' on '${this.constructor.name}': The callback provided as parameter 2 is not an object.`);
          }
          const listeners = this.applicationEventListeners.get(type) || [];
          listeners.push({ listener: callback, options: options });
          this.applicationEventListeners.set(type, listeners);
      }
      removeApplicationEventListener(type, callback, _options) {
          // window.removeEventListener の options 相当の実装はしない
          if (arguments.length < 2) {
              throw new TypeError(`Failed to execute 'removeApplicationEventListener' on '${this.constructor.name}': 2 arguments required, but only ${arguments.length} present.`);
          }
          if (typeof callback !== 'function' && typeof callback !== 'object') {
              throw new TypeError(`Failed to execute 'removeApplicationEventListener' on '${this.constructor.name}': The callback provided as parameter 2 is not an object.`);
          }
          const listeners = this.applicationEventListeners.get(type) || [];
          const removedListeners = listeners.filter(({ listener }) => listener !== callback);
          this.applicationEventListeners.set(type, removedListeners);
      }
      dispatchApplicationEvent(event) {
          // eventListeners の options 相当の実装はしない
          if (!(event instanceof Event)) {
              throw new TypeError(`Failed to execute 'dispatchApplicationEvent' on '${this.constructor.name}': parameter 1 is not of type 'Event'.`);
          }
          const type = event.type;
          const listeners = this.applicationEventListeners.get(type);
          if (listeners) {
              listeners.forEach(({ listener, options }) => {
                  listener.call(this, event);
                  if (options && !options.once)
                      return;
                  this.removeApplicationEventListener(event.type, listener, options);
              });
          }
      }
  }

  return LSConferenceIframe;

})));
