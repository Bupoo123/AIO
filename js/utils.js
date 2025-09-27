/** ========================
 *  工具函数
 *  ======================== */
const sha256 = async (text) => {
    const enc = new TextEncoder().encode(text);
    const buf = await crypto.subtle.digest('SHA-256', enc);
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('');
};

const genId = () => Date.now() + Math.floor(Math.random()*1000);

const genTempPassword = (len=10) => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%^&*';
    let s=''; for(let i=0;i<len;i++){ s += chars[Math.floor(Math.random()*chars.length)]; }
    return s;
};

const clone = (obj) => JSON.parse(JSON.stringify(obj));

// 会话管理 - 支持页面关闭自动退出
class SessionManager {
    constructor() {
        this.sessionKey = 'user_session';
        this.heartbeatInterval = null;
        this.heartbeatIntervalMs = 30000; // 30秒心跳
    }

    startSession(user) {
        const session = {
            user: user,
            loginTime: Date.now(),
            lastActivity: Date.now()
        };
        localStorage.setItem(this.sessionKey, JSON.stringify(session));
        this.startHeartbeat();
    }

    endSession() {
        localStorage.removeItem(this.sessionKey);
        this.stopHeartbeat();
    }

    getCurrentSession() {
        const session = localStorage.getItem(this.sessionKey);
        if (!session) return null;
        
        try {
            const parsed = JSON.parse(session);
            // 检查会话是否过期（24小时）
            const now = Date.now();
            const sessionAge = now - parsed.loginTime;
            const maxAge = 24 * 60 * 60 * 1000; // 24小时
            
            if (sessionAge > maxAge) {
                this.endSession();
                return null;
            }
            
            return parsed;
        } catch (e) {
            this.endSession();
            return null;
        }
    }

    updateActivity() {
        const session = this.getCurrentSession();
        if (session) {
            session.lastActivity = Date.now();
            localStorage.setItem(this.sessionKey, JSON.stringify(session));
        }
    }

    startHeartbeat() {
        this.stopHeartbeat();
        this.heartbeatInterval = setInterval(() => {
            this.updateActivity();
        }, this.heartbeatIntervalMs);
    }

    stopHeartbeat() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
    }

    // 页面关闭时清理会话
    setupPageUnload() {
        window.addEventListener('beforeunload', () => {
            this.endSession();
        });
        
        window.addEventListener('pagehide', () => {
            this.endSession();
        });
    }
}

// 全局会话管理器实例
const sessionManager = new SessionManager();
