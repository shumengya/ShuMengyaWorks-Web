# ====== Frontend build stage ======
FROM node:18-alpine AS fe-builder
WORKDIR /fe
COPY SmyWorkCollect-Frontend/package*.json ./
# 使用 npm install 以避免对锁文件严格校验导致构建失败
RUN npm install
COPY SmyWorkCollect-Frontend/ .
# 确保不带 REACT_APP_API_URL，生产默认使用相对路径 /api
RUN npm run build

# ====== Final runtime (Python + Nginx + Supervisor) ======
FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# 安装系统依赖: nginx, supervisor, curl
RUN apt-get update \
    && apt-get install -y --no-install-recommends nginx supervisor curl \
    && rm -rf /var/lib/apt/lists/*

# 创建目录结构
WORKDIR /app
RUN mkdir -p /app/backend \
    /app/SmyWorkCollect-Frontend/build \
    /app/SmyWorkCollect-Frontend/config \
    /run/nginx \
    /var/log/supervisor

# 复制后端依赖并安装（包含 gunicorn）
COPY SmyWorkCollect-Backend/requirements.txt /app/backend/requirements.txt
RUN pip install --no-cache-dir -r /app/backend/requirements.txt \
    && pip install --no-cache-dir gunicorn

# 复制后端代码
COPY SmyWorkCollect-Backend/ /app/backend/

# 复制前端构建产物到预期目录（与后端中的路径逻辑兼容）
COPY --from=fe-builder /fe/build /app/SmyWorkCollect-Frontend/build

# 复制 Nginx 与 Supervisor 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# 暴露对外端口 8383（Nginx 监听此端口）
EXPOSE 8383

# 运行 supervisor 同时管理 nginx 与 gunicorn（Flask）
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
