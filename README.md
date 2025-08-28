# 树萌芽の作品集

一个展示创意作品和项目的现代化网站，采用React + Flask架构开发。

## 功能特点

- 🎨 清新可爱的淡绿色配色方案
- 📱 完全响应式设计，优先适配手机端
- 🔍 作品搜索和分类筛选功能
- 📦 多平台作品下载支持（Windows/Android/Linux）
- 🖼️ 作品截图和视频展示
- 📄 详细的作品信息页面
- 🏷️ 网站logo、备案号、页尾配置支持
- 👑 管理员后台界面，支持作品增删改
- 📁 文件上传管理功能
- 📊 作品统计功能：浏览量、下载量、点赞量、更新次数
- 🛡️ 防刷机制：基于用户指纹的智能防刷保护
- 👍 互动功能：支持作品点赞
- 🔄 自动统计：管理员编辑作品自动增加更新次数
- ⚡ 模块化架构，易于扩展维护

## 技术栈

### 前端
- React 18.2.0
- Styled Components
- Axios
- React Router DOM

### 后端
- Python 3.13.2
- Flask 3.0.0
- Flask-CORS

## 快速开始

### 方式一：使用批处理文件（Windows）

1. **启动后端服务**
   ```
   双击运行 start_backend.bat
   ```

2. **启动前端服务**（新开一个命令窗口）
   ```
   双击运行 start_frontend.bat
   ```

### 方式二：手动启动

1. **启动后端服务**
   ```bash
   cd backend
   pip install -r requirements.txt
   python app.py
   ```

2. **启动前端服务**（新开一个终端）
   ```bash
   cd frontend
   npm install
   npm start
   ```

## 访问地址

- 前端页面: http://localhost:3000
- 后端API: http://localhost:5000
- 管理员界面: http://localhost:3000/admin?token=shumengya520

## 项目结构

```
树萌芽の作品集/
├── backend/                 # Flask后端
│   ├── app.py              # 主应用文件
│   └── requirements.txt    # Python依赖
├── frontend/               # React前端
│   ├── public/            # 静态文件
│   ├── src/               # 源代码
│   │   ├── components/    # React组件
│   │   ├── services/      # API服务
│   │   ├── App.js         # 主应用组件
│   │   └── index.js       # 入口文件
│   └── package.json       # Node.js依赖
├── config/                # 配置文件
│   └── settings.json      # 网站基础配置（包含logo、备案号、页尾等）
├── works/                 # 作品目录
│   ├── aicodevartool/     # AI代码变量工具
│   ├── mengyafarm/        # 萌芽农场
│   └── mml_cgj2025/       # MML创意游戏大赛2025
└── README.md              # 项目说明
```

## 作品配置格式

每个作品需要在 `works/{作品ID}/` 目录下包含：

- `work_config.json` - 作品配置文件
- `image/` - 作品截图目录
- `platform/` - 各平台文件目录
  - `Windows/` - Windows版本文件
  - `Android/` - Android版本文件  
  - `Linux/` - Linux版本文件

### work_config.json 示例

```json
{
  "作品ID": "example",
  "作品作品": "示例作品",
  "作品描述": "这是一个示例作品的描述",
  "作者": "树萌芽",
  "作品版本号": "1.0.0",
  "作品分类": "工具",
  "作品标签": ["示例", "工具"],
  "上传时间": "2025-01-01T00:00:00",
  "更新时间": "2025-01-01T00:00:00",
  "支持平台": ["Windows", "Android"],
  "文件名称": {
    "Windows": ["example_windows.zip"],
    "Android": ["example_android.apk"]
  },
  "作品截图": ["image1.jpg", "image2.jpg"],
  "作品视频": [],
  "作品封面": "image1.jpg"
}
```

## API接口

- `GET /api/settings` - 获取网站设置
- `GET /api/works` - 获取所有作品列表
- `GET /api/works/{work_id}` - 获取单个作品详情
- `GET /api/search?q={query}&category={category}` - 搜索作品
- `GET /api/categories` - 获取所有分类
- `GET /api/image/{work_id}/{filename}` - 获取作品图片
- `GET /api/download/{work_id}/{platform}/{filename}` - 下载作品文件
- `POST /api/like/{work_id}` - 点赞作品

### 管理员API接口

- `GET /api/admin/works?token=shumengya520` - 管理员获取所有作品
- `POST /api/admin/works?token=shumengya520` - 管理员创建新作品
- `PUT /api/admin/works/{work_id}?token=shumengya520` - 管理员更新作品
- `DELETE /api/admin/works/{work_id}?token=shumengya520` - 管理员删除作品
- `POST /api/admin/upload/{work_id}/{file_type}?token=shumengya520` - 管理员上传文件
- `DELETE /api/admin/delete-file/{work_id}/{file_type}/{filename}?token=shumengya520` - 管理员删除文件

## 管理员功能使用说明

### 访问管理员界面

1. 确保后端和前端服务都已启动
2. 访问: http://localhost:3000/admin?token=shumengya520
3. 正确的token是 `shumengya520`

### 管理员功能

1. **查看作品列表**: 显示所有作品的基本信息和操作按钮
2. **添加新作品**: 
   - 点击"添加新作品"按钮
   - 填写作品基本信息（作品ID、名称、描述等）
   - 选择支持的平台
   - 保存后可以上传文件
3. **编辑作品**: 
   - 点击作品旁的"编辑"按钮
   - 修改作品信息
   - 管理作品文件（上传、删除）
4. **删除作品**: 
   - 点击作品旁的"删除"按钮
   - 确认删除（将删除整个作品目录）

### 文件管理

- **作品截图**: 支持PNG、JPG、JPEG、GIF格式，支持批量上传
- **作品视频**: 支持MP4、AVI、MOV格式  
- **平台文件**: 支持ZIP、RAR、APK、EXE、DMG等格式
- **自动命名**: 图片自动命名为image1.jpg、image2.png等，视频命名为video1.mp4等，平台文件命名为作品ID_平台.扩展名
- **封面选择**: 可以从已上传的图片中点击选择封面图
- **拖拽上传**: 支持拖拽文件到上传区域
- 支持批量上传和单独删除

### 统计功能说明

#### 防刷机制
- **用户识别**: 基于IP地址和User-Agent生成用户指纹
- **时间限制**: 
  - 浏览量：同一用户1分钟内对同一作品只计数一次
  - 下载量：同一用户5分钟内对同一作品只计数一次
  - 点赞量：同一用户1小时内对同一作品只计数一次
- **自动更新**: 管理员编辑作品时自动增加更新次数

#### 统计展示
- **作品卡片**: 显示浏览、下载、点赞、更新次数的简洁图标统计
- **详情页面**: 显示详细的统计卡片和互动点赞按钮
- **实时更新**: 点赞后立即更新显示数据

## 开发说明

- 前端采用模块化架构，组件分离，便于维护
- 响应式设计优先考虑手机端体验
- 后端提供RESTful API接口
- 支持作品搜索和分类筛选
- 自动解析works目录下的作品配置

## 作者

树萌芽 - 3205788256@qq.com
