// 临时测试登录 - 不依赖数据库
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();

// CORS配置
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());

// 简单的测试登录
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  if (username === 'admin' && password === 'admin123') {
    const token = jwt.sign({ userId: 'admin' }, process.env.JWT_SECRET || 'test-secret', {
      expiresIn: '7d'
    });
    
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
});

// 健康检查
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: '服务器运行正常',
    timestamp: new Date().toISOString()
  });
});

module.exports = app;
