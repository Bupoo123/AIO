/** ========================
 *  工具管理模块
 *  ======================== */
class ToolManager {
    constructor() {
        this.tools = this.loadTools();
    }

    /* ---------- 工具数据管理 ---------- */
    loadTools() {
        const saved = localStorage.getItem('tools');
        if (saved) return JSON.parse(saved);
        return [
            { 
                id: 1, 
                title: '专利写作助手', 
                description: '帮助您高效撰写专利文档，提供格式模板和内容建议。', 
                url: 'https://bupoo123.github.io/Patent-asistant/', 
                icon: '📝' 
            },
            { 
                id: 2, 
                title: 'PPT照片处理工具', 
                description: '优化PPT中的图片，调整尺寸、格式和视觉效果。', 
                url: 'https://bupoo123.github.io/ConfPic-Manager/', 
                icon: '🖼️' 
            }
        ];
    }

    saveTools() { 
        localStorage.setItem('tools', JSON.stringify(this.tools)); 
    }

    addTool(tool) { 
        const t = { id: genId(), ...tool }; 
        this.tools.push(t); 
        this.saveTools(); 
        this.renderTools(); 
    }

    updateTool(id, data) { 
        const i = this.tools.findIndex(t => t.id === id); 
        if (i !== -1) { 
            this.tools[i] = { ...this.tools[i], ...data }; 
            this.saveTools(); 
            this.renderTools(); 
        } 
    }

    deleteTool(id) { 
        this.tools = this.tools.filter(t => t.id !== id); 
        this.saveTools(); 
        this.renderTools(); 
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
