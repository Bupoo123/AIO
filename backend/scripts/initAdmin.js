const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

const initAdmin = async () => {
  try {
    // 连接数据库
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('数据库连接成功');

    // 检查是否已存在管理员
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('管理员已存在，跳过初始化');
      process.exit(0);
    }

    // 创建默认管理员
    const adminPassword = 'admin123';
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(adminPassword, salt);

    const admin = new User({
      username: 'admin',
      role: 'admin',
      passwordHash,
      mustReset: false,
      tempPassword: null,
      isActive: true
    });

    await admin.save();
    console.log('默认管理员创建成功');
    console.log('用户名: admin');
    console.log('密码: admin123');
    console.log('请首次登录后立即修改密码！');

  } catch (error) {
    console.error('初始化失败:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

initAdmin();
