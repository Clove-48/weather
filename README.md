# 智能天气助手

一个集成AI能力的智能天气查询应用，提供天气查询、AI生活建议、角色扮演天气播报等功能。

## 主要功能

### 🌤️ 天气查询
- 实时天气信息查询（温度、湿度、风速、风向等）
- 多城市天气查询支持
- 天气预报功能

### 🤖 AI智能建议
- 根据天气数据生成个性化生活建议
- 穿衣建议：根据温度和天气状况推荐合适衣物
- 出行建议：分析户外活动适宜性及注意事项
- 健康提示：根据湿度、温度等因素提供健康提醒

### 🎭 角色扮演天气播报
- 多种角色可选：傲娇猫咪、古风诗人、星际舰长、恐怖故事叙述者、呆萌机器人、美食家
- 自定义角色支持
- 以不同角色口吻播报天气信息

### 🖼️ 天气海报生成
- 多种风格海报：水彩风格、像素风格、浮世绘风格、赛博朋克风格、极简风格、动漫风格
- 基于天气数据动态生成海报

### ❤️ 收藏管理
- 收藏喜欢的城市
- 快速切换查看收藏城市天气

### 👤 用户系统
- 用户注册与登录
- 用户设置管理（温度单位、主题等）

## 技术栈

### 后端
- **框架**: FastAPI
- **数据库**: SQLite
- **认证**: JWT + OAuth2
- **AI服务**: DeepSeek API
- **天气数据**: OpenWeatherMap

### 前端
- **框架**: React 18 + TypeScript
- **构建工具**: Vite
- **路由**: React Router DOM
- **HTTP客户端**: Axios
- **3D效果**: Three.js

## 快速开始

### 环境要求
- Python 3.10+
- Node.js 18+

### 后端启动

```bash
cd weather-backend

# 创建虚拟环境（首次运行）
python -m venv venv

# 激活虚拟环境
venv\Scripts\activate

# 安装依赖
pip install -r requirements.txt -i https://mirrors.aliyun.com/pypi/simple/

# 启动服务
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### 前端启动

```bash
cd weather-frontend

# 安装依赖
npm install --registry=https://registry.npmmirror.com

# 启动开发服务器
npm run dev
```

### 访问地址
- 前端: http://localhost:5173
- 后端API文档: http://localhost:8000/docs

## API接口说明

### 认证接口

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/register` | POST | 用户注册 |
| `/api/login` | POST | 用户登录 |
| `/api/user/info` | GET | 获取用户信息 |

### 天气接口

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/weather/current?city={city}` | GET | 获取当前天气 |
| `/api/weather/advice?city={city}` | GET | 获取AI天气建议 |
| `/api/weather/advice/stream?city={city}` | GET | 流式AI建议 |

### 角色扮演接口

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/weather/roleplay/characters` | GET | 获取角色列表 |
| `/api/weather/roleplay?city={city}&character={character}` | GET | 获取角色扮演天气播报 |

### 海报接口

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/weather/poster/styles` | GET | 获取海报风格列表 |
| `/api/weather/poster?city={city}&style={style}` | GET | 生成天气海报 |

### 收藏接口

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/city/list` | GET | 获取收藏城市列表 |
| `/api/city/add` | POST | 添加收藏城市 |
| `/api/city/delete/{city_name}` | DELETE | 删除收藏城市 |

### 设置接口

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/setting/` | GET | 获取用户设置 |
| `/api/setting/update` | PUT | 更新用户设置 |

## 项目结构

```
weather-app/
├── weather-backend/          # 后端服务
│   ├── app/                  # 应用代码
│   │   ├── routes/           # 路由定义
│   │   │   ├── auth.py       # 认证路由
│   │   │   ├── weather.py    # 天气路由
│   │   │   ├── favorites.py  # 收藏路由
│   │   │   └── settings.py   # 设置路由
│   │   ├── main.py           # 应用入口
│   │   ├── database.py       # 数据库配置
│   │   ├── models.py         # 数据模型
│   │   ├── schemas.py        # 数据模式
│   │   ├── config.py         # 配置管理
│   │   ├── utils.py          # 工具函数
│   │   ├── ai_service.py     # AI服务
│   │   ├── weather_service.py # 天气服务
│   │   └── poster_service.py  # 海报服务
│   ├── venv/                 # 虚拟环境
│   ├── .env                  # 环境变量
│   └── requirements.txt      # 依赖列表
└── weather-frontend/         # 前端应用
    ├── src/
    │   ├── api/              # API接口封装
    │   ├── components/       # 组件
    │   ├── context/          # 上下文管理
    │   ├── pages/            # 页面
    │   ├── App.tsx           # 主应用
    │   └── main.tsx          # 入口文件
    ├── index.html
    ├── package.json
    └── vite.config.ts
```

## 配置说明

后端 `.env` 文件配置项：

```env
SECRET_KEY=your-secret-key          # JWT密钥
ALGORITHM=HS256                     # JWT算法
ACCESS_TOKEN_EXPIRE_MINUTES=30      # Token过期时间
OPENWEATHER_API_KEY=your-api-key    # OpenWeatherMap API密钥
DATABASE_URL=sqlite:///./weather.db # 数据库连接
AI_API_KEY=your-ai-api-key          # DeepSeek API密钥
AI_API_BASE_URL=https://api.deepseek.com # AI服务地址
AI_MODEL=deepseek-chat              # AI模型名称
```

## 使用说明

1. **注册账户**: 在登录页面点击注册，创建新账户
2. **登录系统**: 使用注册的账户登录
3. **查询天气**: 在首页搜索框输入城市名称
4. **查看建议**: 点击AI智能建议卡片查看详细建议
5. **角色扮演**: 选择喜欢的角色查看特色天气播报
6. **生成海报**: 选择风格生成天气海报
7. **收藏城市**: 点击收藏按钮添加到收藏列表

## 许可证

MIT License
