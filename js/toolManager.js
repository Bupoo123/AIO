/** ========================
 *  工具管理模块（连接后端API）
 *  ======================== */
class ToolManager {
    constructor() {
        this.tools = [];
        this.apiService = window.apiService;
        this.loadTools();
    }

    /* ---------- 工具数据管理 ---------- */
    async loadTools() {
        try {
            const response = await this.apiService.getTools();
            if (response.success) {
                this.tools = response.data.tools;
                this.renderTools();
            }
        } catch (error) {
            console.error('加载工具失败:', error);
            // 如果后端不可用，使用默认工具
            this.tools = [
                { 
                    _id: 1, 
                    title: '专利写作助手', 
                    description: '帮助您高效撰写专利文档，提供格式模板和内容建议。', 
                    url: 'https://bupoo123.github.io/Patent-asistant/', 
                    icon: '📝' 
                },
                { 
                    _id: 2, 
                    title: 'PPT照片处理工具', 
                    description: '优化PPT中的图片，调整尺寸、格式和视觉效果。', 
                    url: 'https://bupoo123.github.io/ConfPic-Manager/', 
                    icon: '🖼️' 
                }
            ];
            this.renderTools();
        }
    }

    saveTools() { 
        // 后端存储，无需本地保存
    }

    async addTool(tool) { 
        try {
            const response = await this.apiService.createTool(tool);
            if (response.success) {
                this.tools.push(response.data.tool);
                this.renderTools();
                return true;
            }
            return false;
        } catch (error) {
            console.error('添加工具失败:', error);
            return false;
        }
    }

    async updateTool(id, data) { 
        try {
            const response = await this.apiService.updateTool(id, data);
            if (response.success) {
                const index = this.tools.findIndex(t => t._id === id);
                if (index !== -1) {
                    this.tools[index] = response.data.tool;
                    this.renderTools();
                }
                return true;
            }
            return false;
        } catch (error) {
            console.error('更新工具失败:', error);
            return false;
        }
    }

    async deleteTool(id) { 
        try {
            const response = await this.apiService.deleteTool(id);
            if (response.success) {
                this.tools = this.tools.filter(t => t._id !== id);
                this.renderTools();
                return true;
            }
            return false;
        } catch (error) {
            console.error('删除工具失败:', error);
            return false;
        }
    }

    /* ---------- 工具界面渲染 ---------- */
    renderTools() {
        const grid = document.getElementById('toolsGrid');
        if (!grid) return;
        
        grid.innerHTML = '';
        this.tools.forEach(tool => {
            const card = document.createElement('div');
            card.className = 'tool-card';
            card.innerHTML = `
                <div class="tool-image"><i>${tool.icon || '🔧'}</i></div>
                <div class="tool-content">
                    <h3 class="tool-title">${tool.title}</h3>
                    <p class="tool-description">${tool.description}</p>
                    <a href="${tool.url}" class="tool-link" target="_blank">使用工具</a>
                    ${userManager.isAdmin() ? `
                    <div class="tool-actions" style="margin-top: 1rem;">
                        <button class="edit-btn" onclick="toolManager.editTool(${tool.id})">编辑</button>
                        <button class="delete-btn" onclick="toolManager.confirmDeleteTool(${tool.id})">删除</button>
                    </div>` : ''}
                </div>
            `;
            grid.appendChild(card);
        });
    }

    /* ---------- 工具编辑 ---------- */
    editTool(id) {
        if (!userManager.isAdmin()) {
            alert('权限不足，需要管理员权限');
            return;
        }
        const tool = this.tools.find(t => t.id === id);
        if (!tool) return;
        
        document.getElementById('toolTitle').value = tool.title;
        document.getElementById('toolIcon').value = tool.icon || '';
        document.getElementById('toolDescription').value = tool.description;
        document.getElementById('toolUrl').value = tool.url;
        document.getElementById('toolForm').style.display = 'block';
        
        // 设置当前编辑的工具ID
        this.currentEditingTool = id;
    }

    confirmDeleteTool(id) {
        if (!userManager.isAdmin()) {
            alert('权限不足，需要管理员权限');
            return;
        }
        const t = this.tools.find(x => x.id === id);
        if (confirm(`确定删除工具：${t?.title || ''}？`)) {
            if (t) {
                // 这里可以添加更新日志
                if (window.app && window.app.addUpdateLog) {
                    window.app.addUpdateLog(`删除工具：${t.title}`);
                }
            }
            this.deleteTool(id);
        }
    }

    // 重置编辑状态
    resetEditForm() {
        this.currentEditingTool = null;
        document.getElementById('toolFormElement').reset();
        document.getElementById('toolForm').style.display = 'none';
    }
}

// 全局工具管理器实例
const toolManager = new ToolManager();
