# K-line Replay 交易系统

一个基于 Next.js 和 FastAPI 的 K 线回放交易系统，支持多种加密货币的历史数据回放和模拟交易。

## 项目概述

本项目包含两个主要部分：
- **Frontend**: 基于 Next.js 15 的现代化前端界面
- **Backend**: 基于 FastAPI 的高性能后端 API 服务

### 主要功能

- 📈 实时 K 线图表显示（基于 ECharts）
- 🔄 历史数据回放功能
- 💱 多种时间周期支持（1m, 5m, 15m, 1h, 4h, 1d）
- 🪙 多种加密货币支持
- 📱 响应式设计，支持全屏模式
- 🌙 深色/浅色主题切换
- 📊 模拟交易功能
- 🔍 货币搜索功能

## 技术栈

### Frontend
- **框架**: Next.js 15 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **UI 组件**: HeroUI
- **图表**: ECharts
- **状态管理**: Zustand
- **HTTP 客户端**: Axios
- **动画**: Framer Motion

### Backend
- **框架**: FastAPI
- **语言**: Python
- **数据获取**: CCXT
- **异步处理**: aiohttp
- **服务器**: Uvicorn

## 项目结构

```
K-line-replay/
├── frontend/                 # Next.js 前端应用
│   ├── src/
│   │   ├── app/             # App Router 页面
│   │   ├── components/      # React 组件
│   │   ├── hooks/           # 自定义 Hooks
│   │   ├── lib/             # 工具库
│   │   └── store/           # Zustand 状态管理
│   ├── package.json
│   └── ...
├── backend/                 # FastAPI 后端服务
│   ├── app/
│   │   ├── api/            # API 路由
│   │   ├── utils/          # 工具函数
│   │   └── main.py         # 应用入口
│   ├── data/               # 数据存储目录
│   └── requirements.txt
├── docker-compose.yml       # Docker 编排文件
├── Dockerfile.frontend      # 前端 Docker 镜像
├── Dockerfile.backend       # 后端 Docker 镜像
└── README.md
```

## 开发环境搭建

### 前置要求

- Node.js 18+ 
- Python 3.8+
- pnpm (推荐) 或 npm
- Git

### 1. 克隆项目

```bash
git clone <repository-url>
cd K-line-replay
```

### 2. 后端开发环境

```bash
# 进入后端目录
cd backend

# 创建虚拟环境
python -m venv venv

# 激活虚拟环境
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

# 安装依赖
pip install -r requirements.txt

# 启动开发服务器
python app/main.py
```

后端服务将在 `http://localhost:8000` 启动

### 3. 前端开发环境

```bash
# 进入前端目录
cd frontend

# 安装依赖
pnpm install
# 或使用 npm
npm install

# 启动开发服务器
pnpm dev
# 或使用 npm
npm run dev
```

前端应用将在 `http://localhost:3000` 启动

## 生产环境部署

### 方式一：传统部署

#### 后端部署

```bash
cd backend

# 安装生产依赖
pip install -r requirements.txt

# 使用 Gunicorn 启动（推荐）
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000

# 或使用 Uvicorn
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

#### 前端部署

```bash
cd frontend

# 构建生产版本
pnpm build

# 启动生产服务器
pnpm start

# 或使用 PM2 管理进程
npm install -g pm2
pm2 start npm --name "k-line-frontend" -- start
```

### 方式二：Docker 部署（推荐）

#### 使用 Docker Compose（一键部署）

```bash
# 构建并启动所有服务
docker-compose up -d --build

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

#### 单独构建镜像

```bash
# 构建后端镜像
docker build -f Dockerfile.backend -t k-line-backend .

# 构建前端镜像
docker build -f Dockerfile.frontend -t k-line-frontend .

# 运行后端容器
docker run -d -p 8000:8000 --name k-line-backend k-line-backend

# 运行前端容器
docker run -d -p 3000:3000 --name k-line-frontend k-line-frontend
```

## Docker 配置说明

### 服务端口

- **前端**: `http://localhost:3000`
- **后端**: `http://localhost:8000`
- **API 文档**: `http://localhost:8000/docs`

### 环境变量

可以通过环境变量配置应用：

```bash
# 后端配置
API_HOST=0.0.0.0
API_PORT=8000
CORS_ORIGINS=http://localhost:3000

# 前端配置
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 数据持久化

Docker Compose 配置了数据卷来持久化 K 线数据：

```yaml
volumes:
  - ./backend/data:/app/data
```

## 开发指南

### API 接口

#### 获取 K 线数据

```http
GET /data?symbol=BTCUSDT&timeframe=1d,4h,1h&days=1000
```

参数说明：
- `symbol`: 交易对符号（如 BTCUSDT）
- `timeframe`: 时间周期数组
- `days`: 获取天数

### 前端开发

#### 添加新组件

```bash
# 在 src/components 目录下创建新组件
mkdir src/components/new-feature
touch src/components/new-feature/NewComponent.tsx
```

#### 状态管理

使用 Zustand 进行状态管理，store 文件位于 `src/store/` 目录。

#### 样式开发

项目使用 Tailwind CSS，配置文件为 `tailwind.config.js`。

### 后端开发

#### 添加新 API 路由

在 `backend/app/api/router.py` 中添加新的路由：

```python
@app.get('/new-endpoint')
async def new_endpoint():
    return {"message": "Hello World"}
```

#### 数据处理

数据处理相关工具函数位于 `backend/app/utils/` 目录。

## 常见问题

### 1. 端口冲突

如果端口被占用，可以修改以下配置：
- 前端：修改 `package.json` 中的 dev 脚本
- 后端：修改 `main.py` 中的端口配置

### 2. CORS 错误

确保后端 CORS 配置包含前端地址：

```python
allow_origins=["http://localhost:3000"]
```

### 3. 数据获取失败

检查网络连接和 CCXT 配置，确保能够访问交易所 API。

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 联系方式

如有问题或建议，请通过以下方式联系：

- 提交 Issue
- 发送邮件
- 加入讨论群

---

**注意**: 本项目仅用于学习和研究目的，不构成投资建议。使用本系统进行实际交易需要谨慎评估风险。