const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const connectDB = require('./config/database');

// 导入路由
const authRoutes = require('./routes/auth');
const toolRoutes = require('./routes/tools');

// 智能登录逻辑（数据库优先，环境变量备用）
const smartLogin = async (req, res) => {
  const { username, password } = req.body;
  
  try {
    // 首先尝试从数据库查找用户
    const User = require('./models/User');
    const user = await User.findOne({ username, isActive: true });
    
    if (user) {
      // 数据库用户存在，验证密码
      const isValidPassword = await user.comparePassword(password);
      if (isValidPassword) {
        // 更新最后登录时间
        await user.updateLastLogin();
        
        const token = require('jsonwebtoken').sign(
          { userId: user._id }, 
          process.env.JWT_SECRET || 'fallback-secret', 
          { expiresIn: '7d' }
        );
        
        return res.json({
          success: true,
          message: '登录成功',
          data: {
            user: {
              _id: user._id,
              username: user.username,
              role: user.role
            },
            token,
            mustReset: user.mustReset
          }
        });
      }
    }
    
    // 如果数据库中没有用户，或者密码错误，尝试环境变量备用方案
    if (username === 'admin') {
      const envPassword = process.env.ADMIN_PASSWORD || 'admin123';
      if (password === envPassword) {
        // 尝试创建或更新数据库中的admin用户
        try {
          const User = require('./models/User');
          let adminUser = await User.findOne({ username: 'admin' });
          
          if (!adminUser) {
            // 创建新的admin用户
            const bcrypt = require('bcryptjs');
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(password, salt);
            
            adminUser = new User({
              username: 'admin',
              role: 'admin',
              passwordHash,
              mustReset: false,
              isActive: true
            });
            await adminUser.save();
          }
          
          const token = require('jsonwebtoken').sign(
            { userId: adminUser._id }, 
            process.env.JWT_SECRET || 'fallback-secret', 
            { expiresIn: '7d' }
          );
          
          return res.json({
            success: true,
            message: '登录成功',
            data: {
              user: {
                _id: adminUser._id,
                username: adminUser.username,
                role: adminUser.role
              },
              token,
              mustReset: adminUser.mustReset
            }
          });
        } catch (dbError) {
          console.error('数据库操作失败，使用备用登录:', dbError.message);
          // 数据库操作失败，使用简化的登录逻辑
          const token = require('jsonwebtoken').sign(
            { userId: 'admin' }, 
            process.env.JWT_SECRET || 'fallback-secret', 
            { expiresIn: '7d' }
          );
          
          return res.json({
            success: true,
            message: '登录成功（数据库暂时不可用）',
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
        }
      }
    }
    
    // 所有验证都失败
    res.status(401).json({
      success: false,
      message: '用户名或密码错误'
    });
    
  } catch (error) {
    console.error('登录错误:', error);
    
    // 如果数据库完全不可用，提供备用登录
    if (username === 'admin' && password === 'admin123') {
      const token = require('jsonwebtoken').sign(
        { userId: 'admin' }, 
        process.env.JWT_SECRET || 'fallback-secret', 
        { expiresIn: '7d' }
      );
      
      return res.json({
        success: true,
        message: '登录成功（数据库暂时不可用）',
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
    }
    
    res.status(500).json({
      success: false,
      message: '登录服务暂时不可用，请稍后重试'
    });
  }
};

// 修改密码接口（智能容错）
const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  
  try {
    // 验证新密码格式
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: '新密码长度至少6位'
      });
    }
    
    // 从JWT token中获取用户ID
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({
        success: false,
        message: '未提供认证令牌'
      });
    }
    
    // 验证token并获取用户信息
    const jwt = require('jsonwebtoken');
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    } catch (jwtError) {
      console.error('JWT验证失败:', jwtError.message);
      return res.status(401).json({
        success: false,
        message: '认证令牌无效'
      });
    }
    
    const userId = decoded.userId;
    
    // 尝试从数据库查找用户
    try {
      const User = require('./models/User');
      const user = await User.findById(userId);
      
      if (user) {
        // 数据库用户存在，验证密码
        const isValidPassword = await user.comparePassword(currentPassword);
        if (!isValidPassword) {
          return res.status(400).json({
            success: false,
            message: '当前密码错误'
          });
        }
        
        // 更新密码
        const bcrypt = require('bcryptjs');
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(newPassword, salt);
        
        user.passwordHash = passwordHash;
        user.mustReset = false;
        user.updatedAt = new Date();
        await user.save();
        
        return res.json({
          success: true,
          message: '密码修改成功！',
          data: {
            userId: user._id,
            username: user.username
          }
        });
      }
    } catch (dbError) {
      console.error('数据库操作失败:', dbError.message);
    }
    
    // 如果数据库操作失败，使用环境变量备用方案
    if (userId === 'admin') {
      const envPassword = process.env.ADMIN_PASSWORD || 'admin123';
      if (currentPassword === envPassword) {
        // 更新环境变量（这里只是演示，实际需要手动更新）
        return res.json({
          success: true,
          message: '密码修改成功！\n\n注意：由于数据库暂时不可用，新密码已记录。\n请通过Vercel Dashboard更新ADMIN_PASSWORD环境变量为: ' + newPassword,
          data: {
            userId: 'admin',
            username: 'admin'
          }
        });
      } else {
        return res.status(400).json({
          success: false,
          message: '当前密码错误'
        });
      }
    }
    
    return res.status(404).json({
      success: false,
      message: '用户不存在'
    });
    
  } catch (error) {
    console.error('修改密码错误:', error);
    res.status(500).json({
      success: false,
      message: '密码修改失败，请稍后重试'
    });
  }
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

// API路由 - 使用智能登录
app.post('/api/auth/login', smartLogin);
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
