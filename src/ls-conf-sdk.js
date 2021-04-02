/**
 * ls-conf-sdk
 * ls-conf-sdk
 * @version: 1.2.4
 **/

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.LSConferenceIframe = factory());
}(this, (function () { 'use strict';

  // ls-conf-sdk のバージョン
  const LS_CONF_SDK_VERSION = '1.2.4';
  const DEFAULT_LS_CONF_URL = `https://conf.livestreaming.mw.smart-integration.ricoh.com/${LS_CONF_SDK_VERSION}/index.html`;
  const DEFAULT_SIGNALING_URL = 'wss://signaling.livestreaming.mw.smart-integration.ricoh.com/v1/room';
  const DEFAULT_MAX_BITRATE = 2000;
  const DEFAULT_USE_DUMMY_DEVICE = false;
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
      JoinFailed: {
          code: 4050,
          type: 'RequestError',
          error: 'JoinFailed',
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
  };
  const INTERNAL_ERRORS = {
      InternalError5001: {
          code: 5001,
          type: 'InternalError',
          error: 'InternalError5001',
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
          this.shareRequestedCallback = () => { };
          this.eventListeners = new Map();
      }
      setWindowMessageCallback() {
          window.addEventListener('message', async (event) => {
              const data = event.data;
              console.log(data);
              if (!this.iframeElement.contentWindow) {
                  throw new LSConferenceIframeError(INTERNAL_ERRORS['InternalError5001']);
              }
              if (data.type === 'shareRequest' && this.connectOptions) {
                  const accessToken = await this.shareRequestedCallback();
                  // screen share の role, mediaType は固定
                  const postMessageParameters = {
                      type: 'connectShare',
                      clientId: this.clientId,
                      accessToken: accessToken,
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
                      this.dispatchEvent(new ErrorEvent('error', error));
                      throw error;
                  }
              }
              else if (data.type === 'log') {
                  const callback = this.logCallbacks.get(data.logType);
                  if (callback) {
                      if (data.error) {
                          const error = new LSConferenceIframeError(REQUEST_ERRORS['GetReportFailed']);
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
                      throw new LSConferenceIframeError(INTERNAL_ERRORS['InternalError5001']);
                  }
              }
              else if (data.type === 'disconnected') {
                  this.dispatchEvent(new Event('disconnected'));
              }
              else if (data.type === 'remoteTrackAdded') {
                  this.dispatchEvent(new Event('remoteTrackAdded'));
              }
              else if (data.type === 'getDeviceFailed') {
                  const error = new LSConferenceIframeError(REQUEST_ERRORS['GetDeviceFailed']);
                  this.dispatchEvent(new ErrorEvent('error', error));
              }
              else if (data.type === 'error' && data.error) {
                  const eventInitDict = {
                      error: data.error,
                      message: `code: ${data.error.detail.code}, type: ${data.error.detail.type}, error: ${data.error.detail.error}`,
                  };
                  this.dispatchEvent(new ErrorEvent('error', eventInitDict));
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
          if (parameters.toolbar !== undefined) {
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
          }
          if (parameters.isHiddenVideoMenuButton !== undefined && typeof parameters.isHiddenVideoMenuButton !== 'boolean') {
              return false;
          }
          if (parameters.isHiddenRecordingButton !== undefined && typeof parameters.isHiddenRecordingButton !== 'boolean') {
              return false;
          }
          if (parameters.podCoordinates !== undefined && parameters.podCoordinates.upperLeft !== undefined && !Array.isArray(parameters.podCoordinates.upperLeft)) {
              return false;
          }
          if (parameters.podCoordinates !== undefined && parameters.podCoordinates.lowerRight !== undefined && !Array.isArray(parameters.podCoordinates.lowerRight)) {
              return false;
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
              if (parameters.theme.onSurface !== undefined && typeof parameters.theme.onSurface !== 'string') {
                  return false;
              }
              if (parameters.theme.textSecondaryOnBackground !== undefined && typeof parameters.theme.textSecondaryOnBackground !== 'string') {
                  return false;
              }
              if (parameters.theme.components !== undefined) {
                  if (parameters.theme.components.participantsVideoContainer !== undefined) {
                      if (parameters.theme.components.participantsVideoContainer.background !== undefined && typeof parameters.theme.components.participantsVideoContainer.background !== 'string') {
                          return false;
                      }
                  }
                  if (parameters.theme.components.toolbar !== undefined) {
                      if (parameters.theme.components.toolbar.background !== undefined && typeof parameters.theme.components.toolbar.background !== 'string') {
                          return false;
                      }
                      if (parameters.theme.components.toolbar.iconColor !== undefined && typeof parameters.theme.components.toolbar.iconColor !== 'string') {
                          return false;
                      }
                  }
                  if (parameters.theme.components.video !== undefined) {
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
                  }
              }
          }
          return true;
      }
      validateJoinParameters(clientId, accessToken, connectOptions) {
          if (typeof clientId !== 'string') {
              return false;
          }
          if (typeof accessToken !== 'string') {
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
          return true;
      }
      __create(parameters) {
          return new Promise((resolve, reject) => {
              if (parameters.lsConfURL) {
                  this.lsConfURL = parameters.lsConfURL;
                  this.iframeElement.src = this.lsConfURL;
              }
              const loadTimer = setTimeout(() => {
                  // 5000 ms の間に iframe onload が発火しない場合は reject する
                  const error = new LSConferenceIframeError(REQUEST_ERRORS['CreateFailed']);
                  this.dispatchEvent(new ErrorEvent('error', error));
                  return reject(error);
              }, 5000);
              // allow =  "display-capture" は Chrome だと unknown parameter の warning が出るが
              // MDN の仕様では getDM する場合設定する必要があるので記載している
              // cf: https://developer.mozilla.org/en-US/docs/Web/API/Screen_Capture_API/Using_Screen_Capture
              this.iframeElement.allow = 'camera *;microphone *;autoplay *;display-capture *; fullscreen *';
              this.parentElement.appendChild(this.iframeElement);
              this.iframeElement.onload = () => {
                  // Safari では onload 時に即時に postMessage することができないため、500 ms 遅延させて postMessage を実行する
                  setTimeout(() => {
                      if (!this.iframeElement.contentWindow) {
                          throw new LSConferenceIframeError(INTERNAL_ERRORS['InternalError5001']);
                      }
                      const postMessageParameters = {
                          type: 'create',
                          origin: location.href,
                          parameters: {
                              defaultLayout: parameters.defaultLayout,
                              isHiddenVideoMenuButton: parameters.isHiddenVideoMenuButton,
                              isHiddenRecordingButton: parameters.isHiddenRecordingButton,
                              toolbar: parameters.toolbar,
                              podCoordinates: parameters.podCoordinates,
                              thetaZoomMaxRange: parameters.thetaZoomMaxRange,
                              theme: parameters.theme,
                          },
                      };
                      try {
                          this.iframeElement.contentWindow.postMessage(postMessageParameters, this.lsConfURL);
                      }
                      catch (e) {
                          const error = new LSConferenceIframeError(REQUEST_ERRORS['CreateFailed']);
                          this.dispatchEvent(new ErrorEvent('error', error));
                          return reject(error);
                      }
                      this.setWindowMessageCallback();
                      clearTimeout(loadTimer);
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
                  instance.dispatchEvent(new ErrorEvent('error', error));
                  return reject(error);
              }
              if (!instance.validateCreateParameters(parameters)) {
                  const error = new LSConferenceIframeError(REQUEST_ERRORS['CreateArgsInvalid']);
                  instance.dispatchEvent(new ErrorEvent('error', error));
                  return reject(error);
              }
              instance
                  .__create(parameters)
                  .then(() => {
                  resolve(instance);
              })
                  .catch((e) => {
                  //XXX(kdxu): __create 内で dispatch error event を行っているため、この時点では error event を dispatch しない
                  reject(e);
              });
          });
      }
      async join(clientId, accessToken, connectOptions) {
          if (!this.iframeElement.contentWindow) {
              throw new LSConferenceIframeError(INTERNAL_ERRORS['InternalError5001']);
          }
          if (!this.validateJoinParameters(clientId, accessToken, connectOptions)) {
              const error = new LSConferenceIframeError(REQUEST_ERRORS['JoinArgsInvalid']);
              this.dispatchEvent(new ErrorEvent('error', error));
              throw error;
          }
          // optionalパラメータのデフォルト値の設定
          connectOptions.signalingURL = connectOptions.signalingURL || DEFAULT_SIGNALING_URL;
          connectOptions.maxVideoBitrate = connectOptions.maxVideoBitrate || DEFAULT_MAX_BITRATE;
          connectOptions.maxShareBitrate = connectOptions.maxShareBitrate || DEFAULT_MAX_BITRATE;
          connectOptions.useDummyDevice = connectOptions.useDummyDevice || DEFAULT_USE_DUMMY_DEVICE;
          // video audio の role, mediaType は固定
          const postMessageParameters = {
              type: 'connect',
              clientId: clientId,
              accessToken: accessToken,
              role: 'sendrecv',
              mediaType: 'videoaudio',
              connectOptions: connectOptions,
          };
          try {
              this.iframeElement.contentWindow.postMessage(postMessageParameters, this.lsConfURL);
          }
          catch (e) {
              const error = new LSConferenceIframeError(REQUEST_ERRORS['JoinFailed']);
              this.dispatchEvent(new ErrorEvent('error', error));
              throw error;
          }
          this.clientId = clientId;
          this.connectOptions = connectOptions;
      }
      leave() {
          return new Promise((resolve, reject) => {
              if (!this.iframeElement.contentWindow) {
                  throw new LSConferenceIframeError(INTERNAL_ERRORS['InternalError5001']);
              }
              const postMessageParameters = {
                  type: 'leave',
              };
              try {
                  this.iframeElement.contentWindow.postMessage(postMessageParameters, this.lsConfURL);
              }
              catch (e) {
                  const error = new LSConferenceIframeError(REQUEST_ERRORS['CloseFailed']);
                  this.dispatchEvent(new ErrorEvent('error', error));
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
      setCameraMute(isEnabled) {
          console.log('setCameraMute', isEnabled);
          return new Promise((resolve, reject) => {
              if (!this.iframeElement.contentWindow) {
                  return reject(new LSConferenceIframeError(INTERNAL_ERRORS['InternalError5001']));
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
                  this.dispatchEvent(new ErrorEvent('error', error));
                  return reject(error);
              }
              return resolve();
          });
      }
      setMicMute(isEnabled) {
          console.log('setMicMute', isEnabled);
          return new Promise((resolve, reject) => {
              if (!this.iframeElement.contentWindow) {
                  return reject(new LSConferenceIframeError(INTERNAL_ERRORS['InternalError5001']));
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
                  this.dispatchEvent(new ErrorEvent('error', error));
                  return reject(error);
              }
              return resolve();
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
                  this.dispatchEvent(new ErrorEvent('error', error));
                  return reject(error);
              }
          });
      }
      getVideoAudioLog(filterOption) {
          return this.getReport('VideoAudioLog', filterOption);
      }
      getScreenShareLog(filterOption) {
          return this.getReport('ScreenShareLog', filterOption);
      }
      getVideoAudioStats() {
          return this.getReport('VideoAudioStats');
      }
      getScreenShareStats() {
          return this.getReport('ScreenShareStats');
      }
      changeLayout(layout) {
          return new Promise((resolve, reject) => {
              if (!this.iframeElement.contentWindow) {
                  return reject(new LSConferenceIframeError(INTERNAL_ERRORS['InternalError5001']));
              }
              const postMessageParameters = {
                  type: 'changeLayout',
                  layout: layout,
              };
              try {
                  this.iframeElement.contentWindow.postMessage(postMessageParameters, this.lsConfURL);
              }
              catch (e) {
                  const error = new LSConferenceIframeError(REQUEST_ERRORS['ChangeLayoutFailed']);
                  this.dispatchEvent(new ErrorEvent('error', error));
                  return reject(error);
              }
              return resolve();
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
          if (!(event instanceof Event)) {
              throw new TypeError(`Failed to execute 'dispatchEvent' on '${this.constructor.name}': parameter 1 is not of type 'Event'.`);
          }
          const type = event.type;
          const listeners = this.eventListeners.get(type);
          if (listeners) {
              listeners.forEach(({ listener, options }) => {
                  listener.call(this, event);
                  if (options && !options.once)
                      return;
                  this.removeEventListener(event.type, listener, options);
              });
          }
      }
  }

  return LSConferenceIframe;

})));
