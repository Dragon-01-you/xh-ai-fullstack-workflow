# 审计报告（可复现）

- 版本：v2.2.1
- 日期：2026-10-21
- 环境：Windows / Node v24.14.0
- 命令：`node audit/run-audit.mjs`
- 结果：**41/41 PASS，exit 0**

## 测试明细

| 组 | 测试 | 期望 | 实际 |
|---|---|---|---|
| 1 | 7 个模板原样复制 | 全部失败 | 7/7 exit 1 |
| 2 | 填好真实内容 | 全部通过 | 7/7 exit 0 |
| 3 | 执行闸门（check/tdd/mutation/guard/http） | 全部通过 | 5/5 exit 0 |
| 4 | `verify-evidence --phase 0..10` | 全部通过 | 11/11 exit 0 |
| 5 | 命令锁定：`gate-tdd --command "exit 0"` | 被拒 | exit 1 |
| 6 | `--allow-arbitrary-command` 放行但 `trusted:false` | 放行，verify 拒绝 | gate exit 0；verify exit 1 |
| 7 | mutation 命令与 tdd 不一致 | 被拒 | exit 1 |
| 8 | mutation 变异成语法错 | 被拒（不算 caught） | exit 1 |
| 9 | 手写 `tdd.json`（无 provenance） | 被拒 | exit 1 |
| 10 | 篡改真 `tdd.json`（哈希不匹配） | 被拒 | exit 1 |
| 11 | 恢复真 `tdd.json` | 通过 | exit 0 |

## 覆盖了什么

- **内容闸门**：模板指纹 / 占位符 / 分段字数 / 每条验收必须挂 `验证：` / 证据文件不能太小。
- **执行闸门**：子进程 exit code、`gate-mutation` 的 `caught:true`、`gate-guard` 在临时仓库真拦 `.env`。
- **命令锁定**：默认只读 `package.json` 的 `scripts.check` / `scripts.test`；`--command "exit 0"` 被拒；任意命令必须标记 `trusted:false`，verify 拒绝；mutation 命令必须与 tdd 相同。
- **mutation 防绕过**：变异成语法错不算 caught；禁止变异测试文件。
- **provenance**：脚本名、版本、命令来源、时间（默认 7 天）、payload 哈希；手写/篡改过不了。
- **TDD 主路径**：没有 `spike.json` 也能过 Phase 5/6。
- **HTTP**：本地随机端口临时服务器，验证 200 + `--expect-text`。
- **误报修复**：`示例`、`<200>` 这类正常词不会再触发红。

## 没覆盖（需要人/真实环境）

- 真实云平台部署（账号、支付、实名、备案）。
- 内容语义是否正确（脚本只能查“有没有填、有没有验证动作”）。
- `--rerun`（CI 里重跑 critical gates）还没内置。
- 风险分级目前只在文档层，没有独立 `gate-risk`。
- 改 `gates/` 脚本本身没有运行时拦截，靠 `git diff gates/` + 分支保护 + 人工审计。

## 复现

```bash
node audit/run-audit.mjs
```

任何一行 `FAIL` 都会让退出码变成 1。这个脚本就是上一轮“沙盒手动审计”的可重复版本。
