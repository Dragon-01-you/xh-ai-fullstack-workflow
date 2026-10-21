---
name: xh-dev-loop
description: 一个人用 AI 做全栈项目的证据驱动闭环。11 个阶段：需求 → 选型 → 环境 → 规格 → 切片 → TDD/Spike → 证据 → 验收 → 部署 → 交接 → 复盘。机器闸门 + 人的闸门，状态机，失败回滚。
---

# XH Dev Loop（芯火开发闭环 v2.1）

> **先弄懂需求，再选技术；先搭台，再写规格；先出考卷，再让 AI 答卷；最后交出去并留下能维护的人。**

## 顺序为什么是这样

```
需求 → 选型 → 环境 → 规格 → 切片 → TDD/Spike → 证据 → 验收 → 部署 → 交接 → 复盘
```

- 需求没懂，选型就是瞎选；选型没定，环境装错工具。
- 规格没写，测试没有“对错”标准；切片/分型没做，TDD 和探索会混。
- **walking skeleton 不是独立阶段**：它是 Phase 5 的第一个切片——本地页面→接口→数据→`/health`，**先写测试**，不是部署。
- 部署在验收之后；交接/复盘在部署之后。

## 三条铁律

1. **机器能判的交给机器**：只看 exit code / JSON，不信“我测过了”。
2. **人必须留证据**：解释关（自己讲数据流）+ 无 AI 演练（关掉 AI 修一次）。
3. **复盘必须改流程**：没有 diff 的复盘是日记。

## 状态机

```bash
node gates/state.mjs init
node gates/state.mjs show
node gates/state.mjs advance <phase> <pass|fail> <evidence-path>
```

`state.json` 只记 `current_phase / gate / evidence / updated_at`。换会话先 `show`。

## 阶段索引（一次只读一个文件）

| # | 阶段 | 文件 | 机器闸门 | 人的闸门 |
|---|---|---|---|---|
| 0 | 需求理解 + 证伪 | `phases/00-requirements.md` | `gate-requirements` | 和 1 个真实用户聊过 |
| 1 | 技术选型 | `phases/01-stack.md` | `gate-stack` | 能说出为什么不选另外两个 |
| 2 | 搭环境 | `phases/02-environment.md` | `gate-check` + `gate-guard` | 亲眼看 `.env` 被拦 |
| 3 | 写规格 | `phases/03-spec.md` | `gate-spec` | 把 spec 读给真实用户听 |
| 4 | 切片 + 分型 | `phases/04-slices.md` | `gate-slices` | 每片能说出“输入 X→输出 Y”吗 |
| 5 | TDD / Spike | `phases/05-tdd-or-spike.md` | `gate-tdd` + `gate-mutation` / `gate-spike` | 红得对、绿得真 |
| 6 | 证据闸门 | `phases/06-evidence.md` | `verify-evidence` + `gate-explain` | 解释关：不看代码讲数据流 |
| 7 | 验收 | `phases/07-acceptance.md` | `gate-http` | 亲手点一遍，截图 |
| 8 | 部署 / 回滚 | `phases/08-deploy.md` | `gate-http` + `RUNBOOK.md` | 按 runbook 回滚一次 |
| 9 | 交接 / 维护 | `phases/09-handoff.md` | `check` + `no-ai-drill.md` | 关掉 AI 修一个小 bug |
| 10 | 复盘 / 改流程 | `phases/10-retro.md` | `gate-retro` | 这次哪条流程没拦住 |

## 第一个切片：walking skeleton（在 Phase 5 里）

写好第一片验收后，先做一条最薄的本地闭环：

1. 先写测试：`/health` 返回 200、首页返回 200。
2. 跑 → **红**（服务还不存在）。
3. 写最小页面 + 最小接口 + 一次读写 → **绿**。
4. 本地验证；**不是部署**。部署在 Phase 8。

## 分型：先判断，再决定怎么测

进 Phase 5 前，对每个切片问一句：

> **我能写出“输入 X 应该输出 Y”吗？**

- **能** → `deterministic` → TDD：先写测试看红 → 实现变绿 → 破坏实验。
- **不能** → `exploratory` → 90 分钟 spike：只回答一个问题，**代码必须删掉**，只留 `SPIKE.md`。

## 失败分支（三振）

- 同一任务失败 2 次 → **停**，回 Phase 4 重新切片。
- 失败 3 次 → 先 `git stash` 或 WIP commit，再 `git reset --hard <last-green>`；不要直接清空工作区。
- 高风险（认证/支付/生产数据/密钥）→ 人工确认 + 回滚预案。

## 时间与最小路径

- 完整跑完约 **20 小时**（不含备案等待）。
- 最小可用路径：**0 → 1 → 2 → 3 → 4 → 5（第一片）→ 7 → 8**，约 8–10 小时；6/9/10 不能省，但可以最后补。
- 第一阶段别追求全绿：先跑通一条线，再补证据。

## 不依赖外部 skill

每个 phase 文件都有“手工版”；`manual/README.md` 是总表。Matt skills 只是加速器。

## 平台知识

`platforms/<name>.md` 只放易变事实；顶部必须有 `last_verified` / `source` / `recheck`。超 90 天 → 先复核，并告诉用户“这条我没复核过”。

## 案例（产物，不是流程）

`examples/deploy-helper.md` 是“部署最后一公里助手”的案例：怎么套本流程、哪里跳过了、哪里被卡住。**流程在 phases/，不在案例里。**

## 快速开始
```bash
node gates/state.mjs init
# 读 phases/00-requirements.md，填 templates/REQUIREMENTS.md
```
