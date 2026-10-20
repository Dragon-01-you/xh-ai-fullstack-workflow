# 01 · 搭环境 / 护栏（Phase 1）

> 工具：无专用 skill；写 `AGENTS.md` / `CLAUDE.md` 时可调用 **`writing-for-agents`**（Matt）——它规定了“给 agent 看的文档”该怎么写（短、地图、指针、无废话）。

> 目标：让 AI 有一个“不会跑偏、改坏能回滚、提交前自动检查”的场地。
> 时间：20–30 分钟。做完这一节，才允许写第一行业务代码。

## 1. Git 基线

```bash
git init -b main
git config user.name "your-name"
git config user.email "you@example.com"
```

`.gitignore`：

```gitignore
node_modules/
data/
.env
.env.*
!.env.example
*.log
coverage/
```

首次提交：

```bash
git add -A
git commit -m "chore: baseline"
```

> 有 GitHub 账号时，建私有仓库并 push：
> `gh repo create <name> --private --source . --remote origin --push`

## 2. 一键 check

`package.json`：

```json
{
  "scripts": {
    "test": "node --test",
    "check": "node scripts/syntax-check.js && node --test"
  }
}
```

`scripts/syntax-check.js`：遍历项目里的 `.js/.mjs/.cjs`，用 `node --check` 做语法检查；任何失败退出码 1。

**闸门**：`npm run check` 必须绿。

## 3. 提交拦截（物理红线）

`scripts/guard-staged.js`：在 commit 前检查暂存区：

- 拦 `.env`（`.env.example` 除外）
- 拦 `node_modules/`、`data/`、`.git/`
- 拦 `*.db/*.sqlite`、`id_rsa`、`*.pem`、`*.key`
- 拦 `sk-...`、`AKIA...`、`BEGIN PRIVATE KEY` 等密钥模式
- 测试目录/`*.test.js` 允许假密钥（否则测试没法验证扫描）

`.githooks/pre-commit`：

```sh
#!/bin/sh
node scripts/guard-staged.js || exit 1
npm run check || exit 1
```

启用：

```bash
git config core.hooksPath .githooks
```

**闸门**：故意 `git add .env && git commit`，必须被拦住。

## 4. AGENTS.md（<100 行）

四块就够：

```markdown
# AGENTS.md
## 项目一句话
## 项目地图（目录/关键文件）
## 命令（npm run check / npm start）
## 红线（不读 .env、不上传源码、不改测试、不无确认破坏性命令）
## 协作（决策我拍板、执行你来做、每步 RUNLOG 报点）
## 学习动作（先预测、结束复述、每晚输出）
```

`CLAUDE.md` 只写一行：`本项目规则在 AGENTS.md，开工先读它。`（不要两份规则）

## 5. PROGRESS.md（每天开场看）

```markdown
## 2026-10-20
- 做通了：
- 卡在：
- 明天第一条命令：
```

每天结束更新三行；第二天开场：`git status` → `npm run check` → 读它。

## 6. .env.example（只写键名）

```env
DB_PATH=data/app.db
PORT=3000
```

真实值放 `.env`，永远不进 git。

## Phase 1 完成清单

- [ ] git 基线 + 首次提交
- [ ] `.gitignore` 生效
- [ ] `npm run check` 绿
- [ ] 提交 `.env` 被拦截
- [ ] `AGENTS.md` / `CLAUDE.md` / `PROGRESS.md` / `.env.example` 就位

