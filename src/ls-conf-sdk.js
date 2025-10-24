/**
 * ls-conf-sdk
 * ls-conf-sdk
 * @version: 5.10.0
 **/

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.LSConferenceIframe = {}));
})(this, (function (exports) { 'use strict';

	var AsyncLock = function (opts) {
		opts = opts || {};

		this.Promise = opts.Promise || Promise;

		// format: {key : [fn, fn]}
		// queues[key] = null indicates no job running for key
		this.queues = Object.create(null);

		// lock is reentrant for same domain
		this.domainReentrant = opts.domainReentrant || false;
		if (this.domainReentrant) {
			if (typeof process === 'undefined' || typeof process.domain === 'undefined') {
				throw new Error(
					'Domain-reentrant locks require `process.domain` to exist. Please flip `opts.domainReentrant = false`, ' +
					'use a NodeJS version that still implements Domain, or install a browser polyfill.');
			}
			// domain of current running func {key : fn}
			this.domains = Object.create(null);
		}

		this.timeout = opts.timeout || AsyncLock.DEFAULT_TIMEOUT;
		this.maxOccupationTime = opts.maxOccupationTime || AsyncLock.DEFAULT_MAX_OCCUPATION_TIME;
		this.maxExecutionTime = opts.maxExecutionTime || AsyncLock.DEFAULT_MAX_EXECUTION_TIME;
		if (opts.maxPending === Infinity || (Number.isInteger(opts.maxPending) && opts.maxPending >= 0)) {
			this.maxPending = opts.maxPending;
		} else {
			this.maxPending = AsyncLock.DEFAULT_MAX_PENDING;
		}
	};

	AsyncLock.DEFAULT_TIMEOUT = 0; //Never
	AsyncLock.DEFAULT_MAX_OCCUPATION_TIME = 0; //Never
	AsyncLock.DEFAULT_MAX_EXECUTION_TIME = 0; //Never
	AsyncLock.DEFAULT_MAX_PENDING = 1000;

	/**
	 * Acquire Locks
	 *
	 * @param {String|Array} key 	resource key or keys to lock
	 * @param {function} fn 	async function
	 * @param {function} cb 	callback function, otherwise will return a promise
	 * @param {Object} opts 	options
	 */
	AsyncLock.prototype.acquire = function (key, fn, cb, opts) {
		if (Array.isArray(key)) {
			return this._acquireBatch(key, fn, cb, opts);
		}

		if (typeof (fn) !== 'function') {
			throw new Error('You must pass a function to execute');
		}

		// faux-deferred promise using new Promise() (as Promise.defer is deprecated)
		var deferredResolve = null;
		var deferredReject = null;
		var deferred = null;

		if (typeof (cb) !== 'function') {
			opts = cb;
			cb = null;

			// will return a promise
			deferred = new this.Promise(function(resolve, reject) {
				deferredResolve = resolve;
				deferredReject = reject;
			});
		}

		opts = opts || {};

		var resolved = false;
		var timer = null;
		var occupationTimer = null;
		var executionTimer = null;
		var self = this;

		var done = function (locked, err, ret) {

			if (occupationTimer) {
				clearTimeout(occupationTimer);
				occupationTimer = null;
			}

			if (executionTimer) {
				clearTimeout(executionTimer);
				executionTimer = null;
			}

			if (locked) {
				if (!!self.queues[key] && self.queues[key].length === 0) {
					delete self.queues[key];
				}
				if (self.domainReentrant) {
					delete self.domains[key];
				}
			}

			if (!resolved) {
				if (!deferred) {
					if (typeof (cb) === 'function') {
						cb(err, ret);
					}
				}
				else {
					//promise mode
					if (err) {
						deferredReject(err);
					}
					else {
						deferredResolve(ret);
					}
				}
				resolved = true;
			}

			if (locked) {
				//run next func
				if (!!self.queues[key] && self.queues[key].length > 0) {
					self.queues[key].shift()();
				}
			}
		};

		var exec = function (locked) {
			if (resolved) { // may due to timed out
				return done(locked);
			}

			if (timer) {
				clearTimeout(timer);
				timer = null;
			}

			if (self.domainReentrant && locked) {
				self.domains[key] = process.domain;
			}

			var maxExecutionTime = opts.maxExecutionTime || self.maxExecutionTime;
			if (maxExecutionTime) {
				executionTimer = setTimeout(function () {
					if (!!self.queues[key]) {
						done(locked, new Error('Maximum execution time is exceeded ' + key));
					}
				}, maxExecutionTime);
			}

			// Callback mode
			if (fn.length === 1) {
				var called = false;
				try {
					fn(function (err, ret) {
						if (!called) {
							called = true;
							done(locked, err, ret);
						}
					});
				} catch (err) {
					// catching error thrown in user function fn
					if (!called) {
						called = true;
						done(locked, err);
					}
				}
			}
			else {
				// Promise mode
				self._promiseTry(function () {
					return fn();
				})
				.then(function(ret){
					done(locked, undefined, ret);
				}, function(error){
					done(locked, error);
				});
			}
		};

		if (self.domainReentrant && !!process.domain) {
			exec = process.domain.bind(exec);
		}

		var maxPending = opts.maxPending || self.maxPending;

		if (!self.queues[key]) {
			self.queues[key] = [];
			exec(true);
		}
		else if (self.domainReentrant && !!process.domain && process.domain === self.domains[key]) {
			// If code is in the same domain of current running task, run it directly
			// Since lock is re-enterable
			exec(false);
		}
		else if (self.queues[key].length >= maxPending) {
			done(false, new Error('Too many pending tasks in queue ' + key));
		}
		else {
			var taskFn = function () {
				exec(true);
			};
			if (opts.skipQueue) {
				self.queues[key].unshift(taskFn);
			} else {
				self.queues[key].push(taskFn);
			}

			var timeout = opts.timeout || self.timeout;
			if (timeout) {
				timer = setTimeout(function () {
					timer = null;
					done(false, new Error('async-lock timed out in queue ' + key));
				}, timeout);
			}
		}

		var maxOccupationTime = opts.maxOccupationTime || self.maxOccupationTime;
			if (maxOccupationTime) {
				occupationTimer = setTimeout(function () {
					if (!!self.queues[key]) {
						done(false, new Error('Maximum occupation time is exceeded in queue ' + key));
					}
				}, maxOccupationTime);
			}

		if (deferred) {
			return deferred;
		}
	};

	/*
	 * Below is how this function works:
	 *
	 * Equivalent code:
	 * self.acquire(key1, function(cb){
	 *     self.acquire(key2, function(cb){
	 *         self.acquire(key3, fn, cb);
	 *     }, cb);
	 * }, cb);
	 *
	 * Equivalent code:
	 * var fn3 = getFn(key3, fn);
	 * var fn2 = getFn(key2, fn3);
	 * var fn1 = getFn(key1, fn2);
	 * fn1(cb);
	 */
	AsyncLock.prototype._acquireBatch = function (keys, fn, cb, opts) {
		if (typeof (cb) !== 'function') {
			opts = cb;
			cb = null;
		}

		var self = this;
		var getFn = function (key, fn) {
			return function (cb) {
				self.acquire(key, fn, cb, opts);
			};
		};

		var fnx = keys.reduceRight(function (prev, key) {
			return getFn(key, prev);
		}, fn);

		if (typeof (cb) === 'function') {
			fnx(cb);
		}
		else {
			return new this.Promise(function (resolve, reject) {
				// check for promise mode in case keys is empty array
				if (fnx.length === 1) {
					fnx(function (err, ret) {
						if (err) {
							reject(err);
						}
						else {
							resolve(ret);
						}
					});
				} else {
					resolve(fnx());
				}
			});
		}
	};

	/*
	 *	Whether there is any running or pending asyncFunc
	 *
	 *	@param {String} key
	 */
	AsyncLock.prototype.isBusy = function (key) {
		if (!key) {
			return Object.keys(this.queues).length > 0;
		}
		else {
			return !!this.queues[key];
		}
	};

	/**
	 * Promise.try() implementation to become independent of Q-specific methods
	 */
	AsyncLock.prototype._promiseTry = function(fn) {
		try {
			return this.Promise.resolve(fn());
		} catch (e) {
			return this.Promise.reject(e);
		}
	};

	var lib = AsyncLock;

	var asyncLock = lib;

	// LSConfのイベント
	class LSConfEvent extends CustomEvent {
	    constructor(type, eventInit) {
	        super(type, eventInit);
	    }
	}
	// エラー内容
	class ErrorData {
	    detail;
	    data;
	    constructor(errorName, data) {
	        const code = this.getErrorCode(errorName);
	        const category = Math.floor(code / 1000);
	        const type = category === 4 ? 'RequestError' : 'InternalError';
	        this.detail = { code, type, error: errorName };
	        this.data = data;
	    }
	    getErrorCode = (errorName) => {
	        switch (errorName) {
	            // RequestError
	            case 'CreateArgsInvalid':
	                return 4010;
	            case 'JoinArgsInvalid':
	                return 4020;
	            case 'SetArgsInvalid':
	                return 4030;
	            case 'CreateFailed':
	                return 4040;
	            case 'CreateTimeout':
	                return 4041;
	            case 'JoinFailed':
	                return 4050;
	            case 'JoinFailedTimeout':
	                return 4051;
	            case 'CloseFailed':
	                return 4060;
	            case 'CameraMuteFailed':
	                return 4070;
	            case 'MicMuteFailed':
	                return 4080;
	            case 'ShareRequestFailed':
	                return 4090;
	            case 'GetReportFailed':
	                return 4100;
	            case 'GetReportError':
	                return 4101;
	            case 'ChangeLayoutFailed':
	                return 4110;
	            case 'GetDeviceFailed':
	                return 4120;
	            case 'GetSubViewsFailed':
	                return 4130;
	            case 'GetPoVFailed':
	                return 4140;
	            case 'GetPoVError':
	                return 4141;
	            case 'GetPoVArgsInvalid':
	                return 4150;
	            case 'SetPoVFailed':
	                return 4160;
	            case 'SetPoVError':
	                return 4161;
	            case 'SetPoVArgsInvalid':
	                return 4170;
	            case 'ShareRequestArgsInvalid':
	                return 4180;
	            case 'HighlightArgsInvalid':
	                return 4190;
	            case 'HighlightFailed':
	                return 4200;
	            case 'HighlightError':
	                return 4210;
	            case 'AddRecordingMemberArgsInvalid':
	                return 4220;
	            case 'AddRecordingMemberFailed':
	                return 4230;
	            case 'AddRecordingMemberError':
	                return 4240;
	            case 'RemoveRecordingMemberArgsInvalid':
	                return 4250;
	            case 'RemoveRecordingMemberFailed':
	                return 4260;
	            case 'RemoveRecordingMemberError':
	                return 4270;
	            case 'SetCameraDeviceFailed':
	                return 4280;
	            case 'SetMicDeviceFailed':
	                return 4290;
	            case 'GetMediaDevicesFailed':
	                return 4300;
	            case 'GetMediaDevicesError':
	                return 4310;
	            case 'GetCaptureImageFailed':
	                return 4320;
	            case 'GetCaptureImageError':
	                return 4330;
	            case 'GetCaptureImageErrorCameraMuted':
	                return 4331;
	            case 'GetCaptureImageArgsInvalid':
	                return 4340;
	            case 'StartRecordingFailed':
	                return 4350;
	            case 'StartReceiveVideoFailed':
	                return 4360;
	            case 'StartReceiveVideoError':
	                return 4370;
	            case 'StartReceiveVideoArgsInvalid':
	                return 4380;
	            case 'StopReceiveVideoFailed':
	                return 4390;
	            case 'StopReceiveVideoError':
	                return 4400;
	            case 'StopReceiveVideoArgsInvalid':
	                return 4410;
	            case 'GetLSConfLogFailed':
	                return 4420;
	            case 'EnablePointerFailed':
	                return 4440;
	            case 'UpdatePointerArgsInvalid':
	                return 4450;
	            case 'ModeInvalid':
	                return 4480;
	            case 'ChangeLayoutArgsInvalid':
	                return 4490;
	            case 'EnableZoomFailed':
	                return 4500;
	            case 'EnableZoomError':
	                return 4510;
	            case 'EnableZoomArgsInvalid':
	                return 4520;
	            case 'GetStatsArgsInvalid':
	                return 4530;
	            case 'GetStatsFailed':
	                return 4540;
	            case 'GetStatsError':
	                return 4550;
	            case 'SetRotationVectorFailed':
	                return 4560;
	            case 'SetRotationVectorError':
	                return 4570;
	            case 'SetRotationVectorArgsInvalid':
	                return 4580;
	            case 'CreateTypeInvalid':
	                return 4590;
	            case 'UpdateStrokeArgsInvalid':
	                return 4600;
	            case 'AddVideoSourceFailed':
	                return 4620;
	            case 'AddVideoSourceError':
	                return 4630;
	            case 'AddVideoSourceArgsInvalid':
	                return 4640;
	            case 'MediaSourceError':
	                return 4650;
	            case 'AddImageSourceFailed':
	                return 4660;
	            case 'AddImageSourceError':
	                return 4670;
	            case 'AddImageSourceArgsInvalid':
	                return 4680;
	            case 'RemoveImageSourceFailed':
	                return 4690;
	            case 'RemoveImageSourceError':
	                return 4700;
	            case 'RemoveImageSourceArgsInvalid':
	                return 4710;
	            case 'ChangePlayerStateFailed':
	                return 4720;
	            case 'ChangePlayerStateArgsInvalid':
	                return 4730;
	            case 'SetSpeakerVolumeFailed':
	                return 4740;
	            case 'SetSpeakerVolumeArgsInvalid':
	                return 4750;
	            case 'SetSeekPositionFailed':
	                return 4760;
	            case 'SetSeekPositionArgsInvalid':
	                return 4770;
	            case 'SetVideoSendBitrateFailed':
	                return 4780;
	            case 'SetVideoSendBitrateArgsInvalid':
	                return 4800;
	            case 'SetVideoSendFramerateFailed':
	                return 4810;
	            case 'SetVideoSendFramerateError':
	                return 4820;
	            case 'SetVideoSendFramerateArgsInvalid':
	                return 4830;
	            case 'SetVideoAudioConstraintsFailed':
	                return 4840;
	            case 'SetVideoAudioConstraintsError':
	                return 4850;
	            case 'SetVideoAudioConstraintsArgsInvalid':
	                return 4860;
	            case 'MoveSubViewFailed':
	                return 4870;
	            case 'MoveSubViewError':
	                return 4880;
	            case 'MoveSubViewArgsInvalid':
	                return 4890;
	            case 'GetDisplayMediaError':
	                return 4900;
	            case 'GetFileTimeout':
	                return 4910;
	            case 'SharePoVErrorCameraMuted':
	                return 4920;
	            // InternalError
	            case 'InternalError5001':
	                return 5001;
	            case 'InternalError5002':
	                return 5002;
	            case 'InternalError5003':
	                return 5003;
	            case 'InternalError5004':
	                return 5004;
	            case 'InternalError5005':
	                return 5005;
	            // エラーコードが存在しない場合は 5000 で返す
	            default:
	                return 5000;
	        }
	    };
	    toReportString = () => {
	        // dataが設定されている場合はdataの内容を返す
	        if (this.data) {
	            // インデント(半角スペース4桁)と改行で整形
	            return `${JSON.stringify(this.data, (_key, value) => {
                // JSON に自動変換されないオブジェクトはここで個別に変換する
                if (value instanceof DOMException) {
                    return { message: value.message, name: value.name };
                }
                return value;
            }, 4)}`;
	        }
	        else {
	            return `code: ${this.detail.code}, type: ${this.detail.type}, error: ${this.detail.error}`;
	        }
	    };
	}
	// SDKエラー内容
	class SDKErrorData extends ErrorData {
	    constructor(detail, toReportString, data) {
	        super('SDKError');
	        this.detail = detail;
	        this.toReportString = () => {
	            return toReportString;
	        };
	        this.data = data;
	    }
	}
	// LSConfのエラーイベント
	class LSConfErrorEvent extends ErrorEvent {
	    toReportString;
	    constructor(errorData) {
	        const message = `code: ${errorData.detail.code}, type: ${errorData.detail.type}, error: ${errorData.detail.error}`;
	        super('error', { error: errorData, message: message });
	        this.toReportString = () => {
	            return errorData.toReportString();
	        };
	    }
	}
	// LSConfのエラーオブジェクト
	class LSConfError extends Error {
	    detail;
	    data;
	    toReportString;
	    constructor(errorData) {
	        const message = `code: ${errorData.detail.code}, type: ${errorData.detail.type}, error: ${errorData.detail.error}`;
	        super(message);
	        this.detail = errorData.detail;
	        this.data = errorData.data;
	        this.toReportString = () => {
	            return errorData.toReportString();
	        };
	    }
	}
	// ls-conf-sdk のバージョン
	const LS_CONF_SDK_VERSION = '5.10.0';
	const DEFAULT_LS_CONF_URL = `https://conf.livestreaming.mw.smart-integration.ricoh.com/${LS_CONF_SDK_VERSION}/index.html`;
	const DEFAULT_SIGNALING_URL = 'wss://signaling.livestreaming.mw.smart-integration.ricoh.com/v1/room';
	const DEFAULT_MAX_BITRATE = 2000;
	const DEFAULT_USE_DUMMY_DEVICE = false;
	const DEFAULT_VIDEO_CODEC = 'h264';
	const DEFAULT_CREATE_TIMEOUT_MSEC = 15000;
	const DEFAULT_JOIN_TIMEOUT_MSEC = 10000;
	const DEFAULT_AUDIO_MUTE_TYPE = 'soft';
	const DEFAULT_MODE = 'normal';
	const DEFAULT_MESSAGE_QUEUE_TIMEOUT_MSEC = 100;
	const DEFAULT_ICE_SERVERS_PROTOCOL = 'all';
	const DEFAULT_ENABLE_SPEAKER = true;
	// API の実行時間の上限
	// この時間以上のタイムアウトを設ける場合はここの値をタイムアウト以上の値に更新すること
	const DEFAULT_MAX_EXECUTION_TIME = 20000;
	const DEFAULT_MAX_EXECUTION_TIME_USE_FETCH_API = 65000;
	class LSConferenceIframe {
	    parentElement;
	    iframeElement;
	    lsConfURL;
	    clientId;
	    connectOptions;
	    eventListeners;
	    applicationEventListeners;
	    state;
	    shareRequestedCallback;
	    joinCallback;
	    getSubViewsCallback;
	    highlightCallback;
	    getPoVCallback;
	    setPoVCallback;
	    setRotationVectorCallback;
	    addRecordingMemberCallback;
	    removeRecordingMemberCallback;
	    getReportCallbacks = new Map();
	    getMediaDevicesCallback;
	    getCaptureImageCallback;
	    updateCurrentTimeCallback;
	    getLSConfLogCallback;
	    getStatsCallback;
	    startReceiveVideoCallback;
	    stopReceiveVideoCallback;
	    enableZoomCallback;
	    addVideoSourceCallback;
	    addImageSourceCallback;
	    removeImageSourceCallback;
	    changePlayerStateCallback;
	    setSeekPositionCallback;
	    setSpeakerVolumeCallback;
	    setVideoSendBitrateCallback;
	    setVideoSendFramerateCallback;
	    setVideoAudioConstraintsCallback;
	    moveSubViewCallback;
	    static _handleWindowMessage;
	    parametersQueue;
	    static asyncLock = new asyncLock({ maxExecutionTime: DEFAULT_MAX_EXECUTION_TIME });
	    static useFetchAsyncLock = new asyncLock({ maxExecutionTime: DEFAULT_MAX_EXECUTION_TIME_USE_FETCH_API });
	    constructor(parentElement) {
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
	        this.setRotationVectorCallback = { success: () => { }, error: () => { } };
	        this.addRecordingMemberCallback = { success: () => { }, error: () => { } };
	        this.removeRecordingMemberCallback = { success: () => { }, error: () => { } };
	        this.getMediaDevicesCallback = { success: () => { }, error: () => { } };
	        this.getCaptureImageCallback = { success: () => { }, error: () => { } };
	        this.updateCurrentTimeCallback = { success: () => { }, error: () => { } };
	        this.getLSConfLogCallback = { success: () => { }, error: () => { } };
	        this.getStatsCallback = { success: () => { }, error: () => { } };
	        this.startReceiveVideoCallback = { success: () => { }, error: () => { } };
	        this.stopReceiveVideoCallback = { success: () => { }, error: () => { } };
	        this.enableZoomCallback = { success: () => { }, error: () => { } };
	        this.addVideoSourceCallback = { success: () => { }, error: () => { } };
	        this.addImageSourceCallback = { success: () => { }, error: () => { } };
	        this.removeImageSourceCallback = { success: () => { }, error: () => { } };
	        this.changePlayerStateCallback = { success: () => { }, error: () => { } };
	        this.setSeekPositionCallback = { success: () => { }, error: () => { } };
	        this.setSpeakerVolumeCallback = { success: () => { }, error: () => { } };
	        this.setVideoSendBitrateCallback = { success: () => { }, error: () => { } };
	        this.setVideoSendFramerateCallback = { success: () => { }, error: () => { } };
	        this.setVideoAudioConstraintsCallback = { success: () => { }, error: () => { } };
	        this.moveSubViewCallback = { success: () => { }, error: () => { } };
	        this.eventListeners = new Map();
	        this.applicationEventListeners = new Map();
	        this.parametersQueue = new Map();
	    }
	    handleWindowMessage(event) {
	        const data = event.data;
	        if (!this.iframeElement.contentWindow) {
	            throw new LSConfError(new ErrorData('InternalError5001'));
	        }
	        if (data.type === 'shareRequest' && this.connectOptions) {
	            void (async () => {
	                let accessToken;
	                try {
	                    accessToken = await this.shareRequestedCallback();
	                }
	                catch (e) {
	                    console.warn('Exception occurred in onShareRequested.', e);
	                }
	                if (!accessToken || typeof accessToken !== 'string') {
	                    this.dispatchEvent(new LSConfErrorEvent(new ErrorData('ShareRequestArgsInvalid')));
	                    return;
	                }
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
	                    throw new LSConfError(new ErrorData('InternalError5001'));
	                }
	                try {
	                    this.iframeElement.contentWindow.postMessage(postMessageParameters, this.lsConfURL);
	                }
	                catch (e) {
	                    const error = new LSConfError(new ErrorData('ShareRequestFailed'));
	                    throw error;
	                }
	            })();
	        }
	        else if (data.type === 'getReport') {
	            const callback = this.getReportCallbacks.get(data.logType);
	            if (callback) {
	                if (data.error) {
	                    let error = new LSConfError(new ErrorData('GetReportError'));
	                    if (data.errorType === 'CreateTypeInvalid') {
	                        error = new LSConfError(new ErrorData('CreateTypeInvalid'));
	                    }
	                    callback.error(error);
	                }
	                else {
	                    callback.success(data.log);
	                }
	                this.getReportCallbacks.delete(data.logType);
	            }
	        }
	        else if (data.type === 'recording') {
	            if (data.error) {
	                throw new LSConfError(new ErrorData('InternalError5002'));
	            }
	        }
	        else if (data.type === 'startRecording') {
	            if (data.error) {
	                this.dispatchEvent(new LSConfErrorEvent(new ErrorData('StartRecordingFailed')));
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
	                let error = new LSConfError(new ErrorData('AddRecordingMemberError'));
	                if (data.errorType === 'CreateTypeInvalid') {
	                    error = new LSConfError(new ErrorData('CreateTypeInvalid'));
	                }
	                this.addRecordingMemberCallback.error(error);
	            }
	            else {
	                this.addRecordingMemberCallback.success();
	            }
	        }
	        else if (data.type === 'removeRecordingMember') {
	            if (data.error) {
	                let error = new LSConfError(new ErrorData('RemoveRecordingMemberError'));
	                if (data.errorType === 'CreateTypeInvalid') {
	                    error = new LSConfError(new ErrorData('CreateTypeInvalid'));
	                }
	                this.removeRecordingMemberCallback.error(error);
	            }
	            else {
	                this.removeRecordingMemberCallback.success();
	            }
	        }
	        else if (data.type === 'connected') {
	            if (data.error) {
	                this.state = 'created';
	                let error = new LSConfError(new ErrorData('JoinFailed'));
	                if (data.errorType === 'CreateTypeInvalid') {
	                    error = new LSConfError(new ErrorData('CreateTypeInvalid'));
	                }
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
	                const error = new LSConfError(new ErrorData('JoinFailed'));
	                this.joinCallback.error(error);
	            }
	            else {
	                this.joinCallback.accepted();
	            }
	        }
	        else if (data.type === 'mediaOpen') {
	            this.dispatchEvent(new LSConfEvent('mediaOpen'));
	        }
	        else if (data.type === 'disconnected') {
	            this.state = 'created';
	            this.dispatchEvent(new LSConfEvent('disconnected'));
	        }
	        else if (data.type === 'screenShareConnected') {
	            this.dispatchEvent(new LSConfEvent('screenShareConnected'));
	        }
	        else if (data.type === 'screenShareMediaOpen') {
	            this.dispatchEvent(new LSConfEvent('screenShareMediaOpen'));
	        }
	        else if (data.type === 'screenShareDisconnected') {
	            this.dispatchEvent(new LSConfEvent('screenShareDisconnected'));
	        }
	        else if (data.type === 'remoteConnectionAdded') {
	            const event = new LSConfEvent('remoteConnectionAdded', {
	                detail: {
	                    connectionId: data.connectionId,
	                    username: data.username,
	                    parentConnectionId: data.parentConnectionId,
	                },
	            });
	            this.dispatchEvent(event);
	        }
	        else if (data.type === 'changeMediaStability') {
	            const event = new LSConfEvent('changeMediaStability', {
	                detail: {
	                    kind: data.kind,
	                    stability: data.stability,
	                },
	            });
	            this.dispatchEvent(event);
	        }
	        else if (data.type === 'userOperation') {
	            const event = new LSConfEvent('userOperation', {
	                detail: {
	                    type: data.detail.type,
	                    detail: data.detail.detail,
	                },
	            });
	            this.dispatchEvent(event);
	        }
	        else if (data.type === 'remoteConnectionRemoved') {
	            const event = new LSConfEvent('remoteConnectionRemoved', {
	                detail: {
	                    connectionId: data.connectionId,
	                    username: data.username,
	                    parentConnectionId: data.parentConnectionId,
	                },
	            });
	            this.dispatchEvent(event);
	        }
	        else if (data.type === 'mediaSourceAdded') {
	            const event = new LSConfEvent('mediaSourceAdded', {
	                detail: {
	                    kind: data.kind,
	                    subView: data.subView,
	                },
	            });
	            this.dispatchEvent(event);
	        }
	        else if (data.type === 'mediaSourceRemoved') {
	            const event = new LSConfEvent('mediaSourceRemoved', {
	                detail: {
	                    kind: data.kind,
	                    subView: data.subView,
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
	        else if (data.type === 'GetDisplayMediaError') {
	            this.dispatchEvent(new LSConfErrorEvent(new ErrorData('GetDisplayMediaError', data.data)));
	        }
	        else if (data.type === 'getDeviceFailed') {
	            let error = new LSConfError(new ErrorData('GetDeviceFailed'));
	            const hasDataProperty = Object.prototype.hasOwnProperty.call(data, 'data');
	            if (hasDataProperty) {
	                error = new LSConfError(new ErrorData('GetDeviceFailed', data.data));
	            }
	            this.joinCallback.error(error);
	        }
	        else if (data.type === 'getSubViews') {
	            this.getSubViewsCallback.success(data.subViews);
	        }
	        else if (data.type === 'getSelfSubViewFailed') {
	            if (data.error) {
	                throw new LSConfError(new ErrorData('InternalError5003'));
	            }
	        }
	        else if (data.type === 'highlight') {
	            if (data.error) {
	                const error = new LSConfError(new ErrorData('HighlightError', data.data));
	                this.highlightCallback.error(error);
	            }
	            else {
	                this.highlightCallback.success();
	            }
	        }
	        else if (data.type === 'sharePoV') {
	            if (data.error) {
	                this.dispatchEvent(new LSConfErrorEvent(new ErrorData('SharePoVErrorCameraMuted', data.data)));
	            }
	            else {
	                const { subView, poV } = data;
	                this.dispatchEvent(new LSConfEvent('sharePoV', { detail: { subView, poV } }));
	            }
	        }
	        else if (data.type === 'getPoV') {
	            if (data.error) {
	                const error = new LSConfError(new ErrorData('GetPoVError'));
	                this.getPoVCallback.error(error);
	            }
	            else {
	                this.getPoVCallback.success(data.poV);
	            }
	        }
	        else if (data.type === 'setPoV') {
	            if (data.error) {
	                const error = new LSConfError(new ErrorData('SetPoVError'));
	                this.setPoVCallback.error(error);
	            }
	            else {
	                this.setPoVCallback.success();
	            }
	        }
	        else if (data.type === 'setRotationVector') {
	            if (data.error) {
	                const error = new LSConfError(new ErrorData('SetRotationVectorError'));
	                this.setRotationVectorCallback.error(error);
	            }
	            else {
	                this.setRotationVectorCallback.success();
	            }
	        }
	        else if (data.type === 'getMediaDevices') {
	            if (data.error) {
	                let error = new LSConfError(new ErrorData('GetMediaDevicesError'));
	                const hasDataProperty = Object.prototype.hasOwnProperty.call(data, 'data');
	                if (hasDataProperty) {
	                    error = new LSConfError(new ErrorData('GetMediaDevicesError', data.data));
	                }
	                if (data.errorType === 'CreateTypeInvalid') {
	                    error = new LSConfError(new ErrorData('CreateTypeInvalid'));
	                }
	                this.getMediaDevicesCallback.error(error);
	            }
	            else {
	                this.getMediaDevicesCallback.success(data.devices);
	            }
	        }
	        else if (data.type === 'strokeUpdated') {
	            const { subView, stroke } = data;
	            this.dispatchEvent(new LSConfEvent('strokeUpdated', { detail: { subView, stroke } }));
	        }
	        else if (data.type === 'updateCurrentTime') {
	            if (data.error) {
	                // 現状 getCaptureImage 時しか呼ばれないため、エラー時は GetCaptureImageError を返す
	                const error = new LSConfError(new ErrorData('GetCaptureImageError'));
	                this.updateCurrentTimeCallback.error(error);
	            }
	            else {
	                this.updateCurrentTimeCallback.success();
	            }
	        }
	        else if (data.type === 'getCaptureImage') {
	            if (data.error) {
	                if (data.errorType === 'GetCaptureImageErrorCameraMuted') {
	                    const error = new LSConfError(new ErrorData('GetCaptureImageErrorCameraMuted'));
	                    this.getCaptureImageCallback.error(error);
	                }
	                else {
	                    const error = new LSConfError(new ErrorData('GetCaptureImageError'));
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
	            this.getLSConfLogCallback.success(data.lsConfLog);
	        }
	        else if (data.type === 'getStats') {
	            if (data.error) {
	                let error = new LSConfError(new ErrorData('GetStatsError'));
	                if (data.errorType === 'CreateTypeInvalid') {
	                    error = new LSConfError(new ErrorData('CreateTypeInvalid'));
	                }
	                this.getStatsCallback.error(error);
	            }
	            else {
	                this.getStatsCallback.success(data.stats);
	            }
	        }
	        else if (data.type === 'startReceiveVideo') {
	            if (data.error) {
	                let error = new LSConfError(new ErrorData('StartReceiveVideoError'));
	                if (data.errorType === 'CreateTypeInvalid') {
	                    error = new LSConfError(new ErrorData('CreateTypeInvalid'));
	                }
	                this.startReceiveVideoCallback.error(error);
	            }
	            else {
	                this.startReceiveVideoCallback.success();
	            }
	        }
	        else if (data.type === 'stopReceiveVideo') {
	            if (data.error) {
	                let error = new LSConfError(new ErrorData('StopReceiveVideoError'));
	                if (data.errorType === 'CreateTypeInvalid') {
	                    error = new LSConfError(new ErrorData('CreateTypeInvalid'));
	                }
	                this.stopReceiveVideoCallback.error(error);
	            }
	            else {
	                this.stopReceiveVideoCallback.success();
	            }
	        }
	        else if (data.type === 'enableZoom') {
	            if (data.error) {
	                const error = new LSConfError(new ErrorData('EnableZoomError'));
	                this.enableZoomCallback.error(error);
	            }
	            else {
	                this.enableZoomCallback.success();
	            }
	        }
	        else if (data.type === 'mediaDeviceChanged') {
	            const { deviceInfo, isMuted } = data;
	            this.dispatchEvent(new LSConfEvent('mediaDeviceChanged', {
	                detail: { deviceId: deviceInfo.deviceId, groupId: deviceInfo.groupId, kind: deviceInfo.kind, label: deviceInfo.label, isMuted, capabilities: deviceInfo.capabilities },
	            }));
	        }
	        else if (data.type === 'MediaSourceError') {
	            this.dispatchEvent(new LSConfErrorEvent(new ErrorData('MediaSourceError', { connectionId: data.connectionId, url: data.url })));
	        }
	        else if (data.type === 'playerStateChanged') {
	            const state = data.state;
	            const duration = data.duration;
	            const currentTime = data.currentTime;
	            const currentDate = data.currentDate;
	            const startedAt = data.startedAt;
	            const endedAt = data.endedAt;
	            this.dispatchEvent(new LSConfEvent('playerStateChanged', { detail: { state, duration, currentTime, startedAt, endedAt, currentDate } }));
	        }
	        else if (data.type === 'addVideoSource') {
	            if (data.error) {
	                let error;
	                if (data.errorType === 'GetFileTimeout') {
	                    error = new LSConfError(new ErrorData('GetFileTimeout', data.data));
	                }
	                else {
	                    error = new LSConfError(new ErrorData('AddVideoSourceError'));
	                }
	                this.addVideoSourceCallback.error(error);
	            }
	            else {
	                this.addVideoSourceCallback.success();
	            }
	        }
	        else if (data.type === 'addImageSource') {
	            if (data.error) {
	                let error;
	                if (data.errorType === 'GetFileTimeout') {
	                    error = new LSConfError(new ErrorData('GetFileTimeout', data.data));
	                }
	                else {
	                    error = new LSConfError(new ErrorData('AddImageSourceError'));
	                }
	                this.addImageSourceCallback.error(error);
	            }
	            else {
	                this.addImageSourceCallback.success();
	            }
	        }
	        else if (data.type === 'removeImageSource') {
	            if (data.error) {
	                const error = new LSConfError(new ErrorData('RemoveImageSourceError'));
	                this.removeImageSourceCallback.error(error);
	            }
	            else {
	                this.removeImageSourceCallback.success();
	            }
	        }
	        else if (data.type === 'changePlayerState') {
	            if (data.error) {
	                const error = new LSConfError(new ErrorData('ChangePlayerStateFailed'));
	                this.changePlayerStateCallback.error(error);
	            }
	            else {
	                this.changePlayerStateCallback.success();
	            }
	        }
	        else if (data.type === 'setSeekPosition') {
	            if (data.error) {
	                const error = new LSConfError(new ErrorData('SetSeekPositionFailed'));
	                this.setSeekPositionCallback.error(error);
	            }
	            else {
	                this.setSeekPositionCallback.success();
	            }
	        }
	        else if (data.type === 'setSpeakerVolume') {
	            if (data.error) {
	                const error = new LSConfError(new ErrorData('SetSpeakerVolumeFailed'));
	                this.setSpeakerVolumeCallback.error(error);
	            }
	            else {
	                this.setSpeakerVolumeCallback.success();
	            }
	        }
	        else if (data.type === 'setVideoSendBitrate') {
	            this.setVideoSendBitrateCallback.success();
	        }
	        else if (data.type === 'setVideoSendFramerate') {
	            if (data.error) {
	                const error = new LSConfError(new ErrorData('SetVideoSendFramerateError'));
	                this.setVideoSendFramerateCallback.error(error);
	            }
	            else {
	                this.setVideoSendFramerateCallback.success();
	            }
	        }
	        else if (data.type === 'setVideoAudioConstraints') {
	            if (data.error) {
	                const error = new LSConfError(new ErrorData('SetVideoAudioConstraintsError'));
	                this.setVideoAudioConstraintsCallback.error(error);
	            }
	            else {
	                this.setVideoAudioConstraintsCallback.success();
	            }
	        }
	        else if (data.type === 'moveSubView') {
	            if (data.error) {
	                const error = new LSConfError(new ErrorData('MoveSubViewError'));
	                this.moveSubViewCallback.error(error);
	            }
	            else {
	                this.moveSubViewCallback.success();
	            }
	        }
	        else if (data.type === 'createPlayer') {
	            if (data.error) {
	                if (data.errorType === 'GetFileTimeout') {
	                    this.dispatchEvent(new LSConfErrorEvent(new ErrorData('GetFileTimeout', data.data)));
	                }
	                else {
	                    this.dispatchEvent(new LSConfErrorEvent(new ErrorData('CreateFailed')));
	                }
	            }
	        }
	        else if (data.type === 'startCloudRecording') {
	            this.dispatchEvent(new LSConfEvent('startCloudRecording'));
	        }
	        else if (data.type === 'stopCloudRecording') {
	            this.dispatchEvent(new LSConfEvent('stopCloudRecording'));
	        }
	        else if (data.type === 'log') {
	            const event = new LSConfEvent('log', {
	                detail: {
	                    message: data.message,
	                    category: data.category,
	                    subcategory: data.subcategory,
	                    date: data.date,
	                },
	            });
	            this.dispatchEvent(event);
	        }
	        else if (data.type === 'error' && data.error) {
	            if (this.state === 'connecting') {
	                this.state = 'created';
	                // Join中にweb-sdkのエラーイベントが発生したときは、web-sdkのエラーで実行時エラーを返す
	                this.joinCallback.error(new LSConfError(new SDKErrorData(data.error.detail, data.error.toReportString, data.error.data)));
	            }
	            else {
	                if (data.error.detail && data.error.detail.code) {
	                    const isSDKError = Math.floor(data.error.detail.code / 10000) !== 0;
	                    if (isSDKError) {
	                        this.dispatchEvent(new LSConfErrorEvent(new SDKErrorData(data.error.detail, data.error.toReportString, data.error.data)));
	                    }
	                    else {
	                        this.dispatchEvent(new LSConfErrorEvent(new ErrorData(data.error.detail.error, data.error.data)));
	                    }
	                }
	            }
	        }
	    }
	    setWindowMessageCallback() {
	        // window message イベントハンドラを多重登録させないために直近のイベントハンドラを破棄する
	        if (LSConferenceIframe._handleWindowMessage) {
	            window.removeEventListener('message', LSConferenceIframe._handleWindowMessage);
	        }
	        LSConferenceIframe._handleWindowMessage = this.handleWindowMessage.bind(this);
	        window.addEventListener('message', LSConferenceIframe._handleWindowMessage);
	    }
	    validateCreateParameters(parameters) {
	        if (parameters.thetaZoomMaxRange && typeof parameters.thetaZoomMaxRange !== 'number') {
	            return false;
	        }
	        if (parameters.defaultLayout !== undefined && parameters.defaultLayout !== 'gallery' && parameters.defaultLayout !== 'presentation' && parameters.defaultLayout !== 'fullscreen') {
	            return false;
	        }
	        if (parameters.room !== undefined) {
	            if (parameters.room.entranceScreen !== null && parameters.room.entranceScreen !== 'none' && parameters.room.entranceScreen !== 'click') {
	                return false;
	            }
	        }
	        if (parameters.player !== undefined) {
	            if (parameters.player.isHiddenVideoControlBar !== null && typeof parameters.player.isHiddenVideoControlBar !== 'boolean') {
	                return false;
	            }
	        }
	        if (parameters.getFileTimeout !== undefined && typeof parameters.getFileTimeout !== 'number') {
	            return false;
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
	            if (parameters.toolbar.isHiddenSpeakerButton !== undefined && typeof parameters.toolbar.isHiddenSpeakerButton !== 'boolean') {
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
	                    if (item.tips !== undefined && typeof item.tips !== 'string') {
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
	            if (parameters.subView.speakingThreshold !== undefined && typeof parameters.subView.speakingThreshold !== 'number') {
	                return false;
	            }
	            if (parameters.subView.speakingIndicatorDuration !== undefined && typeof parameters.subView.speakingIndicatorDuration !== 'number') {
	                return false;
	            }
	            if (parameters.subView.isHiddenDrawingButton !== undefined && typeof parameters.subView.isHiddenDrawingButton !== 'boolean') {
	                return false;
	            }
	            if (parameters.subView.drawingInterval !== undefined && typeof parameters.subView.drawingInterval !== 'number') {
	                return false;
	            }
	            if (parameters.subView.drawingColor !== undefined && typeof parameters.subView.drawingColor !== 'string') {
	                return false;
	            }
	            if (parameters.subView.drawingOption !== undefined && typeof parameters.subView.drawingOption !== 'object') {
	                return false;
	            }
	            if (parameters.subView.drawingOption !== undefined && !this.validateStrokeOptionType(parameters.subView.drawingOption)) {
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
	                if (parameters.subView.menu.customItems !== undefined) {
	                    if (typeof parameters.subView.menu.customItems !== 'object') {
	                        return false;
	                    }
	                    let isValid = true;
	                    parameters.subView.menu.customItems.forEach((item) => {
	                        if (item.label !== undefined && typeof item.label !== 'string') {
	                            isValid = false;
	                        }
	                        if (item.type !== undefined && typeof item.type !== 'string') {
	                            isValid = false;
	                        }
	                        if (item.targetSubView !== undefined) {
	                            if (typeof item.targetSubView !== 'object') {
	                                isValid = false;
	                            }
	                            if (item.targetSubView.type !== undefined &&
	                                item.targetSubView.type !== 'VIDEO_AUDIO' &&
	                                item.targetSubView.type !== 'SCREEN_SHARE' &&
	                                item.targetSubView.type !== 'VIDEO_FILE' &&
	                                item.targetSubView.type !== 'IMAGE_FILE') {
	                                isValid = false;
	                            }
	                            if (item.targetSubView.isTheta !== undefined && typeof item.targetSubView.isTheta !== 'boolean') {
	                                isValid = false;
	                            }
	                        }
	                    });
	                    if (!isValid) {
	                        return false;
	                    }
	                }
	            }
	            if (parameters.subView.theta !== undefined) {
	                if (typeof parameters.subView.theta !== 'object') {
	                    return false;
	                }
	                if (parameters.subView.theta.isHiddenFramerate !== undefined && typeof parameters.subView.theta.isHiddenFramerate !== 'boolean') {
	                    return false;
	                }
	                if (parameters.subView.theta.enableZenithCorrection !== undefined && typeof parameters.subView.theta.enableZenithCorrection !== 'boolean') {
	                    return false;
	                }
	            }
	            if (parameters.subView.normal !== undefined) {
	                if (typeof parameters.subView.normal !== 'object') {
	                    return false;
	                }
	                if (parameters.subView.normal.enableZoom !== undefined && typeof parameters.subView.normal.enableZoom !== 'boolean') {
	                    return false;
	                }
	                if (parameters.subView.normal.isHiddenFramerate !== undefined && typeof parameters.subView.normal.isHiddenFramerate !== 'boolean') {
	                    return false;
	                }
	            }
	            if (parameters.subView.image !== undefined) {
	                if (typeof parameters.subView.image !== 'object') {
	                    return false;
	                }
	                if (parameters.subView.image.isHiddenCloseButton !== undefined && typeof parameters.subView.image.isHiddenCloseButton !== 'boolean') {
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
	            if (parameters.theme.disabledTextColor !== undefined && typeof parameters.theme.disabledTextColor !== 'string') {
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
	        if (connectOptions.audioMuteType !== undefined) {
	            if (typeof connectOptions.audioMuteType !== 'string') {
	                return false;
	            }
	            if (connectOptions.audioMuteType !== 'soft' && connectOptions.audioMuteType !== 'hard') {
	                return false;
	            }
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
	        if (connectOptions.iceServersProtocol !== undefined) {
	            if (typeof connectOptions.iceServersProtocol !== 'string') {
	                return false;
	            }
	            if (connectOptions.iceServersProtocol !== 'all' &&
	                connectOptions.iceServersProtocol !== 'udp' &&
	                connectOptions.iceServersProtocol !== 'tcp' &&
	                connectOptions.iceServersProtocol !== 'tls' &&
	                connectOptions.iceServersProtocol !== 'tcp_tls') {
	                return false;
	            }
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
	        if (subView.type !== undefined && subView.type !== 'VIDEO_AUDIO' && subView.type !== 'SCREEN_SHARE' && subView.type !== 'VIDEO_FILE' && subView.type !== 'IMAGE_FILE') {
	            return false;
	        }
	        if (subView.enableVideo !== undefined && typeof subView.enableVideo !== 'boolean') {
	            return false;
	        }
	        if (subView.enableAudio !== undefined && typeof subView.enableAudio !== 'boolean') {
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
	    validateRotationVectorType(rotationVector) {
	        if (rotationVector === undefined) {
	            return false;
	        }
	        if (rotationVector.pitch === undefined || typeof rotationVector.pitch !== 'number') {
	            return false;
	        }
	        if (rotationVector.roll === undefined || typeof rotationVector.roll !== 'number') {
	            return false;
	        }
	        return true;
	    }
	    validateStrokeType(stroke) {
	        if (stroke === undefined) {
	            return false;
	        }
	        if (stroke.points === undefined || !Array.isArray(stroke.points) || stroke.points.length === 0 || !Array.isArray(stroke.points[0]) || typeof stroke.points[0][0] !== 'number') {
	            return false;
	        }
	        if (stroke.isEnded === undefined || typeof stroke.isEnded !== 'boolean') {
	            return false;
	        }
	        if (stroke.option !== undefined && !this.validateStrokeOptionType(stroke.option)) {
	            return false;
	        }
	        return true;
	    }
	    validateStrokeOptionType(option) {
	        if (typeof option !== 'object') {
	            return false;
	        }
	        if (option.size !== undefined && typeof option.size !== 'number') {
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
	    validateVideoSourceType(sources) {
	        if (sources !== undefined) {
	            if (typeof sources !== 'object') {
	                return false;
	            }
	            let isValid = true;
	            sources.forEach((src) => {
	                if (src.connectionId != null && typeof src.connectionId !== 'string') {
	                    isValid = false;
	                }
	                if (src.isTheta != null && typeof src.isTheta !== 'boolean') {
	                    isValid = false;
	                }
	                if (src.label != null && typeof src.label !== 'string') {
	                    isValid = false;
	                }
	                if (!('url' in src) && !('blob' in src)) {
	                    isValid = false;
	                }
	                if ('url' in src && typeof src.url !== 'string') {
	                    isValid = false;
	                }
	                if ('blob' in src && !(src.blob instanceof Blob)) {
	                    isValid = false;
	                }
	                if (src.metaUrl != null && typeof src.metaUrl !== 'string') {
	                    isValid = false;
	                }
	                if (src.meta != null && !this.validatePlayerMetadataType(src.meta)) {
	                    isValid = false;
	                }
	                if (src.connectionHistoryUrl != null && typeof src.connectionHistoryUrl !== 'string') {
	                    isValid = false;
	                }
	                if (src.videoTrackHistoryUrl != null && typeof src.videoTrackHistoryUrl !== 'string') {
	                    isValid = false;
	                }
	                if (src.audioTrackHistoryUrl != null && typeof src.audioTrackHistoryUrl !== 'string') {
	                    isValid = false;
	                }
	                try {
	                    if ('url' in src && typeof src.url === 'string') {
	                        new URL(src.url);
	                    }
	                    if (src.metaUrl != null) {
	                        new URL(src.metaUrl);
	                    }
	                    if (src.connectionHistoryUrl != null) {
	                        new URL(src.connectionHistoryUrl);
	                    }
	                    if (src.videoTrackHistoryUrl != null) {
	                        new URL(src.videoTrackHistoryUrl);
	                    }
	                    if (src.audioTrackHistoryUrl != null) {
	                        new URL(src.audioTrackHistoryUrl);
	                    }
	                }
	                catch (e) {
	                    isValid = false;
	                }
	            });
	            return isValid;
	        }
	        return true;
	    }
	    validateImageSourceType(source) {
	        if (typeof source !== 'object') {
	            return false;
	        }
	        if (source.url && typeof source.url !== 'string') {
	            return false;
	        }
	        if (source.connectionId && typeof source.connectionId !== 'string') {
	            return false;
	        }
	        if (source.label && typeof source.label !== 'string') {
	            return false;
	        }
	        if (source.isTheta && typeof source.isTheta !== 'boolean') {
	            return false;
	        }
	        return true;
	    }
	    validatePlayerStateType(state) {
	        if (typeof state !== 'string') {
	            return false;
	        }
	        if (state !== 'play' && state !== 'pause') {
	            return false;
	        }
	        return true;
	    }
	    validateMediaStreamConstraintsType(constraints) {
	        if (typeof constraints !== 'object') {
	            return false;
	        }
	        if (constraints.audio && typeof constraints.audio !== 'boolean' && typeof constraints.audio !== 'object') {
	            return false;
	        }
	        if (constraints.video && typeof constraints.video !== 'boolean' && typeof constraints.video !== 'object') {
	            return false;
	        }
	        return true;
	    }
	    validateUrl(url) {
	        try {
	            new URL(url);
	        }
	        catch (e) {
	            return false;
	        }
	        return true;
	    }
	    validatePlayerMetadataType(meta) {
	        if (typeof meta !== 'object') {
	            return false;
	        }
	        if (meta.roomId != null && typeof meta.roomId !== 'string') {
	            return false;
	        }
	        if (meta.startedAt != null && typeof meta.startedAt !== 'string') {
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
	            const createTimeoutId = this.setRequestTimer(reject, new LSConfError(new ErrorData('CreateTimeout')), DEFAULT_CREATE_TIMEOUT_MSEC);
	            // allow =  "display-capture" は Chrome だと unknown parameter の warning が出るが
	            // MDN の仕様では getDM する場合設定する必要があるので記載している
	            // cf: https://developer.mozilla.org/en-US/docs/Web/API/Screen_Capture_API/Using_Screen_Capture
	            this.iframeElement.allow = 'camera *; microphone *; autoplay *; display-capture *; fullscreen *; compute-pressure; cross-origin-isolated';
	            this.parentElement.appendChild(this.iframeElement);
	            this.iframeElement.onload = () => {
	                // Safari では onload 時に即時に postMessage することができないため、500 ms 遅延させて postMessage を実行する
	                window.setTimeout(() => {
	                    if (!this.iframeElement.contentWindow) {
	                        this.state = 'idle';
	                        throw new LSConfError(new ErrorData('InternalError5001'));
	                    }
	                    const postMessageParameters = {
	                        type: 'create',
	                        createType: 'room',
	                        origin: location.href,
	                        parameters: {
	                            getFileTimeout: parameters.getFileTimeout,
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
	                        const error = new LSConfError(new ErrorData('CreateFailed'));
	                        return reject(error);
	                    }
	                    this.setWindowMessageCallback();
	                    clearTimeout(createTimeoutId);
	                    this.state = 'created';
	                    // getFileTimeout が設定されている場合、その時間に余裕を持たせて +5 秒した時間を排他制御のロックのタイムアウトとして設定する
	                    LSConferenceIframe.useFetchAsyncLock = new asyncLock({
	                        maxExecutionTime: typeof postMessageParameters.parameters.getFileTimeout === 'number' ? postMessageParameters.parameters.getFileTimeout + 5000 : DEFAULT_MAX_EXECUTION_TIME_USE_FETCH_API,
	                    });
	                    return resolve();
	                }, 500);
	            };
	        });
	    }
	    static create(parentElement, parameters) {
	        return LSConferenceIframe.asyncLock.acquire('apiLock', () => {
	            return new Promise((resolve, reject) => {
	                const instance = new this(parentElement);
	                const element = parentElement || document.querySelector('body');
	                if (!(element instanceof HTMLElement)) {
	                    const error = new LSConfError(new ErrorData('CreateArgsInvalid'));
	                    return reject(error);
	                }
	                if (!instance.validateCreateParameters(parameters)) {
	                    const error = new LSConfError(new ErrorData('CreateArgsInvalid'));
	                    return reject(error);
	                }
	                const locales = LSConferenceIframe.loadLocales();
	                const extParam = { ...parameters, locales };
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
	        });
	    }
	    __createPlayer(sources, parameters) {
	        return new Promise((resolve, reject) => {
	            this.state = 'creating';
	            if (parameters && parameters.lsConfURL) {
	                this.lsConfURL = parameters.lsConfURL;
	                this.iframeElement.src = this.lsConfURL;
	            }
	            const createTimeoutId = this.setRequestTimer(reject, new LSConfError(new ErrorData('CreateTimeout')), DEFAULT_CREATE_TIMEOUT_MSEC);
	            // 動画の再生プレイヤーで利用する権限を追加
	            this.iframeElement.allow = 'autoplay *; fullscreen *; compute-pressure; cross-origin-isolated';
	            this.parentElement.appendChild(this.iframeElement);
	            this.iframeElement.onload = () => {
	                // Safari では onload 時に即時に postMessage することができないため、500 ms 遅延させて postMessage を実行する
	                window.setTimeout(() => {
	                    if (!this.iframeElement.contentWindow) {
	                        this.state = 'idle';
	                        throw new LSConfError(new ErrorData('InternalError5001'));
	                    }
	                    // 指定できないパラメータについては固定値を設定する
	                    const customParameters = {
	                        room: { entranceScreen: 'none' },
	                        toolbar: { isHidden: true },
	                        subView: {
	                            enableAutoVideoReceiving: false,
	                            normal: { enableZoom: false, isHiddenFramerate: true },
	                            theta: { isHiddenFramerate: true },
	                            image: { isHiddenCloseButton: false },
	                            menu: { isHidden: false, isHiddenRecordingButton: true, isHiddenSharePoVButton: true },
	                        },
	                    };
	                    if (parameters) {
	                        customParameters.defaultLayout = parameters.defaultLayout;
	                        customParameters.player = parameters.player;
	                        customParameters.thetaZoomMaxRange = parameters.thetaZoomMaxRange;
	                        customParameters.getFileTimeout = parameters.getFileTimeout;
	                        customParameters.theme = parameters.theme;
	                        customParameters.locales = parameters.locales;
	                        if (customParameters.subView && parameters.subView) {
	                            if (parameters.subView.speakingThreshold !== undefined) {
	                                customParameters.subView.speakingThreshold = parameters.subView.speakingThreshold;
	                            }
	                            if (parameters.subView.speakingIndicatorDuration !== undefined) {
	                                customParameters.subView.speakingIndicatorDuration = parameters.subView.speakingIndicatorDuration;
	                            }
	                            if (parameters.subView.isHiddenDrawingButton !== undefined) {
	                                customParameters.subView.isHiddenDrawingButton = parameters.subView.isHiddenDrawingButton;
	                            }
	                            if (parameters.subView.drawingInterval !== undefined) {
	                                customParameters.subView.drawingInterval = parameters.subView.drawingInterval;
	                            }
	                            if (parameters.subView.drawingColor !== undefined) {
	                                customParameters.subView.drawingColor = parameters.subView.drawingColor;
	                            }
	                            if (parameters.subView.drawingOption) {
	                                customParameters.subView.drawingOption = parameters.subView.drawingOption;
	                            }
	                            if (parameters.subView.menu) {
	                                customParameters.subView.menu = {
	                                    isHidden: parameters.subView.menu.isHidden,
	                                    isHiddenRecordingButton: true,
	                                    isHiddenSharePoVButton: parameters.subView.menu.isHiddenSharePoVButton,
	                                    customItems: parameters.subView.menu.customItems,
	                                };
	                            }
	                            if (parameters.subView.normal) {
	                                customParameters.subView.normal = {
	                                    enableZoom: parameters.subView.normal.enableZoom,
	                                    isHiddenFramerate: parameters.subView.normal.isHiddenFramerate,
	                                };
	                            }
	                            if (parameters.subView.theta) {
	                                customParameters.subView.theta = {
	                                    enableZenithCorrection: parameters.subView.theta.enableZenithCorrection,
	                                    isHiddenFramerate: parameters.subView.theta.isHiddenFramerate,
	                                };
	                            }
	                            if (parameters.subView.image) {
	                                customParameters.subView.image = {
	                                    isHiddenCloseButton: parameters.subView.image.isHiddenCloseButton,
	                                };
	                            }
	                        }
	                    }
	                    const postMessageParameters = {
	                        type: 'createPlayer',
	                        createType: 'player',
	                        origin: location.href,
	                        sources,
	                        parameters: customParameters,
	                    };
	                    try {
	                        this.iframeElement.contentWindow.postMessage(postMessageParameters, this.lsConfURL);
	                    }
	                    catch (e) {
	                        this.state = 'idle';
	                        const error = new LSConfError(new ErrorData('CreateFailed'));
	                        return reject(error);
	                    }
	                    this.setWindowMessageCallback();
	                    clearTimeout(createTimeoutId);
	                    this.state = 'created';
	                    // getFileTimeout が設定されている場合、その時間に余裕を持たせて +5 秒した時間を排他制御のロックのタイムアウトとして設定する
	                    LSConferenceIframe.useFetchAsyncLock = new asyncLock({
	                        maxExecutionTime: typeof postMessageParameters.parameters.getFileTimeout === 'number' ? postMessageParameters.parameters.getFileTimeout + 5000 : DEFAULT_MAX_EXECUTION_TIME_USE_FETCH_API,
	                    });
	                    return resolve();
	                }, 500);
	            };
	        });
	    }
	    static createPlayer(parentElement, sources, parameters) {
	        return LSConferenceIframe.asyncLock.acquire('apiLock', () => {
	            return new Promise((resolve, reject) => {
	                const instance = new this(parentElement);
	                const element = parentElement || document.querySelector('body');
	                if (!(element instanceof HTMLElement)) {
	                    const error = new LSConfError(new ErrorData('CreateArgsInvalid'));
	                    return reject(error);
	                }
	                if (sources !== undefined && typeof sources !== 'string' && !instance.validateVideoSourceType(sources)) {
	                    const error = new LSConfError(new ErrorData('CreateArgsInvalid'));
	                    return reject(error);
	                }
	                if (sources !== undefined && typeof sources === 'string' && !instance.validateUrl(sources)) {
	                    const error = new LSConfError(new ErrorData('CreateArgsInvalid'));
	                    return reject(error);
	                }
	                if (parameters !== undefined && !instance.validateCreateParameters(parameters)) {
	                    const error = new LSConfError(new ErrorData('CreateArgsInvalid'));
	                    return reject(error);
	                }
	                const locales = LSConferenceIframe.loadLocales();
	                const extParam = { ...parameters, locales };
	                instance
	                    .__createPlayer(sources, extParam)
	                    .then(() => {
	                    resolve(instance);
	                })
	                    .catch((e) => {
	                    //XXX(kdxu): __create 内で dispatch error event を行っているため、この時点では error event を dispatch しない
	                    reject(e);
	                });
	            });
	        });
	    }
	    async join(clientId, accessToken, connectOptions) {
	        return LSConferenceIframe.asyncLock.acquire('apiLock', () => {
	            return new Promise((resolve, reject) => {
	                this.state = 'connecting';
	                const joinTimeoutId = this.setRequestTimer(reject, new LSConfError(new ErrorData('JoinFailedTimeout')), DEFAULT_JOIN_TIMEOUT_MSEC);
	                if (!this.iframeElement.contentWindow) {
	                    clearTimeout(joinTimeoutId);
	                    this.state = 'created';
	                    throw new LSConfError(new ErrorData('InternalError5001'));
	                }
	                if (!this.validateJoinParameters(clientId, accessToken, connectOptions)) {
	                    this.state = 'created';
	                    const error = new LSConfError(new ErrorData('JoinArgsInvalid'));
	                    clearTimeout(joinTimeoutId);
	                    return reject(error);
	                }
	                // optionalパラメータのデフォルト値の設定
	                connectOptions.signalingURL = connectOptions.signalingURL || DEFAULT_SIGNALING_URL;
	                connectOptions.maxVideoBitrate = connectOptions.maxVideoBitrate || DEFAULT_MAX_BITRATE;
	                connectOptions.maxShareBitrate = connectOptions.maxShareBitrate || DEFAULT_MAX_BITRATE;
	                connectOptions.useDummyDevice = connectOptions.useDummyDevice || DEFAULT_USE_DUMMY_DEVICE;
	                connectOptions.videoCodec = connectOptions.videoCodec || DEFAULT_VIDEO_CODEC;
	                connectOptions.audioMuteType = connectOptions.audioMuteType || DEFAULT_AUDIO_MUTE_TYPE;
	                connectOptions.mode = connectOptions.mode || DEFAULT_MODE;
	                connectOptions.iceServersProtocol = connectOptions.iceServersProtocol || DEFAULT_ICE_SERVERS_PROTOCOL;
	                connectOptions.enableSpeaker = connectOptions.enableSpeaker != null ? connectOptions.enableSpeaker : DEFAULT_ENABLE_SPEAKER;
	                // video audio の role, mediaType は固定
	                const postMessageParameters = {
	                    type: 'connect',
	                    clientId: clientId,
	                    accessToken: accessToken,
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
	                    const error = new LSConfError(new ErrorData('JoinFailed'));
	                    clearTimeout(joinTimeoutId);
	                    return reject(error);
	                }
	                this.clientId = clientId;
	                this.connectOptions = connectOptions;
	            });
	        });
	    }
	    leave() {
	        return LSConferenceIframe.asyncLock.acquire('apiLock', () => {
	            return new Promise((resolve, reject) => {
	                this.state = 'closing';
	                if (!this.iframeElement.contentWindow) {
	                    this.state = 'open';
	                    throw new LSConfError(new ErrorData('InternalError5001'));
	                }
	                const postMessageParameters = {
	                    type: 'leave',
	                };
	                try {
	                    this.iframeElement.contentWindow.postMessage(postMessageParameters, this.lsConfURL);
	                }
	                catch (e) {
	                    this.state = 'open';
	                    const error = new LSConfError(new ErrorData('CloseFailed'));
	                    return reject(error);
	                }
	                return resolve();
	            });
	        });
	    }
	    onShareRequested(callback) {
	        void LSConferenceIframe.asyncLock.acquire('apiLock', () => {
	            if (typeof callback !== 'function') {
	                throw new TypeError(`Failed to execute 'onShareRequested' on '${this.constructor.name}': The callback provided as parameter 1 is not an object.`);
	            }
	            this.shareRequestedCallback = callback;
	        });
	    }
	    getSubViews() {
	        return LSConferenceIframe.asyncLock.acquire('apiLock', () => {
	            return new Promise((resolve, reject) => {
	                if (!this.iframeElement.contentWindow) {
	                    throw new LSConfError(new ErrorData('InternalError5001'));
	                }
	                const postMessageParameters = {
	                    type: 'getSubViews',
	                };
	                this.getSubViewsCallback = { success: (subViews) => resolve(subViews), error: (err) => reject(err) };
	                try {
	                    this.iframeElement.contentWindow.postMessage(postMessageParameters, this.lsConfURL);
	                }
	                catch (e) {
	                    const error = new LSConfError(new ErrorData('GetSubViewsFailed'));
	                    return reject(error);
	                }
	            });
	        });
	    }
	    highlight(subView) {
	        return LSConferenceIframe.asyncLock.acquire('apiLock', () => {
	            return new Promise((resolve, reject) => {
	                if (!this.iframeElement.contentWindow) {
	                    return reject(new LSConfError(new ErrorData('InternalError5001')));
	                }
	                if (!this.validateSubViewType(subView)) {
	                    return reject(new LSConfError(new ErrorData('HighlightArgsInvalid')));
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
	                    const error = new LSConfError(new ErrorData('HighlightFailed'));
	                    return reject(error);
	                }
	            });
	        });
	    }
	    getPoV(subView) {
	        return LSConferenceIframe.asyncLock.acquire('apiLock', () => {
	            return new Promise((resolve, reject) => {
	                if (!this.iframeElement.contentWindow) {
	                    return reject(new LSConfError(new ErrorData('InternalError5001')));
	                }
	                if (!this.validateSubViewType(subView)) {
	                    return reject(new LSConfError(new ErrorData('GetPoVArgsInvalid')));
	                }
	                if (!subView.isTheta) {
	                    return reject(new LSConfError(new ErrorData('GetPoVArgsInvalid')));
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
	                    const error = new LSConfError(new ErrorData('GetPoVFailed'));
	                    return reject(error);
	                }
	            });
	        });
	    }
	    setPoV(subView, poV) {
	        return LSConferenceIframe.asyncLock.acquire('apiLock', () => {
	            return new Promise((resolve, reject) => {
	                if (!this.iframeElement.contentWindow) {
	                    return reject(new LSConfError(new ErrorData('InternalError5001')));
	                }
	                if (!this.validateSubViewType(subView) || !this.validatePoVType(poV)) {
	                    return reject(new LSConfError(new ErrorData('SetPoVArgsInvalid')));
	                }
	                if (!subView.isTheta) {
	                    return reject(new LSConfError(new ErrorData('SetPoVArgsInvalid')));
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
	                    const error = new LSConfError(new ErrorData('SetPoVFailed'));
	                    return reject(error);
	                }
	            });
	        });
	    }
	    setRotationVector(subView, rotationVector) {
	        return LSConferenceIframe.asyncLock.acquire('apiLock', () => {
	            return new Promise((resolve, reject) => {
	                if (!this.iframeElement.contentWindow) {
	                    return reject(new LSConfError(new ErrorData('InternalError5001')));
	                }
	                if (!this.validateSubViewType(subView) || !this.validateRotationVectorType(rotationVector)) {
	                    return reject(new LSConfError(new ErrorData('SetRotationVectorArgsInvalid')));
	                }
	                if (!subView.isTheta) {
	                    return reject(new LSConfError(new ErrorData('SetRotationVectorArgsInvalid')));
	                }
	                const postMessageParameters = {
	                    type: 'setRotationVector',
	                    subView: subView,
	                    rotationVector: rotationVector,
	                };
	                this.setRotationVectorCallback = { success: () => resolve(), error: (err) => reject(err) };
	                try {
	                    this.iframeElement.contentWindow.postMessage(postMessageParameters, this.lsConfURL);
	                }
	                catch (e) {
	                    const error = new LSConfError(new ErrorData('SetRotationVectorFailed'));
	                    return reject(error);
	                }
	            });
	        });
	    }
	    getMediaDevices() {
	        return LSConferenceIframe.asyncLock.acquire('apiLock', () => {
	            return new Promise((resolve, reject) => {
	                if (!this.iframeElement.contentWindow) {
	                    return reject(new LSConfError(new ErrorData('InternalError5001')));
	                }
	                if (this.connectOptions && this.connectOptions.mode === 'viewer' && this.state === 'open') {
	                    return reject(new LSConfError(new ErrorData('ModeInvalid')));
	                }
	                const postMessageParameters = {
	                    type: 'getMediaDevices',
	                };
	                this.getMediaDevicesCallback = { success: (devices) => resolve(devices), error: (err) => reject(err) };
	                try {
	                    this.iframeElement.contentWindow.postMessage(postMessageParameters, this.lsConfURL);
	                }
	                catch (e) {
	                    const error = new LSConfError(new ErrorData('GetMediaDevicesFailed'));
	                    return reject(error);
	                }
	            });
	        });
	    }
	    setCameraMute(isEnabled) {
	        return LSConferenceIframe.asyncLock.acquire('apiLock', () => {
	            return new Promise((resolve, reject) => {
	                if (!this.iframeElement.contentWindow) {
	                    return reject(new LSConfError(new ErrorData('InternalError5001')));
	                }
	                if (this.connectOptions && this.connectOptions.mode === 'viewer' && this.state === 'open') {
	                    return reject(new LSConfError(new ErrorData('ModeInvalid')));
	                }
	                const postMessageParameters = {
	                    type: 'cameraMute',
	                    isEnabled: isEnabled,
	                };
	                try {
	                    this.iframeElement.contentWindow.postMessage(postMessageParameters, this.lsConfURL);
	                }
	                catch (e) {
	                    const error = new LSConfError(new ErrorData('CameraMuteFailed'));
	                    return reject(error);
	                }
	                return resolve();
	            });
	        });
	    }
	    setCameraDevice(deviceId) {
	        return LSConferenceIframe.asyncLock.acquire('apiLock', () => {
	            return new Promise((resolve, reject) => {
	                if (!this.iframeElement.contentWindow) {
	                    return reject(new LSConfError(new ErrorData('InternalError5001')));
	                }
	                if (this.connectOptions && this.connectOptions.mode === 'viewer' && this.state === 'open') {
	                    return reject(new LSConfError(new ErrorData('ModeInvalid')));
	                }
	                const postMessageParameters = {
	                    type: 'setCameraDevice',
	                    deviceId: deviceId,
	                };
	                try {
	                    this.iframeElement.contentWindow.postMessage(postMessageParameters, this.lsConfURL);
	                }
	                catch (e) {
	                    const error = new LSConfError(new ErrorData('SetCameraDeviceFailed'));
	                    return reject(error);
	                }
	                return resolve();
	            });
	        });
	    }
	    setMicMute(isEnabled) {
	        return LSConferenceIframe.asyncLock.acquire('apiLock', () => {
	            return new Promise((resolve, reject) => {
	                if (!this.iframeElement.contentWindow) {
	                    return reject(new LSConfError(new ErrorData('InternalError5001')));
	                }
	                if (this.connectOptions && this.connectOptions.mode === 'viewer' && this.state === 'open') {
	                    return reject(new LSConfError(new ErrorData('ModeInvalid')));
	                }
	                const postMessageParameters = {
	                    type: 'micMute',
	                    isEnabled: isEnabled,
	                };
	                try {
	                    this.iframeElement.contentWindow.postMessage(postMessageParameters, this.lsConfURL);
	                }
	                catch (e) {
	                    const error = new LSConfError(new ErrorData('MicMuteFailed'));
	                    return reject(error);
	                }
	                return resolve();
	            });
	        });
	    }
	    setMicDevice(deviceId) {
	        return LSConferenceIframe.asyncLock.acquire('apiLock', () => {
	            return new Promise((resolve, reject) => {
	                if (!this.iframeElement.contentWindow) {
	                    return reject(new LSConfError(new ErrorData('InternalError5001')));
	                }
	                if (this.connectOptions && this.connectOptions.mode === 'viewer' && this.state === 'open') {
	                    return reject(new LSConfError(new ErrorData('ModeInvalid')));
	                }
	                const postMessageParameters = {
	                    type: 'setMicDevice',
	                    deviceId: deviceId,
	                };
	                try {
	                    this.iframeElement.contentWindow.postMessage(postMessageParameters, this.lsConfURL);
	                }
	                catch (e) {
	                    const error = new LSConfError(new ErrorData('SetMicDeviceFailed'));
	                    return reject(error);
	                }
	                return resolve();
	            });
	        });
	    }
	    setSpeakerMute(isEnabled) {
	        return LSConferenceIframe.asyncLock.acquire('apiLock', () => {
	            return new Promise((resolve, reject) => {
	                if (!this.iframeElement.contentWindow) {
	                    return reject(new LSConfError(new ErrorData('InternalError5001')));
	                }
	                if (this.connectOptions && this.connectOptions.mode === 'viewer' && this.state === 'open') {
	                    return reject(new LSConfError(new ErrorData('ModeInvalid')));
	                }
	                const postMessageParameters = {
	                    type: 'speakerMute',
	                    isEnabled: isEnabled,
	                };
	                try {
	                    this.iframeElement.contentWindow.postMessage(postMessageParameters, this.lsConfURL);
	                }
	                catch (e) {
	                    const error = new LSConfError(new ErrorData('SpeakerMuteFailed'));
	                    return reject(error);
	                }
	                return resolve();
	            });
	        });
	    }
	    enablePointer(isEnabled) {
	        return LSConferenceIframe.asyncLock.acquire('apiLock', () => {
	            return new Promise((resolve, reject) => {
	                if (!this.iframeElement.contentWindow) {
	                    return reject(new LSConfError(new ErrorData('InternalError5001')));
	                }
	                const postMessageParameters = {
	                    type: 'enablePointer',
	                    isEnabled: isEnabled,
	                };
	                try {
	                    this.iframeElement.contentWindow.postMessage(postMessageParameters, this.lsConfURL);
	                }
	                catch (e) {
	                    const error = new LSConfError(new ErrorData('EnablePointerFailed'));
	                    return reject(error);
	                }
	                return resolve();
	            });
	        });
	    }
	    updatePointer(subView, connectionId, poV, username, color) {
	        return LSConferenceIframe.asyncLock.acquire('apiLock', () => {
	            return new Promise((resolve, reject) => {
	                if (!this.iframeElement.contentWindow) {
	                    return reject(new LSConfError(new ErrorData('InternalError5001')));
	                }
	                if (!this.validateSubViewType(subView) || (poV && !this.validatePoVType(poV))) {
	                    return reject(new LSConfError(new ErrorData('UpdatePointerArgsInvalid')));
	                }
	                if (typeof connectionId !== 'string') {
	                    return reject(new LSConfError(new ErrorData('UpdatePointerArgsInvalid')));
	                }
	                if (username !== undefined && typeof username !== 'string') {
	                    return reject(new LSConfError(new ErrorData('UpdatePointerArgsInvalid')));
	                }
	                if (color !== undefined && typeof color !== 'string') {
	                    return reject(new LSConfError(new ErrorData('UpdatePointerArgsInvalid')));
	                }
	                const parameters = {
	                    subView: subView,
	                    connectionId: connectionId,
	                    poV: poV,
	                    username: username,
	                    color: color,
	                };
	                this.messageQueue('updatePointer', parameters);
	                // 一括実行時はエラーはログ出力のみとし一旦成功として返す
	                resolve();
	            });
	        });
	    }
	    updateStroke(subView, connectionId, stroke, username, color) {
	        return LSConferenceIframe.asyncLock.acquire('apiLock', () => {
	            return new Promise((resolve, reject) => {
	                if (!this.iframeElement.contentWindow) {
	                    return reject(new LSConfError(new ErrorData('InternalError5001')));
	                }
	                if (!this.validateSubViewType(subView)) {
	                    return reject(new LSConfError(new ErrorData('UpdateStrokeArgsInvalid')));
	                }
	                if (connectionId === undefined || typeof connectionId !== 'string') {
	                    return reject(new LSConfError(new ErrorData('UpdateStrokeArgsInvalid')));
	                }
	                if (username !== undefined && typeof username !== 'string') {
	                    return reject(new LSConfError(new ErrorData('UpdateStrokeArgsInvalid')));
	                }
	                if (color !== undefined && typeof color !== 'string') {
	                    return reject(new LSConfError(new ErrorData('UpdateStrokeArgsInvalid')));
	                }
	                if (!this.validateStrokeType(stroke)) {
	                    return reject(new LSConfError(new ErrorData('UpdateStrokeArgsInvalid')));
	                }
	                const parameters = {
	                    subView: subView,
	                    connectionId: connectionId,
	                    stroke: stroke,
	                    username: username,
	                    color: color,
	                };
	                this.messageQueue('updateStroke', parameters);
	                // 一括実行時はエラーはログ出力のみとし一旦成功として返す
	                resolve();
	            });
	        });
	    }
	    getReport(type) {
	        return new Promise((resolve, reject) => {
	            if (!this.iframeElement.contentWindow) {
	                throw new LSConfError(new ErrorData('InternalError5001'));
	            }
	            const postMessageParameters = {
	                type: type,
	            };
	            this.getReportCallbacks.set(type, { success: (log) => resolve(log), error: (err) => reject(err) });
	            try {
	                this.iframeElement.contentWindow.postMessage(postMessageParameters, this.lsConfURL);
	            }
	            catch (e) {
	                this.getReportCallbacks.delete(type);
	                const error = new LSConfError(new ErrorData('GetReportFailed'));
	                return reject(error);
	            }
	        });
	    }
	    getLSConfLog() {
	        return LSConferenceIframe.asyncLock.acquire('apiLock', () => {
	            return new Promise((resolve, reject) => {
	                if (!this.iframeElement.contentWindow) {
	                    return reject(new LSConfError(new ErrorData('InternalError5001')));
	                }
	                const postMessageParameters = {
	                    type: 'getLSConfLog',
	                };
	                this.getLSConfLogCallback = {
	                    success: (lsConfLog) => resolve(lsConfLog),
	                    error: (err) => reject(err),
	                };
	                try {
	                    this.iframeElement.contentWindow.postMessage(postMessageParameters, this.lsConfURL);
	                }
	                catch (e) {
	                    const error = new LSConfError(new ErrorData('GetLSConfLogFailed'));
	                    return reject(error);
	                }
	            });
	        });
	    }
	    getVideoAudioStats() {
	        return LSConferenceIframe.asyncLock.acquire('apiLock', () => {
	            return this.getReport('VideoAudioStats');
	        });
	    }
	    getScreenShareStats() {
	        return LSConferenceIframe.asyncLock.acquire('apiLock', () => {
	            return this.getReport('ScreenShareStats');
	        });
	    }
	    getStats(subView, kind) {
	        return LSConferenceIframe.asyncLock.acquire('apiLock', () => {
	            return new Promise((resolve, reject) => {
	                if (!this.iframeElement.contentWindow) {
	                    return reject(new LSConfError(new ErrorData('InternalError5001')));
	                }
	                if (!this.validateSubViewType(subView)) {
	                    return reject(new LSConfError(new ErrorData('GetStatsArgsInvalid')));
	                }
	                if (kind && kind !== 'audio' && kind !== 'video') {
	                    return reject(new LSConfError(new ErrorData('GetStatsArgsInvalid')));
	                }
	                const postMessageParameters = {
	                    type: 'getStats',
	                    subView: subView,
	                    kind: kind,
	                };
	                this.getStatsCallback = {
	                    success: (stats) => resolve(stats),
	                    error: (err) => reject(err),
	                };
	                try {
	                    this.iframeElement.contentWindow.postMessage(postMessageParameters, this.lsConfURL);
	                }
	                catch (e) {
	                    const error = new LSConfError(new ErrorData('GetStatsFailed'));
	                    return reject(error);
	                }
	            });
	        });
	    }
	    changeLayout(layout, subViews) {
	        return LSConferenceIframe.asyncLock.acquire('apiLock', () => {
	            return new Promise((resolve, reject) => {
	                if (!this.iframeElement.contentWindow) {
	                    return reject(new LSConfError(new ErrorData('InternalError5001')));
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
	                    return reject(new LSConfError(new ErrorData('ChangeLayoutArgsInvalid')));
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
	                    const error = new LSConfError(new ErrorData('ChangeLayoutFailed'));
	                    return reject(error);
	                }
	                return resolve();
	            });
	        });
	    }
	    moveSubView(to, subView) {
	        return LSConferenceIframe.asyncLock.acquire('apiLock', () => {
	            return new Promise((resolve, reject) => {
	                if (!this.iframeElement.contentWindow) {
	                    return reject(new LSConfError(new ErrorData('InternalError5001')));
	                }
	                let isValidSubViews = true;
	                if (!this.validateSubViewType(subView)) {
	                    isValidSubViews = false;
	                }
	                if ((to !== 'presentation_main' && to !== 'presentation_sub' && to !== 'fullscreen') || !isValidSubViews) {
	                    return reject(new LSConfError(new ErrorData('MoveSubViewArgsInvalid')));
	                }
	                const postMessageParameters = {
	                    type: 'moveSubView',
	                    to,
	                    subView,
	                };
	                this.moveSubViewCallback = { success: () => resolve(), error: (err) => reject(err) };
	                try {
	                    this.iframeElement.contentWindow.postMessage(postMessageParameters, this.lsConfURL);
	                }
	                catch (e) {
	                    const error = new LSConfError(new ErrorData('MoveSubViewFailed'));
	                    return reject(error);
	                }
	            });
	        });
	    }
	    addRecordingMember(subView, connectionId) {
	        return LSConferenceIframe.asyncLock.acquire('apiLock', () => {
	            return new Promise((resolve, reject) => {
	                if (!this.iframeElement.contentWindow) {
	                    return reject(new LSConfError(new ErrorData('InternalError5001')));
	                }
	                if (typeof connectionId !== 'string') {
	                    return reject(new LSConfError(new ErrorData('AddRecordingMemberArgsInvalid')));
	                }
	                if (!this.validateSubViewType(subView)) {
	                    return reject(new LSConfError(new ErrorData('AddRecordingMemberArgsInvalid')));
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
	                    const error = new LSConfError(new ErrorData('AddRecordingMemberFailed'));
	                    return reject(error);
	                }
	            });
	        });
	    }
	    removeRecordingMember(subView, connectionId) {
	        return LSConferenceIframe.asyncLock.acquire('apiLock', () => {
	            return new Promise((resolve, reject) => {
	                if (!this.iframeElement.contentWindow) {
	                    return reject(new LSConfError(new ErrorData('InternalError5001')));
	                }
	                if (typeof connectionId !== 'string') {
	                    return reject(new LSConfError(new ErrorData('RemoveRecordingMemberArgsInvalid')));
	                }
	                if (!this.validateSubViewType(subView)) {
	                    return reject(new LSConfError(new ErrorData('RemoveRecordingMemberArgsInvalid')));
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
	                    const error = new LSConfError(new ErrorData('RemoveRecordingMemberFailed'));
	                    return reject(error);
	                }
	            });
	        });
	    }
	    getCaptureImage(subView, options) {
	        return LSConferenceIframe.asyncLock.acquire('apiLock', () => {
	            return new Promise((resolve, reject) => {
	                if (!this.iframeElement.contentWindow) {
	                    return reject(new LSConfError(new ErrorData('InternalError5001')));
	                }
	                if (!this.validateSubViewType(subView)) {
	                    return reject(new LSConfError(new ErrorData('GetCaptureImageArgsInvalid')));
	                }
	                if (!this.validateCaptureImageOptionsType(options)) {
	                    return reject(new LSConfError(new ErrorData('GetCaptureImageArgsInvalid')));
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
	                    const error = new LSConfError(new ErrorData('GetCaptureImageFailed'));
	                    return reject(error);
	                }
	            });
	        });
	    }
	    startReceiveVideo(subView) {
	        return LSConferenceIframe.asyncLock.acquire('apiLock', () => {
	            return new Promise((resolve, reject) => {
	                if (!this.iframeElement.contentWindow) {
	                    return reject(new LSConfError(new ErrorData('InternalError5001')));
	                }
	                if (!this.validateSubViewType(subView)) {
	                    return reject(new LSConfError(new ErrorData('StartReceiveVideoArgsInvalid')));
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
	                    const error = new LSConfError(new ErrorData('StartReceiveVideoFailed'));
	                    return reject(error);
	                }
	            });
	        });
	    }
	    stopReceiveVideo(subView) {
	        return LSConferenceIframe.asyncLock.acquire('apiLock', () => {
	            return new Promise((resolve, reject) => {
	                if (!this.iframeElement.contentWindow) {
	                    return reject(new LSConfError(new ErrorData('InternalError5001')));
	                }
	                if (!this.validateSubViewType(subView)) {
	                    return reject(new LSConfError(new ErrorData('StopReceiveVideoArgsInvalid')));
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
	                    const error = new LSConfError(new ErrorData('StopReceiveVideoFailed'));
	                    return reject(error);
	                }
	            });
	        });
	    }
	    changePlayerState(state) {
	        return LSConferenceIframe.asyncLock.acquire('apiLock', () => {
	            return new Promise((resolve, reject) => {
	                if (!this.iframeElement.contentWindow) {
	                    return reject(new LSConfError(new ErrorData('InternalError5001')));
	                }
	                if (!this.validatePlayerStateType(state)) {
	                    return reject(new LSConfError(new ErrorData('ChangePlayerStateArgsInvalid')));
	                }
	                const postMessageParameters = {
	                    type: 'changePlayerState',
	                    state,
	                };
	                this.changePlayerStateCallback = { success: () => resolve(), error: (err) => reject(err) };
	                try {
	                    this.iframeElement.contentWindow.postMessage(postMessageParameters, this.lsConfURL);
	                }
	                catch (e) {
	                    const error = new LSConfError(new ErrorData('ChangePlayerStateFailed'));
	                    return reject(error);
	                }
	            });
	        });
	    }
	    enableZoom(subView, isEnabled) {
	        return LSConferenceIframe.asyncLock.acquire('apiLock', () => {
	            return new Promise((resolve, reject) => {
	                if (!this.iframeElement.contentWindow) {
	                    return reject(new LSConfError(new ErrorData('InternalError5001')));
	                }
	                if (!this.validateSubViewType(subView)) {
	                    return reject(new LSConfError(new ErrorData('EnableZoomArgsInvalid')));
	                }
	                const postMessageParameters = {
	                    type: 'enableZoom',
	                    subView,
	                    isEnabled,
	                };
	                this.enableZoomCallback = { success: () => resolve(), error: (err) => reject(err) };
	                try {
	                    this.iframeElement.contentWindow.postMessage(postMessageParameters, this.lsConfURL);
	                }
	                catch (e) {
	                    const error = new LSConfError(new ErrorData('EnableZoomFailed'));
	                    return reject(error);
	                }
	            });
	        });
	    }
	    addVideoSource(source) {
	        return LSConferenceIframe.useFetchAsyncLock.acquire('useFetchApiLock', () => {
	            return new Promise((resolve, reject) => {
	                if (!this.iframeElement.contentWindow) {
	                    return reject(new LSConfError(new ErrorData('InternalError5001')));
	                }
	                if (!this.validateVideoSourceType([source])) {
	                    return reject(new LSConfError(new ErrorData('AddVideoSourceArgsInvalid')));
	                }
	                const postMessageParameters = {
	                    type: 'addVideoSource',
	                    source,
	                };
	                this.addVideoSourceCallback = { success: () => resolve(), error: (err) => reject(err) };
	                try {
	                    this.iframeElement.contentWindow.postMessage(postMessageParameters, this.lsConfURL);
	                }
	                catch (e) {
	                    const error = new LSConfError(new ErrorData('AddVideoSourceFailed'));
	                    return reject(error);
	                }
	            });
	        });
	    }
	    addImageSource(source, parentConnectionId) {
	        return LSConferenceIframe.useFetchAsyncLock.acquire('useFetchApiLock', () => {
	            return new Promise((resolve, reject) => {
	                if (!this.iframeElement.contentWindow) {
	                    return reject(new LSConfError(new ErrorData('InternalError5001')));
	                }
	                if (!this.validateImageSourceType(source)) {
	                    return reject(new LSConfError(new ErrorData('AddImageSourceArgsInvalid')));
	                }
	                if (parentConnectionId && typeof parentConnectionId !== 'string') {
	                    return reject(new LSConfError(new ErrorData('AddImageSourceArgsInvalid')));
	                }
	                const postMessageParameters = {
	                    type: 'addImageSource',
	                    source,
	                    parentConnectionId,
	                };
	                this.addImageSourceCallback = { success: () => resolve(), error: (err) => reject(err) };
	                try {
	                    this.iframeElement.contentWindow.postMessage(postMessageParameters, this.lsConfURL);
	                }
	                catch (e) {
	                    const error = new LSConfError(new ErrorData('AddImageSourceFailed'));
	                    return reject(error);
	                }
	            });
	        });
	    }
	    removeImageSource(connectionId) {
	        return LSConferenceIframe.asyncLock.acquire('apiLock', () => {
	            return new Promise((resolve, reject) => {
	                if (!this.iframeElement.contentWindow) {
	                    return reject(new LSConfError(new ErrorData('InternalError5001')));
	                }
	                if (typeof connectionId !== 'string') {
	                    return reject(new LSConfError(new ErrorData('RemoveImageSourceArgsInvalid')));
	                }
	                const postMessageParameters = {
	                    type: 'removeImageSource',
	                    connectionId,
	                };
	                this.removeImageSourceCallback = { success: () => resolve(), error: (err) => reject(err) };
	                try {
	                    this.iframeElement.contentWindow.postMessage(postMessageParameters, this.lsConfURL);
	                }
	                catch (e) {
	                    const error = new LSConfError(new ErrorData('RemoveImageSourceFailed'));
	                    return reject(error);
	                }
	            });
	        });
	    }
	    setSpeakerVolume(volume) {
	        return LSConferenceIframe.asyncLock.acquire('apiLock', () => {
	            return new Promise((resolve, reject) => {
	                if (!this.iframeElement.contentWindow) {
	                    return reject(new LSConfError(new ErrorData('InternalError5001')));
	                }
	                if (typeof volume !== 'number') {
	                    return reject(new LSConfError(new ErrorData('SetSpeakerVolumeArgsInvalid')));
	                }
	                if (!Number.isInteger(volume)) {
	                    volume = Math.trunc(volume);
	                }
	                volume = volume < 0 ? 0 : volume > 100 ? 100 : volume;
	                const postMessageParameters = {
	                    type: 'setSpeakerVolume',
	                    volume,
	                };
	                this.setSpeakerVolumeCallback = { success: () => resolve(), error: (err) => reject(err) };
	                try {
	                    this.iframeElement.contentWindow.postMessage(postMessageParameters, this.lsConfURL);
	                }
	                catch (e) {
	                    const error = new LSConfError(new ErrorData('SetSpeakerVolumeFailed'));
	                    return reject(error);
	                }
	            });
	        });
	    }
	    setSeekPosition(currentTime) {
	        return LSConferenceIframe.asyncLock.acquire('apiLock', () => {
	            return new Promise((resolve, reject) => {
	                if (!this.iframeElement.contentWindow) {
	                    return reject(new LSConfError(new ErrorData('InternalError5001')));
	                }
	                if (typeof currentTime !== 'number') {
	                    return reject(new LSConfError(new ErrorData('SetSeekPositionArgsInvalid')));
	                }
	                if (!Number.isInteger(currentTime)) {
	                    currentTime = Math.trunc(currentTime);
	                }
	                const postMessageParameters = {
	                    type: 'setSeekPosition',
	                    currentTime,
	                };
	                this.setSeekPositionCallback = { success: () => resolve(), error: (err) => reject(err) };
	                try {
	                    this.iframeElement.contentWindow.postMessage(postMessageParameters, this.lsConfURL);
	                }
	                catch (e) {
	                    const error = new LSConfError(new ErrorData('SetSeekPositionFailed'));
	                    return reject(error);
	                }
	            });
	        });
	    }
	    setVideoSendBitrate(bitrateKbps) {
	        return LSConferenceIframe.asyncLock.acquire('apiLock', () => {
	            return new Promise((resolve, reject) => {
	                if (!this.iframeElement.contentWindow) {
	                    return reject(new LSConfError(new ErrorData('InternalError5001')));
	                }
	                if (this.state !== 'open') {
	                    return reject(new LSConfError(new ErrorData('SetVideoSendBitrateFailed')));
	                }
	                if (typeof bitrateKbps !== 'number') {
	                    return reject(new LSConfError(new ErrorData('SetVideoSendBitrateArgsInvalid')));
	                }
	                if (this.state === 'open' && this.connectOptions) {
	                    const maxBitrate = this.connectOptions.maxVideoBitrate ? this.connectOptions.maxVideoBitrate : DEFAULT_MAX_BITRATE;
	                    bitrateKbps = bitrateKbps < 100 ? 100 : bitrateKbps > maxBitrate ? maxBitrate : bitrateKbps;
	                }
	                if (!Number.isInteger(bitrateKbps)) {
	                    bitrateKbps = Math.trunc(bitrateKbps);
	                }
	                const postMessageParameters = {
	                    type: 'setVideoSendBitrate',
	                    bitrateKbps,
	                };
	                this.setVideoSendBitrateCallback = { success: () => resolve(), error: (err) => reject(err) };
	                try {
	                    this.iframeElement.contentWindow.postMessage(postMessageParameters, this.lsConfURL);
	                }
	                catch (e) {
	                    const error = new LSConfError(new ErrorData('SetVideoSendBitrateFailed'));
	                    return reject(error);
	                }
	            });
	        });
	    }
	    setVideoSendFramerate(framerate) {
	        return LSConferenceIframe.asyncLock.acquire('apiLock', () => {
	            return new Promise((resolve, reject) => {
	                if (!this.iframeElement.contentWindow) {
	                    return reject(new LSConfError(new ErrorData('InternalError5001')));
	                }
	                if (this.state !== 'open') {
	                    return reject(new LSConfError(new ErrorData('SetVideoSendFramerateFailed')));
	                }
	                if (typeof framerate !== 'number') {
	                    return reject(new LSConfError(new ErrorData('SetVideoSendFramerateArgsInvalid')));
	                }
	                if (this.state === 'open' && this.connectOptions) {
	                    framerate = framerate < 0 ? 0 : framerate > 10000 ? 10000 : framerate;
	                }
	                const postMessageParameters = {
	                    type: 'setVideoSendFramerate',
	                    framerate,
	                };
	                this.setVideoSendFramerateCallback = { success: () => resolve(), error: (err) => reject(err) };
	                try {
	                    this.iframeElement.contentWindow.postMessage(postMessageParameters, this.lsConfURL);
	                }
	                catch (e) {
	                    const error = new LSConfError(new ErrorData('SetVideoSendFramerateFailed'));
	                    return reject(error);
	                }
	            });
	        });
	    }
	    setVideoAudioConstraints(constraints) {
	        return LSConferenceIframe.asyncLock.acquire('apiLock', () => {
	            return new Promise((resolve, reject) => {
	                if (!this.iframeElement.contentWindow) {
	                    return reject(new LSConfError(new ErrorData('InternalError5001')));
	                }
	                if (this.state !== 'open') {
	                    return reject(new LSConfError(new ErrorData('SetVideoAudioConstraintsFailed')));
	                }
	                if (!this.validateMediaStreamConstraintsType(constraints)) {
	                    return reject(new LSConfError(new ErrorData('SetVideoAudioConstraintsArgsInvalid')));
	                }
	                const postMessageParameters = {
	                    type: 'setVideoAudioConstraints',
	                    constraints,
	                };
	                this.setVideoAudioConstraintsCallback = { success: () => resolve(), error: (err) => reject(err) };
	                try {
	                    this.iframeElement.contentWindow.postMessage(postMessageParameters, this.lsConfURL);
	                }
	                catch (e) {
	                    const error = new LSConfError(new ErrorData('SetVideoAudioConstraintsFailed'));
	                    return reject(error);
	                }
	            });
	        });
	    }
	    iframe() {
	        return this.iframeElement;
	    }
	    addEventListener(type, callback, options) {
	        void LSConferenceIframe.asyncLock.acquire('apiLock', () => {
	            if (arguments.length < 2) {
	                throw new TypeError(`Failed to execute 'addEventListener' on '${this.constructor.name}': 2 arguments required, but only ${arguments.length} present.`);
	            }
	            if (typeof callback !== 'function' && typeof callback !== 'object') {
	                throw new TypeError(`Failed to execute 'addEventListener' on '${this.constructor.name}': The callback provided as parameter 2 is not an object.`);
	            }
	            const listeners = this.eventListeners.get(type) || [];
	            listeners.push({ listener: callback, options: options });
	            this.eventListeners.set(type, listeners);
	        });
	    }
	    removeEventListener(type, callback, _options) {
	        void LSConferenceIframe.asyncLock.acquire('apiLock', () => {
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
	        });
	    }
	    dispatchEvent(event) {
	        // eventListeners の options 相当の実装はしない
	        if (!(event instanceof LSConfEvent) && !(event instanceof LSConfErrorEvent)) {
	            throw new TypeError(`Failed to execute 'dispatchEvent' on '${this.constructor.name}': parameter 1 is not of type 'LSConfEvent' or 'LSConfErrorEvent'.`);
	        }
	        const type = event.type;
	        const listeners = this.eventListeners.get(type);
	        if (listeners) {
	            listeners.forEach(({ listener, options }) => {
	                listener.call(this, event);
	                if (!(options && options.once))
	                    return;
	                this.removeEventListener(type, listener, options);
	            });
	        }
	    }
	    addApplicationEventListener(type, callback, options) {
	        void LSConferenceIframe.asyncLock.acquire('apiLock', () => {
	            if (arguments.length < 2) {
	                throw new TypeError(`Failed to execute 'addApplicationEventListener' on '${this.constructor.name}': 2 arguments required, but only ${arguments.length} present.`);
	            }
	            if (typeof callback !== 'function' && typeof callback !== 'object') {
	                throw new TypeError(`Failed to execute 'addApplicationEventListener' on '${this.constructor.name}': The callback provided as parameter 2 is not an object.`);
	            }
	            const listeners = this.applicationEventListeners.get(type) || [];
	            listeners.push({ listener: callback, options: options });
	            this.applicationEventListeners.set(type, listeners);
	        });
	    }
	    removeApplicationEventListener(type, callback, _options) {
	        void LSConferenceIframe.asyncLock.acquire('apiLock', () => {
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
	        });
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
	                if (!(options && options.once))
	                    return;
	                this.removeApplicationEventListener(event.type, listener, options);
	            });
	        }
	    }
	    /**
	     * APIをキューに溜めてから一括実行する
	     * @param type API識別子
	     * @param parameter キューに溜めるパラメータ
	     */
	    messageQueue(type, parameter) {
	        const queue = this.parametersQueue.get(type) || [];
	        queue.push(parameter);
	        // リクエストパラメータをtypeごとにキューに格納
	        this.parametersQueue.set(type, queue);
	        if (queue.length <= 1) {
	            window.setTimeout(() => {
	                const postMessageParameters = { type, queue: this.parametersQueue.get(type) || [] };
	                try {
	                    if (!this.iframeElement.contentWindow) {
	                        console.warn(`Internal error in messageQueue. type: ${type}.`);
	                    }
	                    else {
	                        this.iframeElement.contentWindow.postMessage(postMessageParameters, this.lsConfURL);
	                        this.parametersQueue.set(type, []);
	                    }
	                }
	                catch (e) {
	                    console.warn(`Exception occurred in postMessage. type: ${type}.`, e);
	                }
	            }, DEFAULT_MESSAGE_QUEUE_TIMEOUT_MSEC);
	        }
	    }
	    /**
	     * ./lang 配下の言語ファイル読込
	     * @description 優先言語が設定されている場合は、第二言語以降の設定をfallback用言語とする
	     *     以下の順位で使用言語が決定される
	     *     1. 優先言語の1番目の言語
	     *     2. 1の広域言語(ko-KR だった場合は ko)
	     *     3. 優先言語の2番目以降で`.lang/{言語コード}.json`または`.lang/{広域の言語コード}.json`が存在する言語
	     *     4. ユーザー指定の英語(en)
	     *     5. LSConfのデフォルトの英語(en)
	     * @returns { languages: 言語コード(RFC5646)をキーとした連想配列, fallback: fallback用言語コード }
	     */
	    static loadLocales() {
	        const locales = {
	            languages: {},
	        };
	        const broaderLanguages = window.navigator.languages
	            .filter((language) => language.includes('-'))
	            .map((language) => {
	            // RFC5646で定義されている言語コードは文字数制限が無いためハイフンから手前の文字列を広域言語コードとする
	            // cf: https://datatracker.ietf.org/doc/html/rfc5646#section-4.4
	            return language.slice(0, language.indexOf('-'));
	        });
	        // 優先する言語 及び 広域言語 及び fallback用の'en' の内、重複を除いたものを読込の対象とする
	        const languages = [...new Set(window.navigator.languages.concat(broaderLanguages).concat('en'))];
	        for (const key of languages) {
	            try {
	                // eslint-disable-next-line @typescript-eslint/no-var-requires
	                const json = require(`./lang/${key}.json`);
	                locales.languages[key] = json;
	            }
	            catch (e) {
	                if (e instanceof Error) {
	                    console.warn(`Could not read '${key}' key language file : ${e.message}`);
	                }
	            }
	        }
	        // 第二言語以降の設定をfallback用言語とする(window.navigator.languagesの内{言語コード}.jsonが存在する言語を対象とする)
	        for (const key of languages) {
	            const language = window.navigator.language;
	            if (key != language) {
	                const broaderKey = key.slice(0, key.indexOf('-'));
	                if (locales.languages[key]) {
	                    locales.fallback = key;
	                    break;
	                }
	                if (locales.languages[broaderKey]) {
	                    locales.fallback = broaderKey;
	                    break;
	                }
	            }
	        }
	        return locales;
	    }
	}

	exports.ErrorData = ErrorData;
	exports.LSConfError = LSConfError;
	exports.LSConfErrorEvent = LSConfErrorEvent;
	exports["default"] = LSConferenceIframe;

	Object.defineProperty(exports, '__esModule', { value: true });

}));
