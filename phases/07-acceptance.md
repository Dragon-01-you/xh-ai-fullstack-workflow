# Phase 7 · 验收

> 目标：你自己亲手用一遍，留下能复查的证据。**“测试通过”不算验收。**

## 步骤

1. 按 SPEC 的验收项逐条做（含失败路径）。
2. 每条留证据：截图 / curl 输出 / 录屏，放 `evidence/acceptance/`。
3. 填 `EVIDENCE.md`：需求 ↔ 测试 ↔ 代码 ↔ 手工证据 ↔ 线上行为。
4. 能自动的 smoke 写进脚本，交给 CI（没有 CI 就先每天手动跑）。

## 机器闸门

```bash
node gates/gate-http.mjs --url http://127.0.0.1:3000/health --expect-status 200
node gates/gate-http.mjs --url http://127.0.0.1:3000/ --expect-status 200
# .gates/http.json
```

## 人的闸门

- 你亲手点过每一条验收吗？
- 失败路径真的试过吗（空输入、重复提交、断网）？
- 换一台设备/手机打开过吗？

## 失败分支

- 有一条失败 → 写 bug 报告（现象/复现/预期/怀疑哪层），回 Phase 5。
- 证据缺失 → 不算验收完成。

## 时间盒

1–2 小时。

## 回归

每加一个新切片，重跑旧切片的关键 smoke；否则回归会在你不知道的时候断。
