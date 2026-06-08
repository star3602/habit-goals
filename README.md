# Habit Goals 全栈目标打卡应用

这是一个可本地运行、也可正式上线的目标打卡项目。

- 前端：React + Vite + TypeScript + Tailwind CSS
- 后端：Node.js + Express + TypeScript
- 本地数据库：SQLite + Prisma
- 正式上线数据库：PostgreSQL + Prisma
- 鉴权：JWT，前端保存到 `localStorage`，请求头使用 `Authorization: Bearer <token>`

## 技术选择

- React + Vite：开发体验快，适合单页应用。
- Tailwind CSS：移动优先，样式清晰。
- Express：API 简洁，适合快速构建后端服务。
- Prisma：数据库模型清晰，迁移和类型支持好。
- SQLite：适合本地开发，无需单独安装数据库。
- PostgreSQL：适合正式上线，数据不会因为服务重启而丢失。

Firebase 替代方案：如果不想维护自建后端和 JWT，可以用 Firebase Auth + Firestore，但需要重新设计权限规则和前端数据访问方式。

## 目录结构

```txt
.
├─ client/                 # React + Vite 前端
├─ server/                 # Express + Prisma 后端
│  ├─ prisma/
│  │  ├─ schema.prisma             # 本地 SQLite schema
│  │  ├─ schema.postgres.prisma    # Railway/PostgreSQL schema
│  │  └─ migrations/               # PostgreSQL 生产迁移
│  └─ railway.json                 # Railway 部署配置
└─ README.md
```

## 本地开发

### 1. 安装依赖

```bash
npm run install:all
```

或分别安装：

```bash
cd server
npm install

cd ../client
npm install
```

### 2. 后端环境变量

复制：

```bash
cd server
cp .env.example .env
```

本地 `server/.env`：

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="replace-with-a-long-random-secret"
PORT=4000
CLIENT_ORIGIN="http://localhost:5173,http://127.0.0.1:5173"
```

### 3. 前端环境变量

复制：

```bash
cd client
cp .env.example .env
```

本地 `client/.env`：

```env
VITE_API_URL=""
```

开发环境建议留空，让 Vite 代理 `/api` 到 `http://localhost:4000`。

### 4. 初始化本地 SQLite 数据库

优先使用 Prisma：

```bash
cd server
npm run prisma:generate
npm run db:migrate
```

如果 Prisma schema engine 在 Windows 环境报空错误，可使用内置兜底脚本：

```bash
npm run db:init
```

### 5. 启动项目

终端 1 启动后端：

```bash
cd server
npm run dev
```

终端 2 启动前端：

```bash
cd client
npm run dev
```

打开：

```txt
http://localhost:5173
```

后端健康检查：

```txt
http://localhost:4000/api/health
```

## 测试

```bash
npm test
```

或分别运行：

```bash
cd server
npm test

cd client
npm test
```

## API curl 示例

后端本地地址：`http://localhost:4000`

### 注册

```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@example.com","password":"password123"}'
```

### 登录

```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@example.com","password":"password123"}'
```

### 新建目标

```bash
curl -X POST http://localhost:4000/api/goals \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"title":"每天阅读","description":"每天阅读 20 分钟"}'
```

### 获取目标列表

```bash
curl http://localhost:4000/api/goals \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 今日打卡

```bash
curl -X POST http://localhost:4000/api/goals/GOAL_ID/checkin \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 获取打卡历史

```bash
curl http://localhost:4000/api/goals/GOAL_ID/checkins \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 日期与时区

后端默认使用 UTC 日期存储 `Checkin.date`，格式为 `yyyy-mm-dd`：

```ts
new Date().toISOString().slice(0, 10)
```

如果产品需要按用户本地日历日打卡，建议在用户模型里增加 `timezone` 字段，后端按用户时区计算日期。

## 正式上线：Vercel + Railway + PostgreSQL

本项目本地继续使用 SQLite，正式部署时使用 PostgreSQL。

相关文件：

- `server/prisma/schema.prisma`：本地 SQLite schema
- `server/prisma/schema.postgres.prisma`：上线 PostgreSQL schema
- `server/prisma/migrations/20260609000000_init/migration.sql`：PostgreSQL 初始迁移
- `server/railway.json`：Railway 后端部署配置
- `client/vercel.json`：Vercel 前端部署配置

### 1. 上传到 GitHub

先把整个项目上传到 GitHub 仓库。Vercel 和 Railway 都从 GitHub 拉代码部署。

### 2. 部署后端到 Railway

1. Railway 新建 Project。
2. 选择 GitHub 仓库。
3. 添加 PostgreSQL 服务。
4. 新建后端服务，Root Directory 选择：

```txt
server
```

5. 设置后端环境变量：

```env
DATABASE_URL="${{Postgres.DATABASE_URL}}"
JWT_SECRET="请换成一串很长的随机密钥"
CLIENT_ORIGIN="https://你的前端域名.vercel.app"
```

Railway 会读取 `server/railway.json`，构建时执行：

```bash
npm run build:railway
```

启动时执行：

```bash
npm run deploy:start
```

其中 `deploy:start` 会自动执行 PostgreSQL 迁移：

```bash
prisma migrate deploy --schema prisma/schema.postgres.prisma
```

### 3. 部署前端到 Vercel

1. Vercel 新建 Project。
2. 选择同一个 GitHub 仓库。
3. Root Directory 选择：

```txt
client
```

4. 设置前端环境变量：

```env
VITE_API_URL="https://你的后端域名.up.railway.app"
```

5. 部署完成后，把 Vercel 的域名填回 Railway 后端的 `CLIENT_ORIGIN`。

### 4. 上线检查

先检查后端：

```txt
https://你的后端域名.up.railway.app/api/health
```

正常应返回：

```json
{"ok":true}
```

再打开前端：

```txt
https://你的前端域名.vercel.app/register
```

如果注册失败，优先检查：

- Railway 后端是否启动成功
- Railway 是否已绑定 PostgreSQL
- `DATABASE_URL` 是否来自 PostgreSQL
- `JWT_SECRET` 是否设置
- `CLIENT_ORIGIN` 是否等于 Vercel 前端域名
- Vercel 的 `VITE_API_URL` 是否等于 Railway 后端域名

