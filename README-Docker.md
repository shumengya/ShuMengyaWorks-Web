# 树萌芽の作品集 - Docker 部署指南

## 📦 快速部署

### 前置要求
- Docker 20.10+
- Docker Compose 2.0+
- 至少 2GB 可用内存
- 至少 10GB 可用磁盘空间

### 一键部署

```bash
# 1. 克隆或下载项目到本地

# 2. 进入项目目录
cd 树萌芽の作品集

# 3. 构建并启动服务
docker-compose up -d --build
```

### 访问应用
部署成功后，通过浏览器访问: **http://localhost:8383**

## 📂 持久化目录说明

所有数据都持久化存储在 `/shumengya/docker/smyworkcollect/data/` 目录下:

```
/shumengya/docker/smyworkcollect/data/
├── works/          # 作品数据(图片、视频、文件等)
├── config/         # 网站配置文件
└── logs/           # 应用/访问日志(可选)
```

### Windows 环境
如果在 Windows 上部署,建议修改 `docker-compose.yml` 中的路径为:
```yaml
volumes:
  - C:/shumengya/docker/smyworkcollect/data/works:/app/backend/works
  - C:/shumengya/docker/smyworkcollect/data/config:/app/SmyWorkCollect-Frontend/config
  - C:/shumengya/docker/smyworkcollect/data/logs:/var/log/nginx
```

### Linux/Mac 环境
确保创建目录并设置正确权限:
```bash
sudo mkdir -p /shumengya/docker/smyworkcollect/data/{works,config,logs}
sudo chown -R 1000:1000 /shumengya/docker/smyworkcollect/data/
```

## 🔧 常用命令

### 启动服务
```bash
docker-compose up -d
```

### 停止服务
```bash
docker-compose down
```

### 查看日志
```bash
# 查看所有服务日志
docker-compose logs -f

# 只查看后端日志
docker-compose logs -f backend

# 只查看前端日志
docker-compose logs -f frontend
```

### 重启服务
```bash
docker-compose restart
```

### 重新构建并启动
```bash
docker-compose up -d --build
```

### 查看服务状态
```bash
docker-compose ps
```

### 进入容器
```bash
# 进入单容器
docker exec -it smywork-app sh
```

## 🔐 管理员配置

管理员 Token: `shumengya520`

访问管理面板: http://localhost:8383/#/admin?token=shumengya520

## 🎨 自定义配置

### 修改端口
编辑 `docker-compose.yml` 文件中的端口映射:
```yaml
ports:
  - "你的端口:80"  # 例如: "8080:80"
```

### 修改管理员密码
编辑 `SmyWorkCollect-Backend/app.py`:
```python
ADMIN_TOKEN = "你的新密码"
```
然后重新构建:
```bash
docker-compose up -d --build backend
```

### 修改网站配置
编辑持久化目录中的配置文件:
```bash
/shumengya/docker/smyworkcollect/data/config/settings.json
```

## 📊 资源限制(可选)

在 `docker-compose.yml` 中添加资源限制:
```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
```

## 🔄 更新应用

```bash
# 1. 停止服务
docker-compose down

# 2. 拉取最新代码
git pull

# 3. 重新构建并启动
docker-compose up -d --build
```

## 🛠️ 故障排查

### 服务无法启动
```bash
# 查看详细日志
docker-compose logs

# 检查端口是否被占用
netstat -ano | findstr 8383  # Windows
lsof -i :8383                # Linux/Mac
```

### 权限问题
```bash
# Linux/Mac 下设置正确权限
sudo chown -R 1000:1000 /shumengya/docker/smyworkcollect/data/
```

### 清理并重新部署
```bash
# 停止并删除所有容器
docker-compose down

# 删除旧镜像（可选，镜像名以目录为准）
docker images | findstr smywork

# 重新构建
docker-compose up -d --build
```

## 📝 备份与恢复

### 备份数据
```bash
# 备份作品数据
tar -czf smywork-backup-$(date +%Y%m%d).tar.gz /shumengya/docker/smyworkcollect/data/
```

### 恢复数据
```bash
# 解压备份
tar -xzf smywork-backup-20231125.tar.gz -C /
```

## 🌐 生产环境建议

1. **使用反向代理** (Nginx/Traefik) 并配置 HTTPS
2. **定期备份** 持久化数据
3. **监控日志** 并设置告警
4. **资源限制** 防止资源耗尽
5. **安全加固** 修改默认管理员密码

## 📞 支持

- 作者: 树萌芽
- 邮箱: 3205788256@qq.com

---

**祝部署顺利! 🎉**
