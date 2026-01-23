#!/bin/bash

# ============================================
# Docker 构建测试脚本
# ============================================

set -e

echo "=================================="
echo "Docker 构建测试"
echo "=================================="

# 清理旧的测试镜像和容器
echo "清理旧资源..."
docker rm -f mentob-ai-test 2>/dev/null || true
docker rmi mentob-ai:test 2>/dev/null || true

# 构建测试镜像
echo ""
echo "构建测试镜像..."
docker build -t mentob-ai:test .

# 启动测试容器
echo ""
echo "启动测试容器..."
docker run -d \
  --name mentob-ai-test \
  -p 8899:8899 \
  mentob-ai:test

# 等待容器启动
echo ""
echo "等待容器启动（30秒）..."
sleep 30

# 检查容器状态
echo ""
echo "检查容器状态..."
docker ps | grep mentob-ai-test

# 测试 HTTP 访问
echo ""
echo "测试 HTTP 访问..."
if curl -f -s -o /dev/null "http://localhost:8899"; then
    echo "✓ HTTP 访问成功"
else
    echo "✗ HTTP 访问失败"
fi

# 显示日志
echo ""
echo "容器日志（最后 20 行）："
docker logs --tail 20 mentob-ai-test

# 清理
echo ""
echo "清理测试资源..."
docker stop mentob-ai-test
docker rm mentob-ai-test

echo ""
echo "=================================="
echo "测试完成"
echo "=================================="
