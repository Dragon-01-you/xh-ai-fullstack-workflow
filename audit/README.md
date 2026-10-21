# 可复现审计

一条命令，不需要外部服务：

```bash
node audit/run-audit.mjs
```

它做四组测试：

1. **模板原样**：把 `templates/` 的 7 个文件原样复制到临时项目 → 7 个内容闸门必须全部失败。
2. **填好内容**：复制 `audit/fixtures/filled/`（真实内容）→ 内容闸门 + 执行闸门 + `verify 0..10` 必须全部通过。
3. **手写 JSON**：只写 `{"gate":"tdd","exit_code":0}` → `verify --phase 5` 必须失败。
4. **篡改 JSON**：改真 JSON 的字段 → `verify --phase 5` 必须失败（哈希不匹配）。

本地 HTTP 闸门用一个临时服务器（127.0.0.1:随机端口）验证，不联网。

## 预期输出

```
PASS  模板原样:gate-requirements.mjs  exit=1  (expect fail)
...
PASS  填好内容:gate-http.mjs  exit=0  (expect pass)
...
=== 总结：44/44 通过，0 失败 ===
```

任何一行 `FAIL` 都会让脚本退出码为 1。

## 为什么要这个

上一轮审计是在沙盒里手搭项目；这个脚本把那次审计变成**可重复的一条命令**，后面任何 AI 改闸门，先跑它。
