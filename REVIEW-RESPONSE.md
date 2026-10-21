# 对评审的回应（v2）

> 评审的核心结论：**有闸门，但闸门没牙。** v2 不增加阶段，先把“牙齿”装上。

| # | 评审点 | v2 的改动 | 落在哪 |
|---|---|---|---|
| 1 | 9/10 闸门是自评 | 自评闸门换成脚本证据：`gate-requirements / gate-stack / gate-check / gate-spec / gate-slices / gate-tdd / gate-mutation / gate-http / gate-spike / gate-retro`，全部写 `.gates/*.json`，用 exit code 表态 | `gates/` |
| 2 | 只关心交付，不关心人会 | Phase 6 解释关（不看代码讲数据流）+ Phase 9 无 AI 演练；`no-ai-drill.md` | `phases/06`、`phases/09` |
| 3 | 需求默认成立 | Phase 0 需求理解 + 问题证伪：真实用户、可观察行为、最便宜实验、放弃信号；`gate-requirements` 检查七问 + 用户证据 | `phases/00` |
| 4 | TDD 硬套探索任务 | Phase 4 分型：能写“输入 X→输出 Y”才 TDD；不能走 90 分钟 spike，代码必须删 | `phases/04`、`phases/05` |
| 5 | 复盘产散文 | Phase 10 必须产出流程 diff；`gate-retro` 检查 diff/补丁 | `phases/10` |
| 6 | 平台知识写死 | 平台事实外置到 `platforms/`，`last_verified` + `source` + `recheck`；超 90 天先复核 | `platforms/` |
| 7 | 单文件 70 个勾会跳读 | SKILL.md 瘦身；阶段拆文件；`state.json` 只记一行状态 | `SKILL.md`、`phases/`、`gates/state.mjs` |
| 8 | **流程顺序错（新增）** | 需求 → 选型 → 环境 → 规格 → 切片 → TDD/Spike → 证据 → 验收 → 部署；walking skeleton 放进 Phase 5，不是独立阶段 | `SKILL.md`、`phases/` |
| A | 没有逃生舱 | 三振规则：2 次失败停、3 次回滚；高风险人工确认 | `SKILL.md`、各 phase |
| B | 外部依赖太重 | 每个 phase 有手工版；`manual/README.md` | `manual/` |
| C | 没有上下文隔离 | 切片按 branch/worktree 做（phase 05 建议）；Phase 7 回归 | `phases/05` |
| D | 没有风险分级 | 低/中/高，高风险必须人工确认 + 回滚预案 | `phases/08` |
| E | 验收无 CI | Phase 7 的 smoke 命令可进 CI；`gate-http` 可重跑 | `phases/07` |
| F | 时间估算失真 | 每个 phase 的时间盒按真实范围写（不写“两小时全流程”） | `phases/` |

## 还没完全解决的（诚实清单）

- `gate-requirements` 只能检查“七问齐不齐 + 有没有证据文件”，**不能判断证据是真是假**；最终仍靠人。
- `gate-spec` 只能检查段落和验收条数，不能判断验收写得对不对。
- `gate-mutation` 只能做单字符串替换；复杂变异仍需人设计。
- 平台价格/政策仍可能过期；`last_verified` 只是提醒，不是自动复核。
- 没有内置 CI 模板；需要用户自己把 smoke 命令接到 GitHub Actions。

## 和 v1 最大的区别

v1：**流程是主角，部署项目是背景** → 实际写成了部署项目说明书。
v2：**流程是主角，部署项目只是 `examples/deploy-helper.md` 的一个案例**；核心在 `phases/` + `gates/`。
