# gates · 机器闸门

> 原则：**不信 AI 的报告，只看 exit code 和 JSON。**
> 所有脚本只做一件事：运行命令/检查文件 → 写 `.gates/*.json` → 用退出码表态。

## 命令

```bash
node gates/state.mjs init
node gates/state.mjs show
node gates/state.mjs advance 1 pass .gates/stack.json

node gates/gate-requirements.mjs --file REQUIREMENTS.md
node gates/gate-stack.mjs --file STACK.md
node gates/gate-check.mjs
node gates/gate-guard.mjs
node gates/gate-spec.mjs --file SPEC.md
node gates/gate-slices.mjs --file SLICES.md
node gates/gate-tdd.mjs
node gates/gate-mutation.mjs --file src/x.js --from "旧值" --to "变异值"
node gates/gate-spike.mjs --file SPIKE.md
node gates/gate-http.mjs --url http://127.0.0.1:3000/health --expect-status 200
node gates/gate-explain.mjs --file EVIDENCE.md
node gates/gate-retro.mjs --file RETRO.md
node gates/verify-evidence.mjs --phase 5
```

## provenance（防手写 JSON）

每个 gate 写 JSON 时自动加：

```json
"provenance": {
  "script": "gates/gate-tdd.mjs",
  "version": "2.2.1",
  "command": "npm test",
  "command_source": "package.json",
  "trusted": true,
  "cwd": "...",
  "started_at": "…",
  "finished_at": "…",
  "exit_code": 0,
  "payload_sha256": "…"
}
```

`verify-evidence` 会检查：脚本名、版本、时间新鲜度（默认 7 天）、payload 哈希、`trusted:true`、tdd/mutation 命令一致。
手写一个只有 `exit_code:0` 的 JSON 过不了；`--command "exit 0"` 也过不了（命令锁定）。

## 命令锁定

- `gate-check` / `gate-tdd` 默认只读 `package.json` 的 `scripts.check` / `scripts.test`。
- 自定义命令必须加 `--allow-arbitrary-command`；它写 `trusted:false`，`verify-evidence` 拒绝。
- `gate-mutation` 的测试命令必须与 `gate-tdd` 完全相同。
- 绕过与拦截边界见 [`THREAT-MODEL.md`](THREAT-MODEL.md)。

## 退出码

- `0` = 通过；非 0 = 不通过。
- `.gates/*.json` 里保留：`exit_code`、`caught`、`ok`、命令、输出尾部、时间。
- `gate-mutation` 的通过条件是 `caught: true`（改坏后测试必须失败）；它自己负责恢复文件。

## 为什么 AI 不能伪造

- `gate-check` / `gate-tdd` 直接运行命令，exit code 由子进程返回。
- `gate-mutation` 直接改文件、跑测试、恢复；AI 只看到 JSON。
- 如果 AI 连脚本一起改：把 `gates/` 设为只读或单独保护；复盘时检查 `git diff gates/`。

## 安全

- `gate-mutation` 只允许改当前项目内的文件，且 `--from` 必须只出现一次。
- 所有脚本不联网（除了 `gate-http` 访问你给的 URL）。
