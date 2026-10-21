---
name: xh-dev-loop
description: 一个人用 AI 做全栈项目的证据驱动闭环。十阶段、机器闸门 + 人的闸门、状态机、TDD/探索分型、失败回滚。适用于从 0 到上线，以及“AI 做完了但我没学会”的场景。
---

# XH Dev Loop（芯火开发闭环 v2）

> **先定问题，再搭台子，跑通一条线，按切片出证据，最后交出去并留下能维护的人。**
> 不是“让 AI 写完”，是“让每一步都有证据”。

## 它解决什么

v1 的病根：**有闸门，但闸门没牙。** 十个阶段里九个是“AI 自己打勾”。v2 把闸门换成**机器证据 + 人的证据**。

- 自评闸门 → `gates/*.json` 的 exit code
- 解决方案先行 → Phase 0 先做**问题证伪**
- TDD 强加给探索任务 → Phase 4 先**分型**
- 交付即失联 → Phase 9 的**解释关 + 无 AI 演练**
- 复盘变日记 → Phase 10 必须产出**流程 diff**
- 平台知识腐烂 → `platforms/` 带 `last_verified`
- 单文件 70 个 checkbox 跳读 → 阶段拆文件 + `state.json`

## 三条铁律

1. **机器能判的交给机器**：只看 exit code / JSON，不信“我测过了”。
2. **人必须留证据**：解释关（自己讲数据流）+ 无 AI 演练（关掉 AI 修一次）。
3. **复盘必须改流程**：没有 diff 的复盘是日记。

## 状态机（每次只读一个阶段）

```bash
node gates/state.mjs init
node gates/state.mjs show
node gates/state.mjs advance <phase> <pass|fail> <evidence-path>
```

`state.json` 只记：`current_phase / gate / evidence / updated_at`。换会话先 `show`。

## 阶段索引（按需读一个文件）

| # | 阶段 | 文件 | 机器闸门 | 人的闸门 |
|---|---|---|---|---|
| 0 | 聚焦 / 问题证伪 | `phases/00-focus.md` | `FOCUS.md` 六问 + 真实用户证据 | 能说出“谁、什么行为、什么信号放弃” |
| 1 | 搭环境 | `phases/01-environment.md` | `gate-check` 绿；`.env` 被拦 | 故意提交 `.env`，亲眼看它被拦 |
| 2 | 走通一条线 | `phases/02-skeleton.md` | `gate-http` 200 | 手机/另一台设备打开一次 |
| 3 | 写规格 | `phases/03-spec.md` | `gate-spec` | 把 spec 读给一个真实用户听 |
| 4 | 切片 + 分型 | `phases/04-slices.md` | `gate-slices` | 每片能说出“输入 X → 输出 Y”吗 |
| 5 | TDD / 探索 | `phases/05-tdd-or-spike.md` | `gate-tdd` + `gate-mutation` / `gate-spike` | 红得对、绿得真，自己讲一遍 |
| 6 | 证据闸门 | `phases/06-evidence.md` | `verify-evidence` | 解释关：不看代码讲数据流 |
| 7 | 验收 | `phases/07-acceptance.md` | `gate-http` + `gate-smoke` | 亲手点一遍，截图 |
| 8 | 部署 / 回滚 | `phases/08-deploy.md` | `gate-http` + `RUNBOOK.md` | 按 runbook 回滚一次（演练） |
| 9 | 交接 / 维护 | `phases/09-handoff.md` | `no-ai-drill.md` | 关掉 AI 修一个小 bug |
| 10 | 复盘 / 改流程 | `phases/10-retro.md` | `RETRO.md` + 流程 diff | 这次哪条流程没拦住 |

## 分型：先判断，再决定怎么测

进 Phase 5 前，对每个切片问一句：

> **我能写出“输入 X 应该输出 Y”吗？**

- **能** → `deterministic` → TDD：先写测试看红 → 实现变绿 → 破坏实验。
- **不能** → `exploratory` → 90 分钟 spike：只回答一个问题，**代码必须删掉**，只留 `SPIKE.md`。

> 写不出来还硬 TDD = 锁死随机猜测的假测试。

## 失败分支（三振）

- 同一任务失败 2 次 → **停**，回到 spec 重新切片，不许继续加提示。
- 失败 3 次 → `git checkout .` 回到上一个绿 commit，换思路。
- 高风险（认证/支付/生产数据/密钥）→ 必须人工确认 + 回滚预案，不许 AI 自主执行。

## 不依赖外部 skill

每个阶段文件里都有“手工版”。装了 Matt 的 skills 可以用 `references/` 里的映射加速；没装也能跑。

## 平台知识

`platforms/<name>.md` 只放易变事实（命令、价格、备案），顶部必须有：

```yaml
last_verified: 2026-10-20
source: <官方链接>
recheck: <复核命令/入口>
```

超过 90 天 → AI 必须先联网复核，并明确告诉用户“这条我没复核过”。

## 案例（只是产物，不是流程）

`examples/deploy-helper.md` 是“部署最后一公里助手”这个项目的复盘：它怎么套用本流程、哪里跳过了、哪里被卡住。**流程本身在 phases/，不在案例里。**

## 快速开始

```bash
node gates/state.mjs init
# 读 phases/00-focus.md，填 templates/FOCUS.md
# 按 state.json 的 current_phase 一次只读一个 phase 文件
```
