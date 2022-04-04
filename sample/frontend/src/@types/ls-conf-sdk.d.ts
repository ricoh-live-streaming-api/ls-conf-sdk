export declare type ToolbarItem = {
    type: string;
    iconName: string;
};
export declare type CreateParameters = {
    thetaZoomMaxRange?: number;
    defaultLayout?: 'gallery' | 'presentation' | 'fullscreen';
    toolbar?: {
        isHidden?: boolean;
        isHiddenCameraButton?: boolean;
        isHiddenMicButton?: boolean;
        isHiddenScreenShareButton?: boolean;
        isHiddenParticipantsButton?: boolean;
        isHiddenDeviceSettingButton?: boolean;
        toolbarItems: ToolbarItem[];
    };
    isHiddenVideoMenuButton?: boolean;
    isHiddenRecordingButton?: boolean;
    isHiddenSharePoVButton?: boolean;
    podCoordinates?: {
        upperLeft?: number[];
        lowerRight?: number[];
    };
    subView?: {
        theta?: {
            isHiddenFramerate: boolean;
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
export declare type VideoCodecType = 'h264' | 'vp8' | 'vp9' | 'h265' | 'av1';
export declare type ConnectOptions = {
    username: string;
    enableVideo: boolean;
    enableAudio: boolean;
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
export declare type MediaTypes = 'VIDEO_AUDIO' | 'SCREEN_SHARE';
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
};
export declare type PoV = {
    pan: number;
    tilt: number;
    fov: number;
};
export declare type CaptureImageOptions = {
    mimeType?: 'image/png' | 'image/jpeg';
    qualityArgument?: number;
};
declare class LSConferenceIframe {
    parentElement: HTMLElement;
    iframeElement: HTMLIFrameElement;
    lsConfURL: string;
    clientId: string | null;
    connectOptions: ConnectOptions | null;
    eventListeners: Map<string, {
        listener: Function;
        options: AddEventListenerOptions | undefined;
    }[]>;
    applicationEventListeners: Map<string, {
        listener: Function;
        options: AddEventListenerOptions | undefined;
    }[]>;
    private state;
    private shareRequestedCallback;
    private sharePoVCallback;
    private joinCallback;
    private getSubViewsCallback;
    private highlightCallback;
    private getPoVCallback;
    private setPoVCallback;
    private addRecordingMemberCallback;
    private removeRecordingMemberCallback;
    private logCallbacks;
    private getMediaDevicesCallback;
    private getCaptureImageCallback;
    private getLSConfLogCallback;
    private startReceiveVideoCallback;
    private stopReceiveVideoCallback;
    constructor(parentElement: HTMLElement);
    private setWindowMessageCallback;
    private validateCreateParameters;
    private validateJoinParameters;
    private validateScreenShareParameters;
    private validateSubViewType;
    private validatePoVType;
    private validateCaptureImageOptionsType;
    private setRequestTimer;
    private __create;
    static create(parentElement: HTMLElement, parameters: Partial<CreateParameters>): Promise<LSConferenceIframe>;
    join(clientId: string, accessToken: string, connectionId: string, connectOptions: ConnectOptions): Promise<void>;
    leave(): Promise<void>;
    onShareRequested(callback: Function): void;
    getSubViews(): Promise<SubView[]>;
    highlight(subView: SubView): Promise<void>;
    onSharePoV(callback: Function): void;
    getPoV(subView: SubView): Promise<PoV>;
    setPoV(subView: SubView, poV: PoV): Promise<void>;
    getMediaDevices(): Promise<DeviceInfo[]>;
    setCameraMute(isEnabled: boolean): Promise<void>;
    setCameraDevice(deviceId: string): Promise<void>;
    setMicMute(isEnabled: boolean): Promise<void>;
    setMicDevice(deviceId: string): Promise<void>;
    private getReport;
    getLSConfLog(): Promise<string>;
    /**
     * @deprecated The method should not be used
     */
    getVideoAudioLog(filterOption?: 'head' | 'tail'): Promise<string>;
    /**
     * @deprecated The method should not be used
     */
    getScreenShareLog(filterOption?: 'head' | 'tail'): Promise<string>;
    getVideoAudioStats(): Promise<string>;
    getScreenShareStats(): Promise<string>;
    changeLayout(layout: 'gallery' | 'presentation' | 'fullscreen'): Promise<void>;
    addRecordingMember(subView: SubView, connectionId: string): Promise<void>;
    removeRecordingMember(subView: SubView, connectionId: string): Promise<void>;
    getCaptureImage(subView: SubView, options: CaptureImageOptions): Promise<Blob>;
    startReceiveVideo(subView: SubView): Promise<void>;
    stopReceiveVideo(subView: SubView): Promise<void>;
    iframe(): HTMLIFrameElement;
    addEventListener(type: string, callback: Function, options?: AddEventListenerOptions): void;
    removeEventListener(type: string, callback: Function, _options?: boolean | EventListenerOptions): void;
    dispatchEvent(event: Event): void;
    addApplicationEventListener(type: string, callback: Function, options?: AddEventListenerOptions): void;
    removeApplicationEventListener(type: string, callback: Function, _options?: boolean | EventListenerOptions): void;
    private dispatchApplicationEvent;
}
export default LSConferenceIframe;
