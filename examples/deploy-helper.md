# 案例：部署最后一公里助手（deploy-helper）

> **这是本流程的产物，不是流程本身。** 流程在 `phases/`；这里只记录“我们真实做的时候，哪些阶段走了、哪些跳过了、哪里被卡住”。

## 它是什么

帮“用 AI 写完项目、但别人访问不了”的小白：扫描项目 → 给 2–3 个方案 → 生成可执行步骤 → 验收外网可访问。

## 映射到本流程

| 阶段 | 实际做了什么 | 结果 |
|---|---|---|
| 0 需求理解 + 证伪 | 有产品蓝图 v2，但**没有 REQUIREMENTS.md、没有真实用户实验** | 🟠 缺失 |
| 1 技术选型 | `decisions/01-stack.md` 选了 Express + SQLite + Render；但没有 `STACK.md` 的候选对比/代价/何时改选 | 🟠 部分 |
| 2 搭环境 | git、GitHub、AGENTS/CLAUDE、check、guard、pre-commit、PROGRESS/RUNLOG/TRACE | ✅（但顺序在后） |
| 3 写规格 | SPEC.md S1–S5，含失败路径 S5；TRACE 五列 | ✅ |
| 4 切片 + 分型 | S1 扫描器 / S2 推荐 / S3 配置+部署计划；**没标 deterministic/exploratory** | 🟠 部分 |
| 5 TDD / Spike | **walking skeleton**（v0：静态页 + `/health` + `/api/plan` + SQLite，5/5 红→绿）；扫描器 T1–T6 红→绿→破坏实验；推荐 R1–R5；配置 C1–C3；共 19 tests | ✅（后半段） |
| 6 证据闸门 | `.gates` 不存在；只有 RUNLOG 里“我跑过了” | ❌ 自评 |
| 7 验收 | TRACE 里 S1/S2/S3/S5 还是 🟠（页面没亲手点） | 🟠 |
| 8 部署 / 回滚 | Render 卡外币卡 + GitHub sudo；CloudBase 静态托管展示页成功；没有回滚演练 | 🟠 部分 |
| 9 交接 / 无 AI | 无 runbook、无无 AI 演练 | ❌ 缺失 |
| 10 复盘 / 流程 diff | 有洞见/文章，但没有流程 diff | ❌ 缺失 |

## 真实时间线（git + RUNLOG）

- 18:20 v0 实现（5/5 红→绿）→ 这就是后来的 walking skeleton
- 18:24 cloudflared 隧道上线
- 20:44 baseline + 护栏
- 20:57 产品蓝图 v2
- 21:13 切片 1 扫描器（11/11 + 破坏实验）
- 21:15 切片 2 推荐（16/16）
- 21:19 切片 3 配置扫描 + 部署计划（19 tests）
- 21:55 Render blueprint
- 22:18–22:20 展示页 + CloudBase；补前置条件 spec

## 教训

1. **顺序反了**：我们先跑 v0、后补护栏/规格；参考流程应该是“需求 → 选型 → 环境 → 规格 → 切片 → TDD”。
2. **选型没留证据**：`decisions/01-stack.md` 只有“我选 A”，没有候选对比/代价；后来部署卡在 Render 外币卡，正是选型时没核对部署约束。
3. **walking skeleton 是开发，不是部署**：v0 在本机跑通，公网隧道是后面的事。
4. **自评闸门不可信**：RUNLOG 说“测过了”，但没有可复查的 JSON/exit code。
5. **TDD 只适合确定性切片**：扫描器/推荐是确定型，TDD 很顺；部署/平台选择是探索型，硬套会产出假测试。
6. **需求没证伪**：从头到尾没有一个真实用户参与。
7. **复盘没改流程**：洞见卡写了，但 SKILL 没变，下一次还会踩。

## 如果要重跑一遍

按 `phases/` 的顺序，把上面 🟠/❌ 的格子补上：先 Phase 0 找 1 个真实用户，Phase 1 写 `STACK.md` 并核对部署约束，Phase 5 用 walking skeleton 先写测试，Phase 6 用 `gates/verify-evidence.mjs`，Phase 8 前查外部环境，Phase 9 关 AI 演练，Phase 10 写流程 diff。
