/** ========================
 *  用户管理模块
 *  ======================== */
class UserManager {
    constructor() {
        this.users = this.loadUsers();
        this.ensureDefaultAdmin();
    }

    /* ---------- 用户数据管理 ---------- */
    loadUsers() {
        const saved = localStorage.getItem('users');
        return saved ? JSON.parse(saved) : [];
    }

    saveUsers() { 
        localStorage.setItem('users', JSON.stringify(this.users)); 
    }

    async ensureDefaultAdmin() {
        if (!this.users.some(u => u.role === 'admin')) {
            const pwd = 'admin123';
            const hash = await sha256(pwd);
            this.users.push({
                id: genId(),
                username: 'admin',
                role: 'admin',
                passwordHash: hash,
                mustReset: false,
                tempPassword: null
            });
            this.saveUsers();
        }
    }

    getUserByName(name) { 
        return this.users.find(u => u.username === name); 
    }

    getUserById(id) { 
        return this.users.find(u => u.id === id); 
    }

    /* ---------- 认证相关 ---------- */
    async authenticate(username, password) {
        const user = this.getUserByName(username);
        if (!user) return { ok: false, reason: 'notfound' };
        
        const hash = await sha256(password);
        if (user.passwordHash === hash || (user.tempPassword && await sha256(user.tempPassword) === hash)) {
            // 如果是用临时密码登录，则强制 mustReset
            if (user.tempPassword && await sha256(user.tempPassword) === hash) {
                user.mustReset = true;
                this.saveUsers();
            }
            
            const currentUser = { id: user.id, username: user.username, role: user.role };
            sessionManager.startSession(currentUser);
            return { ok: true, mustReset: user.mustReset };
        }
        return { ok: false, reason: 'badpass' };
    }

    logout() {
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
        const u = this.getUserById(userId);
        if (!u) return false;
        u.passwordHash = await sha256(newPassword);
        u.tempPassword = null;
        u.mustReset = false;
        this.saveUsers();
        return true;
    }

    async createUser({username, role = 'user', tempPassword}) {
        username = username.trim();
        if (!username) throw new Error('用户名不能为空');
        if (this.getUserByName(username)) throw new Error('该用户名已存在');

        const finalTemp = tempPassword && tempPassword.trim() ? tempPassword.trim() : genTempPassword();
        const tempHash = await sha256(finalTemp);

        const u = {
            id: genId(),
            username,
            role,
            passwordHash: tempHash,
            mustReset: true,
            tempPassword: finalTemp
        };
        this.users.push(u);
        this.saveUsers();
        return clone(u);
    }

    deleteUser(userId) {
        const currentUser = this.getCurrentUser();
        if (currentUser && currentUser.id === userId) {
            throw new Error('不能删除当前登录的自己');
        }
        this.users = this.users.filter(u => u.id !== userId);
        this.saveUsers();
    }

    async resetUserPassword(userId, newTempPwd = genTempPassword()) {
        const u = this.getUserById(userId);
        if (!u) throw new Error('用户不存在');
        u.passwordHash = await sha256(newTempPwd);
        u.mustReset = true;
        u.tempPassword = newTempPwd;
        this.saveUsers();
        return newTempPwd;
    }

    toggleRole(userId) {
        const u = this.getUserById(userId);
        if (!u) throw new Error('用户不存在');
        u.role = (u.role === 'admin') ? 'user' : 'admin';
        this.saveUsers();
    }

    forceMustReset(userId) {
        const u = this.getUserById(userId);
        if (!u) throw new Error('用户不存在');
        u.mustReset = true;
        this.saveUsers();
    }

    /* ---------- 用户界面渲染 ---------- */
    renderUsers() {
        const tbody = document.getElementById('usersTableBody');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        this.users.forEach(u => {
            const tr = document.createElement('tr');
            const pwdState = u.tempPassword ? 
                `<span class="tag orange">临时密码有效</span>` : 
                (u.mustReset ? `<span class="tag orange">待改密</span>` : `<span class="tag green">已设置</span>`);
            
            tr.innerHTML = `
                <td>${u.username}</td>
                <td><span class="tag">${u.role === 'admin' ? '管理员' : '普通用户'}</span></td>
                <td>${pwdState}</td>
                <td>
                    <div class="row" style="gap:0.4rem; flex-wrap:wrap;">
                        <button class="btn-ghost" onclick="userManager.toggleRole(${u.id})">${u.role==='admin'?'设为用户':'设为管理员'}</button>
                        <button class="btn-ghost" onclick="userManager.forceMustReset(${u.id})">强制改密</button>
                        <button class="btn-ghost" onclick="userManager.resetUserPassword(${u.id})">重置密码</button>
                        ${u.tempPassword ? `<button class="btn-ghost" onclick="userManager.copyTempPassword('${u.tempPassword}')">复制临时密码</button>` : ''}
                        <button class="btn-danger" onclick="userManager.deleteUser(${u.id})">删除</button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    async copyTempPassword(password) {
        try {
            await navigator.clipboard.writeText(password);
            alert('已复制临时密码');
        } catch {
            alert('复制失败，请手动选择复制');
        }
    }

    // 暴露给全局的UI操作函数
    toggleRole(userId) {
        try {
            this.toggleRole(userId);
            this.renderUsers();
        } catch (e) { 
            alert(e.message); 
        }
    }

    forceMustReset(userId) {
        try {
            this.forceMustReset(userId);
            this.renderUsers();
        } catch (e) { 
            alert(e.message); 
        }
    }

    async resetUserPassword(userId) {
        try {
            const newTemp = await this.resetUserPassword(userId);
            this.renderUsers();
            alert(`新的临时密码：${newTemp}\n请通知用户使用临时密码登录并尽快改密。`);
        } catch (e) { 
            alert(e.message); 
        }
    }

    deleteUser(userId) {
        try {
            const user = this.getUserById(userId);
            if (confirm(`确定删除用户：${user?.username || ''}？`)) {
                this.deleteUser(userId);
                this.renderUsers();
            }
        } catch (e) { 
            alert(e.message); 
        }
    }
}

// 全局用户管理器实例
const userManager = new UserManager();
