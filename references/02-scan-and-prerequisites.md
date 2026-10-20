# 02 · 扫描与前置条件（Phase 2–3）

## 一、扫描：项目画像（只读）

> 只读文件名 + `package.json` + `.env.example` 的键名；不读源码正文、不联网、不上传。

### 1. 代码形态（只看本地代码特征）

| 形态 | 识别特征 | 说明 |
|---|---|---|
| A 纯静态 / SPA | 只有 HTML/CSS/JS；或有 `vite/vue/react` 构建脚本，无服务端监听 | 可放静态托管 |
| B 前后端 API | 有 `server.js`/`app.js` + `express/fastify/koa/hono` | 需要 Node 常驻 |
| B+ 同构元框架 | `next`（非 `output: export`）、`nuxt`、`streamlit`、`gradio` | 需要服务器实时渲染 |
| C 长连接 / Bot / 定时 | WebSocket、机器人、cron | 需要常驻，不能用一次性函数 |
| D GPU 模型 | `.gguf/.safetensors/.onnx`、`torch/cuda/vllm` | 需要 GPU |
| E 微服务 | 多个服务 + 队列/注册中心 + docker-compose/k8s | 个人项目劝退 |

### 2. 数据状态

- `local-file`：`.db/.sqlite`、`uploads/`、`better-sqlite3` → **无状态平台会丢数据**
- `cloud-db`：`pg`、`@neondatabase/serverless`、`mongodb`、`@supabase/supabase-js`
- `none`

### 3. AI 形态

- `gpu-model`：有模型权重文件
- `api`：只有 `openai` / `@anthropic-ai/sdk` 等 SDK
- `none`

### 4. 三条保命检查

| 检查 | 命中 | 风险码 |
|---|---|---|
| 前端藏密钥 | `.js/.tsx/.vue` 里出现 `sk-` / `API_KEY` | `FRONTEND_SECRET` |
| 本地数据 | `.db` / `uploads/` / `sqlite` 依赖 | `LOCAL_STATE` |
| GPU 模型 | `.gguf` / `.safetensors` | `GPU_MODEL` |

### 5. 配置扫描

- `.env.example` 里的键名（不读值）
- `.nvmrc` 的 Node 版本
- 锁文件（`package-lock.json` / `pnpm-lock.yaml` / `yarn.lock`）
- 已有部署配置（`render.yaml` 等）

**闸门**：能回答“我是什么项目、需要什么运行时、有什么风险”。

## 二、前置条件：先说明，再核对

> 顺序：**扫描 → 说明前置 → 核对有/没有 → 再推荐**。不要先推荐平台。

| # | 条件 | 为什么 | 没有怎么办 |
|---|---|---|---|
| 1 | 浏览器 + 控制通道 | 要真实登录/点击 | 固定一个浏览器（有头，不用无头） |
| 2 | 账号登录态 | 平台操作/OAuth | 先登录；OAuth 可能要 sudo/二次验证 |
| 3 | 支付方式 | 国外多要外币卡；国内要微信/支付宝 | 缺外币卡 → 换国内；缺国内支付 → 用免费额度 |
| 4 | 实名认证 | 国内云建站资源要实名 | 先做实名（身份证/人脸） |
| 5 | 域名与备案 | 国内正式域名需 ICP（3–20 天） | 验证期用测试域名 |
| 6 | 运行时匹配 | Express + SQLite 需要 Node 常驻 + 持久化 | 纯静态托管不行；要服务器/容器/云托管 |

### 国内外选择（先排除，再推荐）

```
能付外币卡吗？
├─ 能 → 国外：Render / Vercel / Cloudflare（注意国内访问与微信拦截）
└─ 不能 → 国内：腾讯云 / 阿里云（微信/支付宝）
      ├─ 有实名 + 愿按月付 → 轻量应用服务器（最直接跑 Node+SQLite）
      ├─ 有实名 + 按量/免费额度 → CloudBase 云托管 / 函数计算 FC
      └─ 没有实名 → 先实名，或先用测试域名/免费试用
```

### 平台选项（附直链）

| 平台 | 适合 | 门槛 | 链接 |
|---|---|---|---|
| 腾讯云 CloudBase 静态托管 | 纯前端展示页 | 实名；体验版可先用 | https://console.cloud.tencent.com/tcb |
| 腾讯云轻量应用服务器 | Node 常驻 + SQLite | 实名 + 微信/支付宝 | https://cloud.tencent.com/product/lighthouse |
| CloudBase 云托管 | 容器化后端 | 实名 + Dockerfile | https://cloud.tencent.com/product/tcb |
| 阿里云函数计算 FC | Serverless Node | 实名 + 按量 | https://www.aliyun.com/product/fc |
| Render | 国外 Node 托管 | **外币卡** + GitHub 授权 | https://dashboard.render.com/register |
| Vercel | 静态/Serverless | 免费，无需外币卡 | https://vercel.com/signup |
| Cloudflare Pages | 静态/Workers | 免费，无需外币卡 | https://pages.cloudflare.com/ |

**闸门**：六项都有明确结论（有/没有/怎么补），缺的不能推荐方案。

