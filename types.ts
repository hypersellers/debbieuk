// FIX: Removed circular self-import of `AppState` which caused declaration conflicts.
export enum AppState {
    Splash,
    Login,
    Register,
    ForgotPassword,
    Practice,
    Assessment,
}

export interface User {
    email: string;
}

export interface TranscriptMessage {
    author: 'user' | 'debbie';
    text: string;
}