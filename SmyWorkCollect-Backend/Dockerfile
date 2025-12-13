# 后端 Dockerfile
FROM python:3.11-slim

WORKDIR /app/backend

# 安装系统依赖
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# 复制依赖文件
COPY requirements.txt .

# 安装 Python 依赖
RUN pip install --no-cache-dir -r requirements.txt -i https://pypi.tuna.tsinghua.edu.cn/simple

# 复制后端代码
COPY . .

# 暴露端口
EXPOSE 5000

# 启动后端服务
CMD ["python", "app.py"]
