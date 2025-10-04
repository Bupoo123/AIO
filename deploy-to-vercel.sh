#!/bin/bash

# Vercel部署脚本

echo "🚀 开始部署到Vercel..."

# 检查是否安装了Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "📦 安装Vercel CLI..."
    npm install -g vercel
fi

# 进入后端目录
cd backend

# 检查是否已登录Vercel
if ! vercel whoami &> /dev/null; then
    echo "🔐 请先登录Vercel..."
    vercel login
fi

# 部署到Vercel
echo "📤 部署到Vercel..."
vercel --prod

echo "✅ 部署完成！"
echo ""
echo "📋 接下来需要设置环境变量："
echo "1. 访问 Vercel Dashboard"
echo "2. 进入项目设置"
echo "3. 添加以下环境变量："
echo "   - MONGODB_URI: 你的MongoDB Atlas连接字符串"
echo "   - JWT_SECRET: 随机字符串（用于JWT签名）"
echo "   - JWT_EXPIRE: 7d"
echo "   - FRONTEND_URL: 你的前端域名"
echo ""
echo "🔧 获取MongoDB Atlas连接字符串："
echo "1. 访问 https://www.mongodb.com/cloud/atlas"
echo "2. 创建免费集群"
echo "3. 获取连接字符串"
echo "4. 格式: mongodb+srv://username:password@cluster.mongodb.net/html_tools"

