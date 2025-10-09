/** ========================
 *  API服务模块
 *  ======================== */

class ApiService {
    constructor() {
        this.baseURL = 'https://backend-4keycj5me-bupoos-projects.vercel.app/api';
        this.token = localStorage.getItem('authToken');
    }

    // 设置认证令牌
    setToken(token) {
        this.token = token;
        if (token) {
            localStorage.setItem('authToken', token);
        } else {
            localStorage.removeItem('authToken');
        }
    }

    // 获取请求头
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        
        return headers;
    }

    // 通用请求方法
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: this.getHeaders(),
            ...options
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || '请求失败');
            }

            return data;
        } catch (error) {
            console.error('API请求错误:', error);
            throw error;
        }
    }

    // 认证相关API
    async login(credentials) {
        const response = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        });
        
        if (response.success && response.data.token) {
            this.setToken(response.data.token);
        }
        
        return response;
    }

    async getCurrentUser() {
        return this.request('/auth/me');
    }

    async changePassword(passwordData) {
        return this.request('/auth/change-password', {
            method: 'POST',
            body: JSON.stringify(passwordData)
        });
    }

    // 用户管理API（管理员功能）
    async createUser(userData) {
        return this.request('/auth/users', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }

    async getUsers() {
        return this.request('/auth/users');
    }

    async resetUserPassword(userId, tempPassword) {
        return this.request(`/auth/users/${userId}/password`, {
            method: 'PUT',
            body: JSON.stringify({ tempPassword })
        });
    }

    async updateUser(userId, userData) {
        return this.request(`/auth/users/${userId}`, {
            method: 'PUT',
            body: JSON.stringify(userData)
        });
    }

    async deleteUser(userId) {
        return this.request(`/auth/users/${userId}`, {
            method: 'DELETE'
        });
    }

    // 工具管理API
    async getTools() {
        return this.request('/tools');
    }

    async createTool(toolData) {
        return this.request('/tools', {
            method: 'POST',
            body: JSON.stringify(toolData)
        });
    }

    async updateTool(toolId, toolData) {
        return this.request(`/tools/${toolId}`, {
            method: 'PUT',
            body: JSON.stringify(toolData)
        });
    }

    async deleteTool(toolId) {
        return this.request(`/tools/${toolId}`, {
            method: 'DELETE'
        });
    }

    async getAllTools(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = queryString ? `/tools/admin/all?${queryString}` : '/tools/admin/all';
        return this.request(endpoint);
    }

    // 登出
    logout() {
        this.setToken(null);
    }

    // 检查是否已登录
    isAuthenticated() {
        return !!this.token;
    }
}

// 创建全局实例
window.apiService = new ApiService();
