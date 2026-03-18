import { v4 as uuidv4 } from 'uuid'; // Chạy "npm install uuid" nếu chưa cài thư viện này
// Hoặc nếu không muốn dùng thư viện uuid, bạn có thể xóa dòng trên và dùng hàm tự viết phía dưới.

const SESSION_KEY = 'x-session-id';

export const getOrCreateSessionId = (): string => {
    let sessionId = localStorage.getItem(SESSION_KEY);

    if (!sessionId) {
        // Nếu môi trường hỗ trợ (có HTTPS/localhost), dùng crypto.randomUUID()
        // Nếu không, bạn có thể dùng uuidv4() từ thư viện 'uuid'
        sessionId = typeof crypto !== 'undefined' && crypto.randomUUID
            ? crypto.randomUUID()
            : uuidv4();

        localStorage.setItem(SESSION_KEY, sessionId);
    }

    return sessionId;
};
