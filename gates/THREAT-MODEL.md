# THREAT MODEL · 闸门怎么被绕过、怎么拦

> 一句话：**provenance 只能证明“脚本真跑过”，不能证明“跑的是真测试”。** v2.2.1 把命令也锁上。

## 攻击面

| # | 攻击 | 例子 | 现在被谁拦 | 还漏什么 |
|---|---|---|---|---|
| 1 | 手写 JSON | 直接写 `{"gate":"tdd","exit_code":0}` | `verify-evidence`：缺 provenance / 哈希 | — |
| 2 | 篡改 JSON | 改真 JSON 的 `exit_code` | `verify-evidence`：payload 哈希不匹配 | — |
| 3 | 任意命令 | `gate-tdd --command "exit 0"` | `resolveCommand`：不在 package.json / 默认命令 → 拒绝；`--allow-arbitrary-command` 会写 `trusted:false`，verify 拒绝 | 改 `package.json` 的 scripts 本身 |
| 4 | mutation 任意命令 | `gate-mutation --command "exit 1"` | mutation 命令必须与 `gate-tdd` 相同 | 改 gate-mutation 脚本本身 |
| 5 | 变异成语法错误 | `--to "return ("` | 变异后 `node --check`；语法坏不算 caught | 非 JS 文件没有语法检查 |
| 6 | 变异测试文件 | `--file test/x.test.js` | 路径/文件名黑名单 | — |
| 7 | 改闸门脚本 | 改 `gates/gate-tdd.mjs` 直接写 JSON | **没有运行时拦截** | 靠 `git diff gates/` + 分支保护 + 人工审计；这是下一层 |
| 8 | 旧证据 | 20 天前的 tdd.json | 默认 7 天新鲜度；`--allow-stale` 显式放行 | 放行后仍可用，需人看 |
| 9 | 原样模板 | 复制 `templates/*` | 模板指纹 + 占位符检测 | 手填假内容仍可能过（语义靠人） |
| 10 | HTTP 白屏 | 200 但空页面 | `--expect-text` | 关键词选错会误判 |

## 三条原则

1. **机器能判的交给机器**：exit code、哈希、时间、命令来源。
2. **不能判的别假装能判**：内容对不对、需求真不真，最终靠人。
3. **闸门脚本本身是信任根**：`gates/` 应受保护（分支保护/只读/审计 diff）；否则上面全是纸。

## 推荐用法

```bash
# 正常路径：不传 --command，默认读 package.json
node gates/gate-tdd.mjs
node gates/gate-mutation.mjs --file src/x.js --from "旧值" --to "变异值"
node gates/verify-evidence.mjs --phase 5

# 确实要自定义：显式标记；verify 会拒绝
node gates/gate-tdd.mjs --command "custom-test" --allow-arbitrary-command

# 隔周回来：临时放行旧证据
node gates/verify-evidence.mjs --phase 5 --allow-stale --max-age-days 14
```
