/** ========================
 *  用户管理模块（连接后端API）
 *  ======================== */
class UserManager {
    constructor() {
        this.users = [];
        this.apiService = window.apiService;
        this.initializeAuth();
    }

    // 初始化认证状态
    async initializeAuth() {
        if (this.apiService.isAuthenticated()) {
            try {
                const response = await this.apiService.getCurrentUser();
                if (response.success) {
                    this.currentUser = response.data.user;
                }
            } catch (error) {
                console.error('初始化认证失败:', error);
                this.apiService.logout();
            }
        }
    }

    // 兼容旧版本的方法
    loadUsers() {
        return this.users;
    }

    saveUsers() {
        // 后端存储，无需本地保存
    }

    async ensureDefaultAdmin() {
        // 后端会自动创建默认管理员
    }

    getUserByName(name) { 
        return this.users.find(u => u.username === name); 
    }

    getUserById(id) { 
        return this.users.find(u => u.id === id); 
    }

    /* ---------- 认证相关 ---------- */
    async authenticate(username, password) {
        try {
            const response = await this.apiService.login({ username, password });
            if (response.success) {
                this.currentUser = response.data.user;
                sessionManager.startSession(this.currentUser);
                return { ok: true, mustReset: response.data.mustReset };
            }
            return { ok: false, reason: 'invalid' };
        } catch (error) {
            console.error('认证失败:', error);
            return { ok: false, reason: 'error' };
        }
    }

    logout() {
        this.currentUser = null;
        this.apiService.logout();
        sessionManager.endSession();
    }

    getCurrentUser() {
        const session = sessionManager.getCurrentSession();
        return session ? session.user : null;
    }

    isAdmin() { 
        const user = this.getCurrentUser();
        return user && user.role === 'admin'; 
    }

    /* ---------- 密码管理 ---------- */
    async setPassword(userId, newPassword) {
        try {
            const response = await this.apiService.changePassword({
                currentPassword: '', // 管理员重置密码不需要当前密码
                newPassword
            });
            return response.success;
        } catch (error) {
            console.error('设置密码失败:', error);
            return false;
        }
    }

    async createUser({username, role = 'user', tempPassword}) {
        try {
            const response = await this.apiService.createUser({
                username,
                role,
                tempPassword
            });
            
            if (response.success) {
                return {
                    id: response.data.user._id,
                    username: response.data.user.username,
                    role: response.data.user.role,
                    tempPassword: response.data.tempPassword
                };
            }
            throw new Error(response.message || '创建用户失败');
        } catch (error) {
            console.error('创建用户失败:', error);
            throw error;
        }
    }

    async renderUsers() {
        try {
            const response = await this.apiService.getUsers();
            if (response.success) {
                this.users = response.data.users;
                this.renderUsersTable();
            }
        } catch (error) {
            console.error('获取用户列表失败:', error);
        }
    }

    renderUsersTable() {
        const tbody = document.getElementById('usersTableBody');
        if (!tbody) return;

        tbody.innerHTML = this.users.map(u => `
            <tr>
                <td>${u.username}</td>
                <td>${u.role === 'admin' ? '管理员' : '普通用户'}</td>
                <td>${u.mustReset ? '需要重置' : '正常'}</td>
                <td>
                    <button onclick="userManager.editUser('${u._id}')" class="btn-small">编辑</button>
                    <button onclick="userManager.resetPassword('${u._id}')" class="btn-small">重置密码</button>
                    ${u._id !== this.getCurrentUser()?.id ? `<button onclick="userManager.deleteUser('${u._id}')" class="btn-small danger">删除</button>` : ''}
                </td>
            </tr>
        `).join('');
    }

    async editUser(userId) {
        const user = this.users.find(u => u._id === userId);
        if (!user) return;

        document.getElementById('editUsername').value = user.username;
        document.getElementById('editRole').value = user.role;
        document.getElementById('editTempPwd').value = '';
        document.getElementById('userEditTitle').textContent = '编辑用户';
        document.getElementById('userEditOverlay').style.display = 'flex';
        
        // 存储当前编辑的用户ID
        document.getElementById('userEditForm').dataset.userId = userId;
    }

    async resetPassword(userId) {
        try {
            const response = await this.apiService.resetUserPassword(userId);
            if (response.success) {
                alert(`密码重置成功！临时密码：${response.data.tempPassword}`);
                this.renderUsers();
            } else {
                alert('密码重置失败：' + response.message);
            }
        } catch (error) {
            console.error('重置密码失败:', error);
            alert('密码重置失败：' + error.message);
        }
    }

    async deleteUser(userId) {
        if (!confirm('确定要删除这个用户吗？')) return;

        try {
            const response = await this.apiService.deleteUser(userId);
            if (response.success) {
                alert('用户删除成功');
                this.renderUsers();
            } else {
                alert('用户删除失败：' + response.message);
            }
        } catch (error) {
            console.error('删除用户失败:', error);
            alert('用户删除失败：' + error.message);
        }
    }

    async saveUser() {
        const form = document.getElementById('userEditForm');
        const userId = form.dataset.userId;
        const username = document.getElementById('editUsername').value.trim();
        const role = document.getElementById('editRole').value;
        const tempPassword = document.getElementById('editTempPwd').value.trim();

        try {
            let response;
            if (userId) {
                // 编辑用户
                response = await this.apiService.updateUser(userId, {
                    role,
                    isActive: true
                });
            } else {
                // 创建用户
                response = await this.apiService.createUser({
                    username,
                    role,
                    tempPassword: tempPassword || undefined
                });
            }

            if (response.success) {
                alert(userId ? '用户更新成功' : `用户创建成功！临时密码：${response.data.tempPassword}`);
                this.renderUsers();
                this.closeUserEdit();
            } else {
                alert('操作失败：' + response.message);
            }
        } catch (error) {
            console.error('保存用户失败:', error);
            alert('操作失败：' + error.message);
        }
    }

    closeUserEdit() {
        document.getElementById('userEditOverlay').style.display = 'none';
        document.getElementById('userEditForm').reset();
        document.getElementById('userEditForm').dataset.userId = '';
    }
}

// 创建全局实例
window.userManager = new UserManager();