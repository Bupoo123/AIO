const mongoose = require('mongoose');

// 测试MongoDB连接
const testMongoDBConnection = async () => {
  console.log('开始测试MongoDB连接...');
  console.log('MONGODB_URI:', process.env.MONGODB_URI ? '已设置' : '未设置');
  
  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI 环境变量未设置');
    return;
  }
  
  try {
    console.log('尝试连接MongoDB...');
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // 5秒超时
      connectTimeoutMS: 10000, // 10秒连接超时
    });
    
    console.log('✅ MongoDB连接成功!');
    console.log('主机:', conn.connection.host);
    console.log('数据库:', conn.connection.name);
    
    // 测试数据库操作
    const User = require('./models/User');
    const userCount = await User.countDocuments();
    console.log('用户数量:', userCount);
    
    await mongoose.disconnect();
    console.log('✅ 连接已关闭');
    
  } catch (error) {
    console.error('❌ MongoDB连接失败:');
    console.error('错误类型:', error.name);
    console.error('错误消息:', error.message);
    
    if (error.name === 'MongoServerSelectionError') {
      console.error('可能的原因:');
      console.error('1. 网络连接问题');
      console.error('2. MongoDB Atlas IP白名单未包含当前IP');
      console.error('3. 连接字符串格式错误');
    } else if (error.name === 'MongoAuthenticationError') {
      console.error('可能的原因:');
      console.error('1. 用户名或密码错误');
      console.error('2. 数据库用户权限不足');
    }
  }
};

// 运行测试
testMongoDBConnection().catch(console.error);
