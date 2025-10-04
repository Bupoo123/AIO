# Vercel 部署指南

## 🚀 部署步骤

### 1. 准备GitHub仓库
1. 将代码推送到GitHub仓库
2. 确保 `backend/` 目录包含所有必要文件

### 2. 配置MongoDB Atlas
1. 访问 [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. 创建免费集群
3. 获取连接字符串，格式如：
   ```
   mongodb+srv://username:password@cluster.mongodb.net/html_tools
   ```

### 3. 部署到Vercel

#### 方法1: 通过Vercel CLI
```bash
# 安装Vercel CLI
npm i -g vercel

# 在backend目录下登录Vercel
cd backend
vercel login

# 部署
vercel

# 设置环境变量
vercel env add MONGODB_URI
vercel env add JWT_SECRET
vercel env add JWT_EXPIRE
vercel env add FRONTEND_URL
```

#### 方法2: 通过Vercel网站
1. 访问 [vercel.com](https://vercel.com)
2. 连接GitHub账户
3. 导入项目，选择 `backend` 目录
4. 设置环境变量：
   - `MONGODB_URI`: MongoDB连接字符串
   - `JWT_SECRET`: 随机字符串（用于JWT签名）
   - `JWT_EXPIRE`: 7d
   - `FRONTEND_URL`: 你的前端域名
5. 部署

### 4. 环境变量配置

在Vercel项目设置中添加以下环境变量：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `MONGODB_URI` | `mongodb+srv://...` | MongoDB Atlas连接字符串 |
| `JWT_SECRET` | `your-secret-key` | JWT签名密钥 |
| `JWT_EXPIRE` | `7d` | JWT过期时间 |
| `FRONTEND_URL` | `https://your-frontend.vercel.app` | 前端域名 |
| `NODE_ENV` | `production` | 环境标识 |

### 5. 更新前端API配置

部署成功后，更新前端的API地址：

```javascript
// 在 js/apiService.js 中
this.baseURL = 'https://your-backend.vercel.app/api';
```

### 6. 初始化管理员账户

部署后需要手动创建管理员账户，可以通过以下方式：

1. 使用MongoDB Atlas的Data Explorer
2. 或者创建一个临时的初始化脚本

## 🔧 故障排除

### 常见问题

1. **数据库连接失败**
   - 检查MongoDB Atlas网络访问设置
   - 确保IP白名单包含Vercel的IP范围（0.0.0.0/0）

2. **CORS错误**
   - 检查FRONTEND_URL环境变量
   - 确保前端域名正确

3. **JWT错误**
   - 检查JWT_SECRET是否设置
   - 确保密钥足够复杂

### 监控和日志

- 在Vercel Dashboard查看部署日志
- 使用MongoDB Atlas监控数据库性能
- 设置错误监控（可选）

## 📊 性能优化

1. **数据库优化**
   - 为常用查询添加索引
   - 使用连接池

2. **缓存策略**
   - 实现Redis缓存（可选）
   - 静态资源CDN

3. **安全加固**
   - 定期更新依赖
   - 使用HTTPS
   - 设置请求限制

## 🔄 持续部署

设置GitHub Actions自动部署：

```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel
on:
  push:
    branches: [main]
    paths: ['backend/**']
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          working-directory: ./backend
```

## 📞 支持

如有部署问题，请检查：
1. Vercel部署日志
2. MongoDB Atlas连接状态
3. 环境变量配置
4. 网络连接
