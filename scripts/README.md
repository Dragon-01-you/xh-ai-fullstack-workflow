# scripts · 护栏脚本

v2.2 把 v1 里最有价值的三件东西补回来了：

- `syntax-check.js`：遍历项目 `.js/.mjs/.cjs`，用 `node --check` 做语法检查。
- `guard-staged.js`：commit 前拦 `.env`、`node_modules/`、`data/`、数据库、私钥、疑似密钥；测试目录允许假密钥。
- `.githooks/pre-commit`：`guard-staged.js` + `npm run check`。

## 用法

```bash
cp -r scripts ./
mkdir -p .githooks
cp scripts/pre-commit .githooks/pre-commit
chmod +x .githooks/pre-commit
git config core.hooksPath .githooks
```

Windows 不需要 `chmod`；Git for Windows 会执行 sh 脚本。

## 验证

```bash
node gates/gate-guard.mjs
# 在临时仓库里 stage .env → 必须被拦；正常文件 → 必须放行
```
