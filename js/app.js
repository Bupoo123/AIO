/** ========================
 *  主应用模块
 *  ======================== */
class App {
    constructor() {
        this.updateLogs = this.loadUpdateLogs();
        this.setupEventListeners();
        this.initializeApp();
    }

    /* ---------- 更新日志管理 ---------- */
    loadUpdateLogs() { 
        const saved = localStorage.getItem('updateLogs'); 
        return saved ? JSON.parse(saved) : []; 
    }

    saveUpdateLogs() { 
        localStorage.setItem('updateLogs', JSON.stringify(this.updateLogs)); 
    }

    addUpdateLog(content) {
        const newLog = { 
            id: genId(), 
            date: new Date().toISOString().split('T')[0], 
            content 
        };
        this.updateLogs.unshift(newLog);
        this.saveUpdateLogs();
        this.renderUpdateLogs();
    }

    renderUpdateLogs() {
        const box = document.getElementById('updateLog');
        if (!box) return;
        
        box.innerHTML = '';
        this.updateLogs.forEach(log => {
            const item = document.createElement('div');
            item.className = 'update-item';
            item.innerHTML = `<span class="update-date">${log.date}</span><p>${log.content}</p>`;
            box.appendChild(item);
        });
    }

    /* ---------- 应用初始化 ---------- */
    async initializeApp() {
        // 设置页面关闭自动退出
        sessionManager.setupPageUnload();
        
        // 检查会话状态
        const session = sessionManager.getCurrentSession();
        if (session) {
            // 已登录，更新活动时间
            sessionManager.updateActivity();
            this.showUserInterface(session.user);
        } else {
            // 未登录，显示登录弹窗
            this.showLoginDialog();
        }
        
        // 渲染内容
        toolManager.renderTools();
        this.renderUpdateLogs();
    }

    showUserInterface(user) {
        // 隐藏登录对话框
        document.getElementById('loginOverlay').style.display = 'none';
        
        // 显示用户信息
        const userMenu = document.getElementById('userMenu');
        const userInfo = document.getElementById('userInfo');
        if (userMenu && userInfo) {
            userMenu.style.display = 'block';
            userInfo.textContent = `欢迎，${user.username}`;
        }
        
        // 如果是管理员，显示管理员面板
        if (user.role === 'admin') {
            document.getElementById('adminPanel').style.display = 'block';
        }
    }

    showLoginDialog() {
        document.getElementById('loginOverlay').style.display = 'flex';
        document.getElementById('adminPanel').style.display = 'none';
        document.getElementById('userMenu').style.display = 'none';
    }

    /* ---------- 事件监听器设置 ---------- */
    setupEventListeners() {
        // 登录表单
        document.getElementById('loginForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value;
            
            const res = await userManager.authenticate(username, password);
            if (res.ok) {
                if (res.mustReset) {
                    this.openFirstLoginDialog();
                } else {
                    this.showUserInterface(userManager.getCurrentUser());
                }
                toolManager.renderTools();
            } else {
                alert(res.reason === 'notfound' ? '用户不存在' : '密码错误');
            }
        });

        // 关闭登录对话框
        document.getElementById('closeLoginBtn').addEventListener('click', () => {
            document.getElementById('loginOverlay').style.display = 'none';
        });

        // 退出登录
        document.getElementById('logoutBtn').addEventListener('click', () => {
            userManager.logout();
            this.showLoginDialog();
        });

        // 工具管理
        this.setupToolEventListeners();
        
        // 用户管理
        this.setupUserEventListeners();
        
        // 首次登录改密
        this.setupFirstLoginEventListeners();
    }

    setupToolEventListeners() {
        // 添加工具
        document.getElementById('addToolBtn').addEventListener('click', () => {
            toolManager.resetEditForm();
            document.getElementById('toolForm').style.display = 'block';
        });

        // 取消工具编辑
        document.getElementById('cancelToolBtn').addEventListener('click', () => {
            toolManager.resetEditForm();
        });

        // 工具表单提交
        document.getElementById('toolFormElement').addEventListener('submit', (e) => {
            e.preventDefault();
            const toolData = {
                title: document.getElementById('toolTitle').value,
                icon: document.getElementById('toolIcon').value || '🔧',
                description: document.getElementById('toolDescription').value,
                url: document.getElementById('toolUrl').value
            };

            if (toolManager.currentEditingTool) {
                toolManager.updateTool(toolManager.currentEditingTool, toolData);
                this.addUpdateLog(`更新工具：${toolData.title}`);
            } else {
                toolManager.addTool(toolData);
                this.addUpdateLog(`添加新工具：${toolData.title}`);
            }
            
            toolManager.resetEditForm();
        });
    }

    setupUserEventListeners() {
        // 用户管理面板
        document.getElementById('openUsersBtn').addEventListener('click', () => {
            const panel = document.getElementById('usersPanel');
            panel.classList.toggle('hidden');
            if (!panel.classList.contains('hidden')) {
                userManager.renderUsers();
            }
        });

        // 刷新用户列表
        document.getElementById('refreshUsersBtn').addEventListener('click', () => {
            userManager.renderUsers();
        });

        // 新增用户
        document.getElementById('addUserBtn').addEventListener('click', () => {
            document.getElementById('userEditTitle').innerText = '新增用户';
            document.getElementById('userEditForm').reset();
            document.getElementById('userEditOverlay').style.display = 'flex';
        });

        // 取消用户编辑
        document.getElementById('cancelUserEditBtn').addEventListener('click', () => {
            document.getElementById('userEditOverlay').style.display = 'none';
        });

        // 用户编辑表单提交
        document.getElementById('userEditForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            try {
                const username = document.getElementById('editUsername').value.trim();
                const role = document.getElementById('editRole').value;
                const temp = document.getElementById('editTempPwd').value.trim();
                
                const u = await userManager.createUser({ 
                    username, 
                    role, 
                    tempPassword: temp || undefined 
                });
                
                this.addUpdateLog(`新增用户：${u.username}（${u.role}）`);
                userManager.renderUsers();
                alert(`用户已创建。\n用户名：${u.username}\n临时密码：${u.tempPassword}\n请通知用户首次登录后自行改密。`);
                document.getElementById('userEditOverlay').style.display = 'none';
            } catch (err) {
                alert(err.message || '创建用户失败');
            }
        });
    }

    setupFirstLoginEventListeners() {
        // 取消首次登录改密
        document.getElementById('cancelFirstLoginBtn').addEventListener('click', () => {
            userManager.logout();
            document.getElementById('firstLoginOverlay').style.display = 'none';
            this.showLoginDialog();
        });

        // 首次登录改密表单
        document.getElementById('firstLoginForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const currentUser = userManager.getCurrentUser();
            if (!currentUser) {
                alert('会话已失效，请重新登录');
                return;
            }
            
            const n1 = document.getElementById('newPwd').value;
            const n2 = document.getElementById('confirmPwd').value;
            
            if (n1.length < 6) {
                alert('新密码长度至少6位');
                return;
            }
            if (n1 !== n2) {
                alert('两次输入不一致');
                return;
            }
            
            const ok = await userManager.setPassword(currentUser.id, n1);
            if (ok) {
                this.addUpdateLog(`用户 ${currentUser.username} 完成首次改密`);
                document.getElementById('firstLoginOverlay').style.display = 'none';
                this.showUserInterface(currentUser);
                toolManager.renderTools();
            } else {
                alert('设置密码失败');
            }
        });
    }

    openFirstLoginDialog() {
        document.getElementById('firstLoginOverlay').style.display = 'flex';
    }
}

/* ========================
 * 应用启动
 * ======================== */
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});
