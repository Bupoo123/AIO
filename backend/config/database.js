const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log('尝试连接MongoDB...');
    console.log('连接字符串:', process.env.MONGODB_URI ? '已设置' : '未设置');
    
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000, // 10秒超时
      connectTimeoutMS: 10000, // 10秒连接超时
      maxPoolSize: 10, // 最大连接池大小
      minPoolSize: 1, // 最小连接池大小
    });

    console.log(`✅ MongoDB 连接成功: ${conn.connection.host}`);
    console.log(`数据库: ${conn.connection.name}`);
  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message);
    console.error('错误类型:', error.name);
    
    // 不退出进程，让应用继续运行
    console.log('⚠️  应用将在无数据库模式下运行');
  }
};

module.exports = connectDB;
