export declare type CreateParameters = {
    thetaZoomMaxRange: number;
    defaultLayout: 'gallery' | 'presentation' | 'fullscreen';
    toolbar: {
        isHidden: boolean;
        isHiddenCameraButton: boolean;
        isHiddenMicButton: boolean;
        isHiddenScreenShareButton: boolean;
        isHiddenParticipantsButton: boolean;
        isHiddenDeviceSettingButton: boolean;
    };
    isHiddenVideoMenuButton: boolean;
    isHiddenRecordingButton: boolean;
    podCoordinates: {
        upperLeft: number[];
        lowerRight: number[];
    };
    lsConfURL: string;
    theme: {
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
};
export declare type ConnectOptions = {
    username: string;
    enableVideo: boolean;
    enableAudio: boolean;
    maxVideoBitrate?: number;
    maxShareBitrate?: number;
    useDummyDevice?: boolean;
    signalingURL?: string;
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
    private shareRequestedCallback;
    private logCallbacks;
    constructor(parentElement: HTMLElement);
    private setWindowMessageCallback;
    private validateCreateParameters;
    private validateJoinParameters;
    private __create;
    static create(parentElement: HTMLElement, parameters: Partial<CreateParameters>): Promise<LSConferenceIframe>;
    join(clientId: string, accessToken: string, connectOptions: ConnectOptions): Promise<void>;
    leave(): Promise<void>;
    onShareRequested(callback: Function): void;
    setCameraMute(isEnabled: boolean): Promise<void>;
    setMicMute(isEnabled: boolean): Promise<void>;
    private getReport;
    getVideoAudioLog(filterOption?: 'head' | 'tail'): Promise<string>;
    getScreenShareLog(filterOption?: 'head' | 'tail'): Promise<string>;
    getVideoAudioStats(): Promise<string>;
    getScreenShareStats(): Promise<string>;
    changeLayout(layout: 'gallery' | 'presentation' | 'fullscreen'): Promise<void>;
    iframe(): HTMLIFrameElement;
    addEventListener(type: string, callback: Function, options?: AddEventListenerOptions): void;
    removeEventListener(type: string, callback: Function, _options?: boolean | EventListenerOptions): void;
    dispatchEvent(event: Event): void;
}
export default LSConferenceIframe;
