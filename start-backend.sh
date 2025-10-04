#!/bin/bash

# HTML工具集后端启动脚本

echo "🚀 启动HTML工具集后端服务..."

# 检查Node.js是否安装
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未找到Node.js，请先安装Node.js"
    echo "访问 https://nodejs.org/ 下载安装"
    exit 1
fi

# 检查npm是否安装
if ! command -v npm &> /dev/null; then
    echo "❌ 错误: 未找到npm，请先安装npm"
    exit 1
fi

# 进入后端目录
cd backend

# 检查package.json是否存在
if [ ! -f "package.json" ]; then
    echo "❌ 错误: 未找到package.json文件"
    exit 1
fi

# 检查是否已安装依赖
if [ ! -d "node_modules" ]; then
    echo "📦 安装依赖包..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ 依赖安装失败"
        exit 1
    fi
fi

# 检查环境配置文件
if [ ! -f ".env" ]; then
    echo "⚠️  警告: 未找到.env文件，使用默认配置"
    echo "请复制 env.example 为 .env 并配置数据库连接"
    cp env.example .env
fi

# 初始化管理员账户
echo "🔧 初始化管理员账户..."
node scripts/initAdmin.js

# 启动服务
echo "🎯 启动后端服务..."
echo "📍 服务地址: http://localhost:5000"
echo "📚 API文档: http://localhost:5000/health"
echo ""
echo "按 Ctrl+C 停止服务"
echo ""

npm start
