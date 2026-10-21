# Phase 9 · 交接 / 维护（无 AI 演练）

> 目标：证明“离开 AI 你也能维护”。交付即失联，是流程缺陷，不是性格问题。

## 要交的东西

- `RUNBOOK.md`：启动/停止/日志/回滚/常见故障。
- `AGENTS.md` / `PROGRESS.md`：下一个人（或下一天的你）能接手。
- `EVIDENCE.md`：需求 ↔ 测试 ↔ 代码 ↔ 证据 ↔ 线上。
- 一个**无 AI 演练**记录：`no-ai-drill.md`。

## 无 AI 演练（必须做）

1. 关掉所有 AI。
2. 修一个小 bug，或加一个小需求（≤ 1 小时）。
3. 记录：改了什么、卡在哪、怎么解决的、花了多久。
4. 跑 `npm run check`，绿了才算。

## 机器闸门

```bash
node gates/gate-check.mjs --command "npm run check"
# .gates/check.json
```

## 人的闸门

- 不看 AI，能独立完成一次小改动。
- 能按 runbook 启动/回滚。
- 能解释数据流（Phase 6 的解释关）。

## 失败分支

- 无 AI 做不出来 → 说明还没学会；回 Phase 5/6，不要假装交付完成。
- runbook 缺步骤 → 补；下次演练必须成功。

## 时间盒

1 小时。
