# API配置说明

## 开发环境
开发环境下，前端会自动连接到 `http://localhost:5000/api`，无需额外配置。

## 生产环境配置

### 方式1: 前后端同域名部署
如果前端和后端部署在同一服务器的同一域名下，使用默认配置即可。
前端会使用相对路径 `/api` 访问后端。

### 方式2: 后端独立部署
如果后端部署在不同的服务器或域名，需要设置环境变量：

1. 在 `frontend` 目录下创建 `.env.local` 文件
2. 添加以下内容：
```
REACT_APP_API_URL=http://your-backend-domain.com:5000/api
```

### 方式3: 修改源代码
如果不想使用环境变量，可以直接修改 `src/services/api.js` 和 `src/services/adminApi.js` 文件中的配置。

## 后端CORS设置
确保后端允许前端域名的跨域请求。在 `backend/app.py` 中：

```python
from flask_cors import CORS

app = Flask(__name__)
CORS(app, origins=['http://your-frontend-domain.com'])  # 指定允许的域名
```

## 常见问题

1. **构建后无法访问API**: 检查API_URL配置是否正确
2. **跨域错误**: 检查后端CORS设置
3. **连接超时**: 检查后端服务是否正常运行，防火墙是否开放端口

## 部署建议

### 同域名部署 (推荐)
```
your-domain.com/          -> 前端静态文件
your-domain.com/api/      -> 后端API
```

### 不同域名部署
```
frontend.your-domain.com  -> 前端
api.your-domain.com       -> 后端
```

需要在前端设置 `REACT_APP_API_URL=https://api.your-domain.com/api`
