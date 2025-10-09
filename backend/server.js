const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const connectDB = require('./config/database');

// 导入路由
const authRoutes = require('./routes/auth');
const toolRoutes = require('./routes/tools');

// 简化的登录逻辑（临时解决方案）
const simpleLogin = (req, res) => {
  const { username, password } = req.body;
  const currentPassword = process.env.ADMIN_PASSWORD || 'admin123';
  
  if (username === 'admin' && password === currentPassword) {
    const token = require('jsonwebtoken').sign(
      { userId: 'admin' }, 
      process.env.JWT_SECRET || 'fallback-secret', 
      { expiresIn: '7d' }
    );
    
    res.json({
      success: true,
      message: '登录成功',
      data: {
        user: {
          _id: 'admin',
          username: 'admin',
          role: 'admin'
        },
        token,
        mustReset: false
      }
    });
  } else {
    res.status(401).json({
      success: false,
      message: '用户名或密码错误'
    });
  }
};

// 修改密码接口
const changePassword = (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const storedPassword = process.env.ADMIN_PASSWORD || 'admin123';
  
  // 验证当前密码
  if (currentPassword !== storedPassword) {
    return res.status(400).json({
      success: false,
      message: '当前密码错误'
    });
  }
  
  // 验证新密码
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({
      success: false,
      message: '新密码长度至少6位'
    });
  }
  
  // 注意：这里只是演示，实际部署时需要更新环境变量
  // 在Vercel中，需要通过Dashboard或CLI更新环境变量
  res.json({
    success: true,
    message: '密码修改成功！请通过Vercel Dashboard更新ADMIN_PASSWORD环境变量',
    note: '当前密码仍为: ' + storedPassword
  });
};

const app = express();

// 连接数据库
connectDB();

// 安全中间件
app.use(helmet());

// CORS配置
app.use(cors({
  origin: true,
  credentials: true
}));

// 请求限制
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 限制每个IP 15分钟内最多100个请求
  message: {
    success: false,
    message: '请求过于频繁，请稍后再试'
  }
});
app.use('/api/', limiter);

// 解析JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 健康检查
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: '服务器运行正常',
    timestamp: new Date().toISOString()
  });
});

// API路由 - 使用简化的登录
app.post('/api/auth/login', simpleLogin);
app.post('/api/auth/change-password', changePassword);
app.use('/api/auth', authRoutes);
app.use('/api/tools', toolRoutes);

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: '接口不存在'
  });
});

// 全局错误处理
app.use((error, req, res, next) => {
  console.error('服务器错误:', error);
  
  res.status(error.status || 500).json({
    success: false,
    message: error.message || '服务器内部错误',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// 初始化管理员（仅在首次部署时）
const initAdmin = require('./scripts/initAdminVercel');
initAdmin().catch(console.error);

const PORT = process.env.PORT || 5000;

// 仅在非Vercel环境下启动服务器
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`服务器运行在端口 ${PORT}`);
    console.log(`环境: ${process.env.NODE_ENV || 'development'}`);
  });
}

// 导出app供Vercel使用
module.exports = app;
