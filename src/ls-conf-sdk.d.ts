export declare type ToolbarItem = {
    type: string;
    iconName: string;
};
export declare type CreateParameters = {
    thetaZoomMaxRange?: number;
    defaultLayout?: LayoutType;
    room?: {
        entranceScreen?: EntranceType;
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
        normal?: {
            enableZoom: boolean;
        };
        theta?: {
            isHiddenFramerate?: boolean;
            enableZenithCorrection?: boolean;
        };
        enableAutoVideoReceiving?: boolean;
        menu?: {
            isHidden?: boolean;
            isHiddenRecordingButton?: boolean;
            isHiddenSharePoVButton?: boolean;
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
            dialog?: {
                inputFocusColor?: string;
            };
        };
    };
    locales?: {
        ja?: unknown;
        en?: unknown;
    };
};
export declare type LayoutType = 'gallery' | 'presentation' | 'fullscreen';
export declare type EntranceType = 'none' | 'click';
export declare type VideoSource = {
    url: string;
    connectionId: string;
    label: string;
    isTheta: boolean;
};
export declare type VideoCodecType = 'h264' | 'vp8' | 'vp9' | 'h265' | 'av1';
export declare type ModeType = 'normal' | 'viewer';
export declare type ConnectOptions = {
    username: string;
    enableVideo: boolean;
    enableAudio: boolean;
    mode?: ModeType;
    maxVideoBitrate?: number;
    maxShareBitrate?: number;
    useDummyDevice?: boolean;
    signalingURL?: string;
    videoCodec?: VideoCodecType;
    videoAudioConstraints?: MediaStreamConstraints;
    screenShareConstraints?: MediaStreamConstraints;
};
export declare type ScreenShareParameters = {
    connectionId: string;
    accessToken: string;
};
export declare type MediaTypes = 'VIDEO_AUDIO' | 'SCREEN_SHARE' | 'VIDEO_FILE';
export declare type TrackKind = 'video' | 'audio';
export declare type DeviceInfo = {
    deviceId: string;
    groupId: string;
    kind: string;
    label: string;
};
export declare type SubView = {
    connectionId: string;
    type: MediaTypes;
    isTheta: boolean;
    enableVideo: boolean;
    enableAudio: boolean;
};
export declare type PoV = {
    pan: number;
    tilt: number;
    fov: number;
};
export declare type ImageMimeType = 'image/png' | 'image/jpeg';
export declare type RotationVector = {
    pitch: number;
    roll: number;
};
export declare type CaptureImageOptions = {
    mimeType?: ImageMimeType;
    qualityArgument?: number;
};
export declare type EventType = 'connected' | 'disconnected' | 'screenShareConnected' | 'screenShareDisconnected' | 'remoteConnectionAdded' | 'remoteConnectionRemoved' | 'remoteTrackAdded' | 'startRecording' | 'stopRecording' | 'sharePoV' | 'error';
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
    private logCallbacks;
    private getMediaDevicesCallback;
    private updatePointerCallback;
    private getCaptureImageCallback;
    private updateCurrentTimeCallback;
    private getLSConfLogCallback;
    private getStatsCallback;
    private startReceiveVideoCallback;
    private stopReceiveVideoCallback;
    private enableZoomCallback;
    private static _handleWindowMessage;
    constructor(parentElement: HTMLElement);
    private handleWindowMessage;
    private setWindowMessageCallback;
    private validateCreateParameters;
    private validateJoinParameters;
    private validateScreenShareParameters;
    private validateSubViewType;
    private validatePoVType;
    private validateRotationVectorType;
    private validateLayoutType;
    private validateCaptureImageOptionsType;
    private validateVideoSourceType;
    private setRequestTimer;
    private __create;
    static create(parentElement: HTMLElement, parameters: Partial<CreateParameters>): Promise<LSConferenceIframe>;
    private __createPlayer;
    static createPlayer(parentElement: HTMLElement, sources: VideoSource[], parameters?: Partial<CreateParameters>): Promise<LSConferenceIframe>;
    join(clientId: string, accessToken: string, connectionId: string, connectOptions: ConnectOptions): Promise<void>;
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
    private getReport;
    getLSConfLog(): Promise<string>;
    getVideoAudioStats(): Promise<string>;
    getScreenShareStats(): Promise<string>;
    getStats(subView: SubView, kind?: TrackKind): Promise<string>;
    changeLayout(layout: LayoutType, subViews?: SubView[]): Promise<void>;
    addRecordingMember(subView: SubView, connectionId: string): Promise<void>;
    removeRecordingMember(subView: SubView, connectionId: string): Promise<void>;
    getCaptureImage(subView: SubView, options: CaptureImageOptions): Promise<Blob>;
    startReceiveVideo(subView: SubView): Promise<void>;
    stopReceiveVideo(subView: SubView): Promise<void>;
    enableZoom(subView: SubView, isEnabled: boolean): Promise<void>;
    iframe(): HTMLIFrameElement;
    addEventListener(type: EventType, callback: Function, options?: AddEventListenerOptions): void;
    removeEventListener(type: EventType, callback: Function, _options?: boolean | EventListenerOptions): void;
    private dispatchEvent;
    addApplicationEventListener(type: string, callback: Function, options?: AddEventListenerOptions): void;
    removeApplicationEventListener(type: string, callback: Function, _options?: boolean | EventListenerOptions): void;
    private dispatchApplicationEvent;
}
export default LSConferenceIframe;
