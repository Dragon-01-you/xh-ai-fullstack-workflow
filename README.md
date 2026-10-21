# XH Dev Loop（芯火开发闭环）

> 一个人用 AI 做全栈项目的**证据驱动流程**：十个阶段，每个阶段都有机器闸门或人的闸门；不靠 AI 自己打勾。
> 它不是“部署最后一公里助手”那个项目的说明书；那个项目只是本流程的一个**案例**。

## 为什么有 v2

v1（`xh-ai-fullstack-workflow`）被评审指出一个病根：

> **有闸门，但闸门没牙。** 十个阶段里九个是“AI 自己打勾”，等于让考生自己判卷。

v2 的改动，按评审的杠杆排序：

| 病 | v2 的解法 |
|---|---|
| 闸门靠自评 | `gates/` 脚本产出 `.gates/*.json`（exit code / 变异是否被抓）；AI 无法伪造 exit code |
| 需求默认成立 | Phase 0 先做“问题证伪”：真实用户、可观察行为、最便宜实验、放弃信号 |
| TDD 硬套探索任务 | Phase 4 先分型：能写出“输入 X→输出 Y”才 TDD；不能就走 90 分钟 spike，代码必须删 |
| 交付即失联 | Phase 9 解释关 + 无 AI 演练：关掉 AI 修一次 |
| 复盘产散文 | Phase 10 必须产出**流程 diff**（改 SKILL/phases/gates），否则不算完 |
| 平台知识腐烂 | 平台事实外置到 `platforms/`，带 `last_verified`；超 90 天必须先复核 |
| 单文件 70 个勾会跳读 | SKILL.md 瘦身；阶段拆文件；`state.json` 只记一行状态 |
| 没有逃生舱 | 三振规则：2 次失败停、3 次回滚；高风险必须人工确认 |
| 外部依赖太重 | 每个 phase 都有“手工版”；Matt skills 只是加速器 |
| 没有 CI/回归 | Phase 7 的 smoke 命令可进 CI；验收证据可重跑 |

## 结构

```
xh-dev-loop/
├── SKILL.md                 # <100 行：原则 + 阶段索引 + 状态机
├── phases/                  # 10 个阶段，一次只读一个
├── gates/                   # 机器闸门（exit code / JSON 证据）
├── templates/               # FOCUS / SPEC / SLICES / EVIDENCE / RUNBOOK / RETRO
├── platforms/               # 易变平台知识，带 last_verified
├── manual/                  # 没有外部 skill 时的手工版
└── examples/                # deploy-helper 案例（产物，不是流程）
```

## 安装

把整个目录复制到你的 AI skills 目录：

```bash
# Claude Code / DSH
~/.agents/skills/xh-dev-loop/
# 或 Claude Code 专用
~/.claude/skills/xh-dev-loop/
```

或者不安装，直接让 AI 读 `SKILL.md` 的绝对路径。

## 快速开始

```bash
node gates/state.mjs init
node gates/state.mjs show
# 按 current_phase 读 phases/00-focus.md，填 templates/FOCUS.md
# 做完一个阶段，跑对应 gate，再 advance
```

## 闸门怎么用

| 闸门 | 命令 | 产物 |
|---|---|---|
| 环境 | `node gates/gate-check.mjs` | `.gates/check.json` |
| 规格 | `node gates/gate-spec.mjs --file SPEC.md` | `.gates/spec.json` |
| 切片 | `node gates/gate-slices.mjs --file SLICES.md` | `.gates/slices.json` |
| TDD | `node gates/gate-tdd.mjs --command "npm test"` | `.gates/tdd.json` |
| 破坏实验 | `node gates/gate-mutation.mjs --file src/x.js --from A --to B --command "npm test"` | `.gates/mutation.json` |
| 探索 | `node gates/gate-spike.mjs --file SPIKE.md` | `.gates/spike.json` |
| 外网 | `node gates/gate-http.mjs --url http://127.0.0.1:3000/health --expect-status 200` | `.gates/http.json` |
| 汇总 | `node gates/verify-evidence.mjs --phase <n>` | `.gates/verify-<n>.json` |

> 原则：**不看 AI 的报告，只看 exit code 和 JSON。**

## 案例

`examples/deploy-helper.md`：我们真实做的“部署最后一公里助手”。它是本流程的产物，不是流程本身；里面记录了哪些阶段跳过了、哪些被现实卡住。

## 与 v1 的关系

- v1：仓库 `xh-ai-fullstack-workflow` 的 `v1.1` 分支（保留作对照；它把部署项目当成了流程核心）
- v2：本仓库的 `v2` 分支（流程优先；部署项目只做案例）
