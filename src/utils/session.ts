import { v4 as uuidv4 } from 'uuid';

const SESSION_KEY = 'x-session-id';

let memorySessionId: string | null = null;

const generateSessionId = (): string => {
    try {
        if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
            return crypto.randomUUID();
        }
    } catch {
        // ignore
    }
    return uuidv4();
};

export const getOrCreateSessionId = (): string => {
    if (memorySessionId) return memorySessionId;

    try {
        const stored = localStorage.getItem(SESSION_KEY);
        if (stored) {
            memorySessionId = stored;
            return stored;
        }
    } catch {
        // localStorage can throw in some browsers (e.g. Safari private mode)
    }

    const sessionId = generateSessionId();
    memorySessionId = sessionId;

    try {
        localStorage.setItem(SESSION_KEY, sessionId);
    } catch {
        // ignore if storage is unavailable
    }

    return sessionId;
};
