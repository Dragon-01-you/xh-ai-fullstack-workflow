# Phase 2 · 搭环境 / 证据基础设施

> 目标：按 Phase 1 选好的栈，搭一个“不会跑偏、改坏能回、提交前自动检查、状态可恢复”的台子。
> **先搭台，再写业务。**

## 五层

| 层 | 动作 |
|---|---|
| 工作台 | 按选型装 Node/Python/数据库/编辑器；`node -v` |
| 存档 | `git init -b main`、`.gitignore`、首次提交、GitHub 私有仓库 |
| 门禁 | `npm run check`、`syntax-check.js`、`guard-staged.js`、pre-commit |
| 规则 | `AGENTS.md`、`CLAUDE.md`、`PROGRESS.md`、`.env.example`、`.nvmrc` |
| 状态 | `node gates/state.mjs init`（`state.json` 记录当前阶段） |

## 命令

```bash
git init -b main
# .gitignore: node_modules/ data/ .env *.log coverage/
npm run check          # 语法 + 测试
git config core.hooksPath .githooks
node gates/state.mjs init
```

## 机器闸门

```bash
node gates/gate-check.mjs --command "npm run check"
# 产物：.gates/check.json（exit_code 必须是 0）

node gates/gate-guard.mjs
# 产物：.gates/guard.json
# 检查：临时仓库里 stage .env 必须被拦；正常文件必须放行；core.hooksPath=.githooks
```

## 人的闸门（必须亲眼看）

```bash
echo "SECRET=1" > .env
git add .env
git commit -m "should be blocked"
# 必须被 guard 拦住；把输出存到 evidence/guard-block.txt
```

## 失败分支

- hook 没生效 → 检查 `git config core.hooksPath`。
- `check` 红 → 先修红，不写业务。
- 想跳过 hook → 不许 `--no-verify`；修规则或修代码。

## 时间盒

45–90 分钟。

## 手工版

没有脚本时：`node --check` 每个 JS 文件；提交前人工看 `git diff --cached --name-only`，确认没有 `.env`/`data/`/`node_modules/`。
