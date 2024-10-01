export type ToolbarItem = {
    type: string;
    iconName: string;
    tips?: string;
};
export type SubViewMenuItem = {
    type: string;
    label: string;
    targetSubView?: {
        type?: MediaTypes;
        isTheta?: boolean;
    };
};
export type CreateParameters = {
    thetaZoomMaxRange?: number;
    defaultLayout?: LayoutType;
    room?: {
        entranceScreen?: EntranceType;
    };
    player?: {
        isHiddenVideoControlBar?: boolean;
    };
    toolbar?: {
        isHidden?: boolean;
        isHiddenCameraButton?: boolean;
        isHiddenMicButton?: boolean;
        isHiddenScreenShareButton?: boolean;
        isHiddenParticipantsButton?: boolean;
        isHiddenDeviceSettingButton?: boolean;
        isHiddenExitButton?: boolean;
        customItems?: ToolbarItem[];
    };
    podCoordinates?: {
        upperLeft?: number[];
        lowerRight?: number[];
    };
    subView?: {
        enableAutoVideoReceiving?: boolean;
        speakingThreshold?: number;
        speakingIndicatorDuration?: number;
        isHiddenDrawingButton?: boolean;
        drawingInterval?: number;
        drawingColor?: string;
        drawingOption?: StrokeOption;
        normal?: {
            enableZoom: boolean;
            isHiddenFramerate?: boolean;
        };
        theta?: {
            isHiddenFramerate?: boolean;
            enableZenithCorrection?: boolean;
        };
        menu?: {
            isHidden?: boolean;
            isHiddenRecordingButton?: boolean;
            isHiddenSharePoVButton?: boolean;
            customItems?: SubViewMenuItem[];
        };
    };
    lsConfURL?: string;
    theme?: {
        primary?: string;
        background?: string;
        surface?: string;
        onPrimary?: string;
        primaryTextColor?: string;
        secondaryTextColor?: string;
        disabledTextColor?: string;
        components?: {
            participantsVideoContainer?: {
                background?: string;
                subViewSwitchBackgroundColor?: string;
                subViewSwitchIconColor?: string;
            };
            toolbar?: {
                background?: string;
                iconColor?: string;
            };
            video?: {
                background?: string;
                textColor?: string;
                textBackgroundColor?: string;
                iconColor?: string;
                menuBackgroundColor?: string;
                menuTextColor?: string;
                highlightBorderColor?: string;
                highlightShadowColor?: string;
            };
        };
    };
    locales?: {
        languages: {
            [x: string]: string;
        };
        fallback?: string;
    };
};
export declare type LayoutType = 'gallery' | 'presentation' | 'fullscreen';
export declare type EntranceType = 'none' | 'click';
/** ストロークの設定オプション */
export type StrokeOption = {
    /** ストロークの太さ */
    size?: number;
};
export type VideoSource = {
    url: string | Blob;
    connectionId: string;
    label: string;
    isTheta: boolean;
    metaUrl?: string;
};
export type ImageSource = {
    url: string;
    connectionId: string;
    label: string;
    isTheta: boolean;
};
export declare type VideoCodecType = 'h264' | 'vp8' | 'vp9' | 'h265' | 'av1';
export declare type IceServersProtocolType = 'all' | 'udp' | 'tcp' | 'tls' | 'tcp_tls';
export declare type MuteType = 'hard' | 'soft';
export declare type ModeType = 'normal' | 'viewer';
export type ConnectOptions = {
    username: string;
    enableVideo: boolean;
    enableAudio: boolean;
    audioMuteType?: MuteType;
    mode?: ModeType;
    maxVideoBitrate?: number;
    maxShareBitrate?: number;
    useDummyDevice?: boolean;
    signalingURL?: string;
    videoCodec?: VideoCodecType;
    videoAudioConstraints?: MediaStreamConstraints;
    screenShareConstraints?: MediaStreamConstraints;
    iceServersProtocol?: IceServersProtocolType;
};
export type MediaTypes = 'VIDEO_AUDIO' | 'SCREEN_SHARE' | 'VIDEO_FILE' | 'IMAGE_FILE';
export type TrackKind = 'video' | 'audio';
export type DeviceInfo = {
    deviceId: string;
    groupId: string;
    kind: string;
    label: string;
    isSelected: boolean;
    capabilities?: MediaTrackCapabilities;
};
export type SubView = {
    connectionId: string;
    type: MediaTypes;
    isTheta: boolean;
    enableVideo: boolean;
    enableAudio: boolean;
};
export type PoV = {
    pan: number;
    tilt: number;
    fov: number;
};
/** ストローク情報 */
export type Stroke = {
    /** ストロークの座標情報 */
    points: number[][];
    /** ストロークを書き終わったかどうか*/
    isEnded: boolean;
    /** ストロークのオプション */
    option?: StrokeOption;
};
export declare type ImageMimeType = 'image/png' | 'image/jpeg';
export type RotationVector = {
    pitch: number;
    roll: number;
};
export type CaptureImageOptions = {
    mimeType?: ImageMimeType;
    qualityArgument?: number;
};
export type PlayerState = 'loading' | 'playing' | 'pause' | 'ended';
export type LogCategory = 'environment' | 'setting' | 'recording' | 'device' | 'member' | 'analysis' | 'clientSdk';
export type EventType = 'connected' | 'disconnected' | 'screenShareConnected' | 'screenShareDisconnected' | 'remoteConnectionAdded' | 'remoteConnectionRemoved' | 'remoteTrackAdded' | 'startRecording' | 'stopRecording' | 'sharePoV' | 'strokeUpdated' | 'mediaDeviceChanged' | 'playerStateChanged' | 'changeMediaStability' | 'userOperation' | 'log' | 'error';
export type ErrorType = 'RequestError' | 'InternalError';
export type ErrorDetail = {
    code: number;
    type: ErrorType;
    error: string;
};
export declare class ErrorData {
    detail: ErrorDetail;
    data?: unknown;
    constructor(errorName: string, data?: unknown);
    private getErrorCode;
    toReportString: () => string;
}
export declare class LSConfErrorEvent extends ErrorEvent {
    toReportString: () => string;
    constructor(errorData: ErrorData);
}
export declare class LSConfError extends Error {
    detail: ErrorDetail;
    data?: unknown;
    toReportString: () => string;
    constructor(errorData: ErrorData);
}
declare class LSConferenceIframe {
    parentElement: HTMLElement;
    iframeElement: HTMLIFrameElement;
    lsConfURL: string;
    clientId: string | null;
    connectOptions: ConnectOptions | null;
    eventListeners: Map<EventType, {
        listener: Function;
        options: AddEventListenerOptions | undefined;
    }[]>;
    applicationEventListeners: Map<string, {
        listener: Function;
        options: AddEventListenerOptions | undefined;
    }[]>;
    private state;
    private shareRequestedCallback;
    private joinCallback;
    private getSubViewsCallback;
    private highlightCallback;
    private getPoVCallback;
    private setPoVCallback;
    private setRotationVectorCallback;
    private addRecordingMemberCallback;
    private removeRecordingMemberCallback;
    private getReportCallbacks;
    private getMediaDevicesCallback;
    private getCaptureImageCallback;
    private updateCurrentTimeCallback;
    private getLSConfLogCallback;
    private getStatsCallback;
    private startReceiveVideoCallback;
    private stopReceiveVideoCallback;
    private enableZoomCallback;
    private addVideoSourceCallback;
    private addImageSourceCallback;
    private removeImageSourceCallback;
    private changePlayerStateCallback;
    private setSeekPositionCallback;
    private setSpeakerVolumeCallback;
    private setVideoSendBitrateCallback;
    private setVideoSendFramerateCallback;
    private setVideoAudioConstraintsCallback;
    private moveSubViewCallback;
    private static _handleWindowMessage;
    private parametersQueue;
    constructor(parentElement: HTMLElement);
    private handleWindowMessage;
    private setWindowMessageCallback;
    private validateCreateParameters;
    private validateJoinParameters;
    private validateSubViewType;
    private validatePoVType;
    private validateRotationVectorType;
    private validateStrokeType;
    private validateStrokeOptionType;
    private validateLayoutType;
    private validateCaptureImageOptionsType;
    private validateVideoSourceType;
    private validateImageSourceType;
    private validatePlayerStateType;
    private validateMediaStreamConstraintsType;
    private validateUrl;
    private setRequestTimer;
    private __create;
    static create(parentElement: HTMLElement, parameters: Partial<CreateParameters>): Promise<LSConferenceIframe>;
    private __createPlayer;
    static createPlayer(parentElement: HTMLElement, sources: VideoSource[] | string, parameters?: Partial<CreateParameters>): Promise<LSConferenceIframe>;
    join(clientId: string, accessToken: string, connectOptions: ConnectOptions): Promise<void>;
    leave(): Promise<void>;
    onShareRequested(callback: Function): void;
    getSubViews(): Promise<SubView[]>;
    highlight(subView: SubView): Promise<void>;
    getPoV(subView: SubView): Promise<PoV>;
    setPoV(subView: SubView, poV: PoV): Promise<void>;
    setRotationVector(subView: SubView, rotationVector: RotationVector): Promise<void>;
    getMediaDevices(): Promise<DeviceInfo[]>;
    setCameraMute(isEnabled: boolean): Promise<void>;
    setCameraDevice(deviceId: string): Promise<void>;
    setMicMute(isEnabled: boolean): Promise<void>;
    setMicDevice(deviceId: string): Promise<void>;
    enablePointer(isEnabled: boolean): Promise<void>;
    updatePointer(subView: SubView, connectionId: string, poV: PoV | null, username?: string, color?: string): Promise<void>;
    updateStroke(subView: SubView, connectionId: string, stroke: Stroke, username?: string, color?: string): Promise<void>;
    private getReport;
    getLSConfLog(): Promise<string>;
    getVideoAudioStats(): Promise<string>;
    getScreenShareStats(): Promise<string>;
    getStats(subView: SubView, kind?: TrackKind): Promise<string>;
    changeLayout(layout: LayoutType, subViews?: SubView[]): Promise<void>;
    moveSubView(to: 'presentation_main' | 'presentation_sub' | 'fullscreen', subView: SubView): Promise<void>;
    addRecordingMember(subView: SubView, connectionId: string): Promise<void>;
    removeRecordingMember(subView: SubView, connectionId: string): Promise<void>;
    getCaptureImage(subView: SubView, options: CaptureImageOptions): Promise<Blob>;
    startReceiveVideo(subView: SubView): Promise<void>;
    stopReceiveVideo(subView: SubView): Promise<void>;
    changePlayerState(state: string): Promise<void>;
    enableZoom(subView: SubView, isEnabled: boolean): Promise<void>;
    addVideoSource(source: VideoSource): Promise<void>;
    addImageSource(source: ImageSource, parentConnectionId?: string): Promise<void>;
    removeImageSource(connectionId: string): Promise<void>;
    setSpeakerVolume(volume: number): Promise<void>;
    setSeekPosition(currentTime: number): Promise<void>;
    setVideoSendBitrate(bitrateKbps: number): Promise<void>;
    setVideoSendFramerate(framerate: number): Promise<void>;
    setVideoAudioConstraints(constraints: MediaStreamConstraints): Promise<void>;
    iframe(): HTMLIFrameElement;
    addEventListener(type: EventType, callback: Function, options?: AddEventListenerOptions): void;
    removeEventListener(type: EventType, callback: Function, _options?: boolean | EventListenerOptions): void;
    private dispatchEvent;
    addApplicationEventListener(type: string, callback: Function, options?: AddEventListenerOptions): void;
    removeApplicationEventListener(type: string, callback: Function, _options?: boolean | EventListenerOptions): void;
    private dispatchApplicationEvent;
    /**
     * APIをキューに溜めてから一括実行する
     * @param type API識別子
     * @param parameter キューに溜めるパラメータ
     */
    private messageQueue;
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
    private static loadLocales;
}
export default LSConferenceIframe;
