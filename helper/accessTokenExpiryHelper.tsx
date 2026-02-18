/**
 * Kiểm tra JWT token có expired hay không
 * @param token - JWT access token
 * @param bufferSeconds - Thời gian buffer trước khi expired (mặc định 30s)
 * @returns true nếu token đã/sắp expired
 */
export const isTokenExpired = (token: string, bufferSeconds: number = 30): boolean => {
    try {
        // Decode JWT payload (không verify signature - chỉ đọc)
        const payload = JSON.parse(atob(token.split('.')[1]));
        
        if (!payload.exp) {
            return true; // Không có exp claim = coi như expired
        }
        
        // exp là unix timestamp (giây), Date.now() là milliseconds
        const currentTime = Math.floor(Date.now() / 1000);
        
        // Kiểm tra nếu token đã hết hạn hoặc sắp hết (buffer time)
        return payload.exp < (currentTime + bufferSeconds);
    } catch (error) {
        // Token không hợp lệ hoặc decode lỗi
        console.error('[JWT] Failed to decode token:', error);
        return true;
    }
};

/**
 * Lấy thời gian hết hạn của token
 * @param token - JWT access token
 * @returns Date object hoặc null nếu invalid
 */
export const getTokenExpiry = (token: string): Date | null => {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (!payload.exp) return null;
        return new Date(payload.exp * 1000); // Chuyển sang milliseconds
    } catch {
        return null;
    }
};

/**
 * Lấy thời gian còn lại của token (giây)
 * @param token - JWT access token
 * @returns số giây còn lại, hoặc 0 nếu expired/invalid
 */
export const getTokenTimeRemaining = (token: string): number => {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (!payload.exp) return 0;
        
        const currentTime = Math.floor(Date.now() / 1000);
        const remaining = payload.exp - currentTime;
        
        return remaining > 0 ? remaining : 0;
    } catch {
        return 0;
    }
};