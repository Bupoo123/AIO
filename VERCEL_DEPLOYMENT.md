# Vercel 部署完整指南

## 🎯 部署目标
将HTML工具集的后端API部署到Vercel，实现云端数据存储和用户管理。

## 📋 准备工作

### 1. 创建MongoDB Atlas数据库
1. 访问 [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. 注册/登录账户
3. 创建免费集群（M0 Sandbox）
4. 设置数据库用户：
   - 用户名：`html-tools-admin`
   - 密码：生成强密码
5. 配置网络访问：
   - 添加IP地址：`0.0.0.0/0`（允许所有IP）
6. 获取连接字符串：
   ```
   mongodb+srv://html-tools-admin:password@cluster0.xxxxx.mongodb.net/html_tools?retryWrites=true&w=majority
   ```

### 2. 准备GitHub仓库
1. 将代码推送到GitHub
2. 确保 `backend/` 目录包含所有文件

## 🚀 部署步骤

### 方法1: 使用Vercel CLI（推荐）

```bash
# 1. 安装Vercel CLI
npm install -g vercel

# 2. 登录Vercel
vercel login

# 3. 进入后端目录
cd backend

# 4. 部署
vercel

# 5. 设置环境变量
vercel env add MONGODB_URI
vercel env add JWT_SECRET
vercel env add JWT_EXPIRE
vercel env add FRONTEND_URL
```

### 方法2: 通过Vercel网站

1. 访问 [vercel.com](https://vercel.com)
2. 使用GitHub账户登录
3. 点击 "New Project"
4. 选择你的GitHub仓库
5. 设置项目配置：
   - **Framework Preset**: Other
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Output Directory**: 留空
6. 点击 "Deploy"

## 🔧 环境变量配置

在Vercel项目设置中添加以下环境变量：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `MONGODB_URI` | `mongodb+srv://...` | MongoDB Atlas连接字符串 |
| `JWT_SECRET` | `your-super-secret-key-here` | JWT签名密钥（建议32位随机字符串） |
| `JWT_EXPIRE` | `7d`` | JWT过期时间 |
| `FRONTEND_URL` | `https://your-frontend.vercel.app` | 前端域名 |
| `NODE_ENV` | `production` | 环境标识 |

### 生成JWT_SECRET
```bash
# 使用Node.js生成随机密钥
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 🔄 更新前端配置

部署成功后，更新前端的API地址：

```javascript
// 在 js/apiService.js 中
this.baseURL = 'https://your-backend.vercel.app/api';
```

## 🧪 测试部署

### 1. 健康检查
```bash
curl https://your-backend.vercel.app/health
```

### 2. 测试登录
```bash
curl -X POST https://your-backend.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### 3. 测试工具API
```bash
curl https://your-backend.vercel.app/api/tools
```

## 🔍 故障排除

### 常见问题

1. **数据库连接失败**
   - 检查MongoDB Atlas网络访问设置
   - 确保IP白名单包含 `0.0.0.0/0`
   - 验证连接字符串格式

2. **CORS错误**
   - 检查FRONTEND_URL环境变量
   - 确保前端域名正确

3. **JWT认证失败**
   - 检查JWT_SECRET是否设置
   - 确保密钥足够复杂

4. **管理员账户不存在**
   - 首次部署会自动创建管理员账户
   - 用户名：`admin`
   - 密码：`admin123`

### 查看日志
1. 在Vercel Dashboard中查看Function Logs
2. 检查部署日志中的错误信息
3. 使用MongoDB Atlas监控数据库连接

## 📊 性能优化

### 1. 数据库优化
- 为常用查询添加索引
- 使用连接池
- 定期清理过期数据

### 2. 缓存策略
- 实现Redis缓存（可选）
- 使用CDN加速静态资源

### 3. 安全加固
- 定期更新依赖包
- 使用HTTPS
- 设置请求频率限制

## 🔄 持续部署

### 设置GitHub Actions
1. 在GitHub仓库设置中添加Secrets：
   - `VERCEL_TOKEN`: Vercel账户令牌
   - `VERCEL_ORG_ID`: 组织ID
   - `VERCEL_PROJECT_ID`: 项目ID

2. 工作流已配置在 `.github/workflows/deploy.yml`

### 手动部署
```bash
# 使用部署脚本
./deploy-to-vercel.sh
```

## 📞 支持

### 获取帮助
1. 查看Vercel文档：https://vercel.com/docs
2. 检查MongoDB Atlas状态
3. 查看项目日志

### 监控指标
- Vercel Dashboard中的Function执行时间
- MongoDB Atlas中的连接数和查询性能
- 错误率和响应时间

## 🎉 部署完成

部署成功后，你将获得：
- ✅ 云端API服务
- ✅ 数据库持久化
- ✅ 用户认证系统
- ✅ 工具管理功能
- ✅ 自动扩缩容
- ✅ HTTPS安全连接

现在你的HTML工具集已经成功部署到云端！

